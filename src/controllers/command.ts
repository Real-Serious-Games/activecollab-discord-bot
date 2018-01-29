import { Logger } from 'structured-log';

import { Message, RichEmbed, User } from 'discord.js';
import { Assignment } from '../models/report';
import { Project } from '../models/project';
import { IActiveCollabAPI } from '../controllers/activecollab-api';
import { IMappingController } from '../controllers/mapping';
import { parse } from 'url';

const eventColor = '#449DF5';

interface IProjectDictionary {
    [key: number]: Array<Assignment>;
}

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
        return new RichEmbed()
        .setTitle(`Unable to find user: <@${discordUser.id}>`)
        .setColor(eventColor);
    }

    let tasks: Array<Assignment>;
    let projects: Array<Project>;

    try {
        tasks = await activecollabApi.getAssignmentTasksByUserId(user);
        projects = await activecollabApi.getAllProjects();
    } catch (e) {
        logger.warn(e);
        return new RichEmbed()
            .setTitle(`There was an error getting tasks for <@${discordUser.id}>`)
            .setColor(eventColor);
    }

    if (tasks.length < 1) {
        return new RichEmbed()
            .setTitle(`No tasks for <@${discordUser.id}>`)
            .setColor(eventColor);
    }

    if (projects.length < 1) {
        return new RichEmbed()
            .setTitle(`A project needs to exist to get tasks`)
            .setColor(eventColor);
    }

    const taskList = new RichEmbed()
        .setTitle(`Tasks for <@${discordUser.id}>`)
        .setColor(eventColor);

    const projectsDictionary: IProjectDictionary = { };

    // Populate a dictionary with project ID as the key and an array
    // of tasks as the value
    tasks.forEach(task => {
        if (projectsDictionary[task.project_id] == undefined) {
            projectsDictionary[task.project_id] = [ task ];
        } else {
            projectsDictionary[task.project_id].push(task);
        }
    });

    // For each project create a field with the project name as the title
    // and the last of tasks as the body
    for (const p in projectsDictionary) {
        const project = projects.find(project => project.id === parseInt(p));
        let value = '';

        if (project != undefined) {
            projectsDictionary[p].forEach(task => {
                value += `• [${task.name}](${task.permalink})\n`;
            });

            taskList.addField(project.name, value);
        }
    }

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
