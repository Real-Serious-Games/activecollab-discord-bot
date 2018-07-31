import { Logger } from 'structured-log';
import * as Excel from 'exceljs';
import * as _ from 'lodash';

import * as discord from 'discord.js';
import { IActiveCollabAPI } from './activecollab-api';
import { ICommandController } from './command';
import { Assignment, Report } from '../models/report';
import * as ProjectTasks from '../models/projectTasks';

export async function dailyReport(
    projects: string[],
    eventColor: any,
    activeCollabApi: IActiveCollabAPI,
    logger: Logger
): Promise<discord.RichEmbed> {
    const message = new discord.RichEmbed();
    message
        .setTitle('Tasks for project: ' + projects)
        .setColor(eventColor);
    for (const projectID of projects) {
        let tasks: _.LoDashImplicitArrayWrapper<ProjectTasks.Task>;
        try {
            tasks = _(await activeCollabApi.getAssignmentTasksByProject(projectID));
        } catch (e) {
            logger.error(`Error getting tasks: ${e}`);
            return new discord.RichEmbed()
                .setTitle(`There was an error getting tasks.`)
                .setColor(eventColor);
        }

        tasks.groupBy(t => t.task_list_id).forEach(listGroup => {
            let fullCount = listGroup.filter(t => t.total_subtasks === 0).length;
            listGroup.forEach(task => {
                fullCount += task.total_subtasks;
            });

            let remainingCount = listGroup.filter(t => t.total_subtasks === 0).length;
            listGroup.forEach(task => {
                remainingCount += task.open_subtasks;
            });

            message.addField('Project: ' + projectID,
                remainingCount + '/' + fullCount
            );
        });
    }

    return message;
}

export async function dailyReportCommand(
    commandController: ICommandController,
    logger: Logger,
    message: discord.Message
): Promise<void> {
    message
        .channel
        .send(`Getting tasks... (This may take a while)`);

    try {
        message
            .channel
            .startTyping();

        message
            .channel
            .send(await commandController.dailyReport(['14']));
    } catch (e) {
        message
            .channel
            .send('There was an error creating the spreadsheet');
        logger.error(`Error getting tasks for spreadsheet ` + e);
    }
}

export const dailyReportParseCommand = (
    args: string[],
    commandController: ICommandController,
    logger: Logger,
    message: discord.Message
) => {
    dailyReportCommand(commandController, logger, message);
};
