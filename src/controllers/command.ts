import { Logger } from 'structured-log';
import * as _ from 'lodash';
import * as moment from 'moment';

import { Message, RichEmbed, User, RichEmbedOptions } from 'discord.js';
import { Assignment } from '../models/report';
import { Project } from '../models/project';
import { IActiveCollabAPI } from '../controllers/activecollab-api';
import { IMappingController } from '../controllers/mapping';
import { parse } from 'url';
import { filteredTasks } from './spreadsheetCommand';

export interface ICommandController {
    tasksForUser: (user: User) => Promise<RichEmbed>;
    tasksInListForProject: (column: string, projectId: number) => Promise<RichEmbed>;
    tasksDueThisWeekForProject: (projectId: number) => Promise<RichEmbed>;
    createTask: (projectId: number, taskName: string) => Promise<void>;
    filteredTasks: (
        nameFilters: string[],
        projectFilters: string[],
        startDate: string,
        endDate: string
    ) => Promise<RichEmbed>;
}

const eventColor = '#449DF5';
const maxFieldLength = 1024;

async function createTask(
    activeCollabApi: IActiveCollabAPI,
    logger: Logger,
    projectId: number,
    taskName: string
): Promise<void> {
    await activeCollabApi.createTask(projectId, taskName);
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
        logger.error(`Error getting ActiveCollab user for Discord user `
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
        logger.error(`Error getting tasks and projects: ${e}`);
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

            const currentChars = 0;

            determineFormattedFields(
                taskGroup,
                formattedTasks,
                currentChars,
                project.name,
                t => (`• [${t.name}](${t.permalink})\n`),
                t => ((t + project.name).length)
            );
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
        logger.error(`Error getting tasks: ${e}`);
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
            const currentChars = 0;

            determineFormattedFields(
                taskGroup,
                formattedTasks,
                currentChars,
                taskGroup[0].task_list,
                t => (`• [${t.name}](${t.permalink})`
                    + ` - ${moment.unix(t.due_on).format('ddd Do')}\n`),
                t => ((t + taskGroup[0].task_list).length)
            );
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
        logger.error(`Error getting tasks: ${e}`);
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
            const currentChars = 0;

            determineFormattedFields(
                taskGroup,
                formattedTasks,
                currentChars,
                `${taskGroup[0].task_list} Tasks`,
                t => (`• [${t.name}](${t.permalink})\n`),
                t => ((t + taskGroup[0].task_list).length)
            );
        });

    return formattedTasks;
}

function determineFormattedFields(
    taskGroup: Assignment[],
    formattedTasks: RichEmbed,
    currentChars: number,
    title: string,
    formatTask: (t: Assignment) => string,
    calculateChars: (t: string) => number,
) {
    taskGroup.forEach(t => {
        const task = formatTask(t);
        const newLength = currentChars + task.length;

        if (formattedTasks.fields !== undefined
            && formattedTasks.fields.length > 0
            && currentChars !== 0 // If characters is 0 we're doing a new task list
            && newLength <= maxFieldLength
        ) {
            currentChars = newLength;

            formattedTasks.fields[formattedTasks.fields.length - 1].value += task;
        } else {
            currentChars = calculateChars(task);
            formattedTasks.addField(title, task);
        }
    });
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
        createTask: (projectId: number, taskName: string) =>
            createTask(activeCollabApi, logger, projectId, taskName),
        filteredTasks: (
            nameFilters: string[],
            projectFilters: string[],
            startDate: string,
            endDate: string
        ) =>
            filteredTasks(
                nameFilters,
                projectFilters,
                startDate,
                endDate,
                eventColor,
                activeCollabApi,
                logger
            )
    };
}
