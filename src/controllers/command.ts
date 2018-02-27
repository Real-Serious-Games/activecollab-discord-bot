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
    tasksForUser: (user: User) => Promise<RichEmbed>;
    tasksInListForProject: (column: string, projectId: number) => Promise<RichEmbed>;
    tasksDueThisWeekForProject: (projectId: number) => Promise<RichEmbed>;
    addTask: (projectId: number, taskName: string) => Promise<RichEmbed>;
}

const eventColor = '#449DF5';
const maxFieldLength = 1024;

async function addTask(
    activeCollabApi: IActiveCollabAPI,
    mappingController: IMappingController,
    logger: Logger,
    projectId: number,
    taskName: string
): Promise<RichEmbed> {
    throw 'not implemented';
}

async function tasksForUser(
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
            .filter(t => t.due_on !== null)
            .filter(t => t.project_id === projectId)
            .filter(t => 
                moment.unix(t.due_on)
                    .isBetween(
                        moment().startOf('week'),
                        moment().endOf('week'),
                        'day',
                        '[]'
                ));
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

    tasks
        .groupBy(t => t.task_list)
        .forEach(taskGroup => {
            let currentChars = 0;

            taskGroup.forEach(t => { 
                const task = `• [${t.name}](${t.permalink})` 
                    + ` - ${moment.unix(t.due_on).format('ddd Do')}\n`;
                const newLength = currentChars + task.length;

                if (formattedTasks.fields !== undefined 
                    && formattedTasks.fields.length > 0 
                    && currentChars !== 0 // If characters is 0 we're doing a new task list
                    && newLength <= maxFieldLength
                ) {
                    currentChars = newLength;

                    formattedTasks.fields[formattedTasks.fields.length - 1].value += task;
                } else {
                    currentChars = (task + taskGroup[0].task_list).length;
                    formattedTasks.addField(taskGroup[0].task_list, task);
                }
            });
        });

    return formattedTasks;
}

async function tasksInListForProject(
    activeCollabApi: IActiveCollabAPI,
    logger: Logger,
    list: string,
    projectId: number
): Promise<RichEmbed> {

    let tasks: _.LoDashImplicitArrayWrapper<Assignment>;

    try {
        tasks = _(await activeCollabApi.getAllAssignmentTasks())
            .filter(t => t.project_id === projectId)
            .filter(t => t.task_list.toLowerCase() === list.toLowerCase());

    } catch (e) {
        logger.warn(`Error getting tasks: ${e}`);
        return new RichEmbed()
            .setTitle(`There was an error getting tasks.`)
            .setColor(eventColor);
    }

    if (tasks.size() < 1) {
        return new RichEmbed()
            .setTitle(`No tasks found for task list: ${list}.`)
            .setColor(eventColor);
    }

    const headTask = tasks.head() as Assignment;

    const formattedTasks = new RichEmbed()
        .setColor(eventColor);

    tasks
        .groupBy(t => t.task_list)
        .forEach(taskGroup => {
            let currentChars = 0;

            taskGroup.forEach(t => { 
                const task = `• [${t.name}](${t.permalink})\n`;
                const newLength = currentChars + task.length;

                if (formattedTasks.fields !== undefined 
                    && formattedTasks.fields.length > 0 
                    && currentChars !== 0 // If characters is 0 we're doing a new task list
                    && newLength <= maxFieldLength
                ) {
                    currentChars = newLength;

                    formattedTasks.fields[formattedTasks.fields.length - 1].value += task;
                } else {
                    currentChars = (task + taskGroup[0].task_list).length;
                    formattedTasks.addField(`${taskGroup[0].task_list} Tasks`, task);
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
        tasksForUser: (u: User) => 
            tasksForUser(activeCollabApi, mappingController, logger, u),
        tasksDueThisWeekForProject: (projectId: number) => 
            tasksDueThisWeekForProject(activeCollabApi, logger, projectId),
        tasksInListForProject: (list: string, projectId: number) => 
            tasksInListForProject(activeCollabApi, logger, list, projectId),
        addTask: (projectId: number, taskName: string) => 
            addTask(activeCollabApi, mappingController, logger, projectId, taskName)
    };
}