import { Logger } from 'structured-log';

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

    // Sort tasks by project so they can be grouped by project
    tasks = tasks.sort((a, b) => a.project_id - b.project_id);

    // Project name for current group of tasks
    let currentTitle = '';
    let currentProject = tasks[0].project_id;
    // Group of tasks
    let currentBody = '';

    tasks.forEach(task => {
        // If the current task is part of a different project group to the last one
        // finalise the group and setup for next group
        if (currentProject !== task.project_id) {
            taskList.addField(currentTitle, currentBody);

            currentBody = '';
            currentTitle = '';
            currentProject = task.project_id;
        }

        // Get the project name 
        if (currentTitle === '') {
            const project = projects.find(project => project.id === task.project_id);
            if (project !== undefined) {
                currentTitle = project.name;
            }
        }

        // Update body with formatted task, if the title is empty it means a 
        // project wasnt found for the task so disregard
        if (currentTitle !== '') {
            currentBody += `• [${task.name}](${task.permalink})\n`;
        }
    });

    // Add last task group
    if (currentTitle !== '' && currentBody !== '') {
        taskList.addField(currentTitle, currentBody);
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
