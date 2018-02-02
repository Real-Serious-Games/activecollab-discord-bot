import { Logger } from 'structured-log';
import * as _ from 'lodash';
import * as moment from 'moment';

import { Message, RichEmbed, User } from 'discord.js';
import { Assignment } from '../models/report';
import { Project } from '../models/project';
import { IActiveCollabAPI } from '../controllers/activecollab-api';
import { IMappingController } from '../controllers/mapping';
import { parse } from 'url';

export interface ICommandController {
    listTasksForUser: (user: User) => Promise<RichEmbed>;
    tasksDueThisWeekForProject: (projectId: number) => Promise<RichEmbed>;
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

    const formattedTasks = new RichEmbed()
        .setTitle(`Tasks for ${discordUser.username}`)
        .setColor(eventColor);

    tasks
        .groupBy(t => t.project_id)
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

                if (formattedTasks.fields !== undefined 
                    && formattedTasks.fields.length > 0 
                    && currentChars !== 0 // If characters is 0 we're doing a new project
                    && newLength <= maxFieldLength
                ) {
                    currentChars = newLength;

                    formattedTasks.fields[formattedTasks.fields.length - 1].value += task;
                } else {
                    currentChars = (task + project.name).length;
                    formattedTasks.addField(project.name, task);
                }
            });
        });

    return formattedTasks;
}

async function tasksDueThisWeekForProject(
    activeCollabApi: IActiveCollabAPI,
    logger: Logger,
    projectId: number
): Promise<RichEmbed> {

    let tasks: _.LoDashImplicitArrayWrapper<Assignment>;

    try {
        tasks = _(await activeCollabApi.getAllAssignmentTasks())
            .filter(t => 
                t.project_id === projectId 
                && moment(t.due_on) <= moment().endOf('week') 
                && moment(t.due_on) >= moment().startOf('week') 
            );
    } catch (e) {
        logger.warn(`Error getting tasks: ${e}`);
        return new RichEmbed()
            .setTitle(`There was an error getting tasks.`)
            .setColor(eventColor);
    }

    if (tasks.size() < 1) {
        return new RichEmbed()
            .setTitle(`No tasks found that are due this week.`)
            .setColor(eventColor);
    }

    const formattedTasks = new RichEmbed()
        .setTitle(`Tasks due this week`)
        .setColor(eventColor);

    await tasks
        .groupBy(t => t.task_list_id)
        .forEach(async taskGroup => {
            const taskListId = taskGroup[0].task_list_id;
            let taskList = '';

            try {
                taskList = await activeCollabApi.getTaskListNameById(projectId, taskListId);
            } catch (e) {
                logger.warn(`Error getting task list name for id ${taskListId}: ${e}`);
                formattedTasks.addField('Warning', `There was a problem getting `
                    + ` the task list name for tasks in the same list as ` 
                    + `${taskGroup[0].name}`);
                    return;
            }
            
            let currentChars = 0;

            taskGroup.forEach(t => { 
                const task = `• [${t.name}](${t.permalink}` 
                    + ` - ${moment(t.due_on).format('ddd Do')}\n`;
                const newLength = currentChars + task.length;

                if (formattedTasks.fields !== undefined 
                    && formattedTasks.fields.length > 0 
                    && currentChars !== 0 // If characters is 0 we're doing a new task list
                    && newLength <= maxFieldLength
                ) {
                    currentChars = newLength;

                    formattedTasks.fields[formattedTasks.fields.length - 1].value += task;
                } else {
                    currentChars = (task + taskList).length;
                    formattedTasks.addField(taskList, task);
                }
            });
        });

    return formattedTasks;
}

export function createCommandController(
    activeCollabApi: IActiveCollabAPI,
    mappingController: IMappingController,
    logger: Logger
) {
    return {
        listTasksForUser: (u: User) => 
            listTasksForUser(activeCollabApi, mappingController, logger, u),
        tasksDueThisWeekForProject: (projectId: number) => 
            tasksDueThisWeekForProject(activeCollabApi, logger, projectId)
    };
}
