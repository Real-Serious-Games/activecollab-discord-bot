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

async function listTasksForUser(
    activecollabApi: IActiveCollabAPI,
    mappingController: IMappingController,
    logger: Logger,
    discordUser: User
): Promise<RichEmbed> {

    let user: number;

    try {
        user = mappingController.getActiveCollabUser(discordUser.username + discordUser.tag);
    } catch (e) {
        logger.warn(`Error getting ActiveCollab user for Discord user ` 
            + ` ${discordUser.username + discordUser.tag}: ${e}`);
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
        .setTitle(`Tasks for <@${discordUser.id}>`)
        .setColor(eventColor);

    tasks.groupBy(t => t.project_id)
        .map(taskGroup => {
            const projectId = taskGroup[0].project_id;
            const project = projects.find(p => p.id === projectId);
            if (!project) {
                return none;
            }

            const body = taskGroup.reduce(
                (acc, curr) => acc + `• [${curr.name}](${curr.permalink})\n`, 
                ''
            );

            return some({
                title: project.name,
                body: body
            });
        })
        .forEach(m => m.map(
            summary => taskList.addField(summary.title, summary.body)
        ));

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
