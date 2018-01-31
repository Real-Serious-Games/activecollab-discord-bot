import { Logger } from 'structured-log';
import * as _ from 'lodash';
import { none, some } from 'fp-ts/lib/Option';

import { Message, RichEmbed, User } from 'discord.js';
import { Assignment } from '../models/report';
import { Project } from '../models/project';
import { IActiveCollabAPI } from '../controllers/activecollab-api';
import { IMappingController } from '../controllers/mapping';
import { parse } from 'url';

export interface ICommandController {
    listTasksForUser: (user: User) => Promise<RichEmbed>;
}

const eventColor = '#449DF5';
const maxFieldLength = 1024;

async function listTasksForUser(
    activecollabApi: IActiveCollabAPI,
    mappingController: IMappingController,
    logger: Logger,
    discordUser: User
): Promise<RichEmbed> {

    let user: number;

    try {
        user = mappingController.getActiveCollabUser(discordUser.tag);
    } catch (e) {
        logger.warn(`Error getting ActiveCollab user for Discord user ` 
            + ` ${discordUser.tag}: ${e}`);
        return new RichEmbed()
            .setTitle(`Unable to find user: <@${discordUser.id}>`)
            .setColor(eventColor);
    }

    let tasks: _.LoDashImplicitArrayWrapper<Assignment>;
    let projects: _.LoDashImplicitArrayWrapper<Project>;

    try {
        tasks = _(await activecollabApi.getAssignmentTasksByUserId(user));
        projects = _(await activecollabApi.getAllProjects());
    } catch (e) {
        logger.warn(`Error getting tasks and projects: ${e}`);
        return new RichEmbed()
            .setTitle(`There was an error getting tasks for <@${discordUser.id}>`)
            .setColor(eventColor);
    }

    if (tasks.size() < 1) {
        return new RichEmbed()
            .setTitle(`No tasks for <@${discordUser.id}>`)
            .setColor(eventColor);
    }

    if (projects.size() < 1) {
        return new RichEmbed()
            .setTitle(`A project needs to exist to get tasks`)
            .setColor(eventColor);
    }

    const taskList = new RichEmbed()
        .setTitle(`Tasks for ${discordUser.username}`)
        .setColor(eventColor);

    tasks.groupBy(t => t.project_id)
        .forEach(taskGroup => {
            const projectId = taskGroup[0].project_id;
            const project = projects.find(p => p.id === projectId);
            if (!project) {
                return;
            }

            let currentChars = 0;

            taskGroup.forEach(t => { 
                const task = `• [${t.name}](${t.permalink})\n`;
                const newLength = currentChars + task.length;

                if (taskList.fields !== undefined 
                    && taskList.fields.length > 0 
                    && currentChars != 0 
                    && newLength <= maxFieldLength
                ) {
                    currentChars = newLength;

                    taskList.fields[taskList.fields.length - 1].value += task;
                } else {
                    currentChars = (task + project.name).length;
                    taskList.addField(project.name, task);
                }
            });
        });

    return taskList;
}

export function createCommandController(
    activecollabApi: IActiveCollabAPI,
    mappingController: IMappingController,
    logger: Logger
) {
    return {
        listTasksForUser: (u: User) => listTasksForUser(activecollabApi, mappingController, logger, u)
    };
}
