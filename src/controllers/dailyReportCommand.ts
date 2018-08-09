import { Logger } from 'structured-log';
import * as discord from 'discord.js';
import { IActiveCollabAPI } from './activecollab-api';
import { ICommandController } from './command';
import * as ProjectTasks from '../models/projectTasks';
import * as userController from './userController';
import { IMappingController } from './mapping';

export async function dailyReport(
    projects: string[],
    eventColor: any,
    activeCollabApi: IActiveCollabAPI,
    logger: Logger,
    writeToCsv: (
        columNames: string[],
        rows: string[][],
        filename: string,
        logger: Logger
    ) => Promise<void>
): Promise<Array<discord.RichEmbed>> {

    const messages: discord.RichEmbed[] = [];

    for (const projectID of projects) {
        let taskData: ProjectTasks.TasksData;
        try {
            taskData = await activeCollabApi
                .getAssignmentTasksByProject(projectID);
        } catch (e) {
            const errorMsg = `Error getting tasks for project[${projectID}]`;
            logger.error(errorMsg + `: ${e}`);
            return [
                new discord.RichEmbed()
                    .setTitle(errorMsg)
                    .setColor(eventColor)
            ];
        }
        const tasks = taskData.tasks;
        const taskLists = taskData.task_lists.sort((a, b) => {
            if (a.position > b.position) {
                return 1;
            }
            if (a.position < b.position) {
                return -1;
            }
            return 0;
        });

        let messageField: string = '';

        const columns = [
            'Task List',
            'Remaining',
            'Total'
        ];

        const rows: string[][] = [];

        taskLists.forEach(list => {
            const listGroup = tasks
                .filter(t => t.task_list_id == list.id);

            let fullCount = listGroup
                .filter(t => t.total_subtasks === 0).length;
            listGroup.forEach(task => {
                fullCount += task.total_subtasks;
            });

            let remainingCount = listGroup
                .filter(t => t.total_subtasks === 0).length;
            listGroup.forEach(task => {
                remainingCount += task.open_subtasks;
            });

            rows.push(
                [list.name, remainingCount.toString(), fullCount.toString()]
            );

            messageField += (
                '```ini\n'
                + '[' + list.name + '] '
                + remainingCount + '/' + fullCount + '\n'
                + '```'
            );
        });

        await writeToCsv(
            columns,
            rows,
            `Spreadsheets/project-${projectID}-report.csv`,
            logger
        );
        const message = new discord.RichEmbed()
            .setTitle('')
            .setColor(eventColor)
            .addField(
                '**Remaining tasks for project: ' + projectID + '**',
                messageField
            )
            .attachFile(`Spreadsheets/project-${projectID}-report.csv`);
        messages.push(message);
    }

    return messages;
}

export async function dailyReportCommand(
    discordUser: discord.User,
    commandController: ICommandController,
    logger: Logger,
    message: discord.Message
): Promise<void> {
    message.channel.startTyping();
    message.channel.send('Generating report...');

    try {
        const projects = await userController.getSubscriptions(discordUser);
        if (projects.length > 0) {
            const embeds = await commandController.dailyReport(projects);
            embeds.forEach(embed => {
                message.channel.send(embed);
            });
        } else {
            message.channel.send('Not subscribed to any projects.');
            message.channel.send('Please use !dailyReport subscribe <id>');
        }

    } catch (e) {
        message.channel.send('There was an error generating the report');
        logger.error(`Error generating report ` + e);
    }
    message.channel.stopTyping();
}

export async function reportSubscribeCommand(
    projectID: string,
    logger: Logger,
    message: discord.Message
): Promise<void> {
    message.channel.startTyping();
    message.channel.send(`Subscribing to project: ` + projectID);
    try {
        await userController.addSubscription(message.author, projectID);
    } catch (e) {
        message
            .channel
            .send('There was an error subscribing to the project');
        logger.error(`Error subscribing from the project ` + e);
    }
    message.channel.stopTyping();
}

export async function reportUnsubscribeCommand(
    projectID: string,
    logger: Logger,
    message: discord.Message
): Promise<void> {
    message.channel.startTyping();
    message.channel.send(`Unsubscribing to project: ` + projectID);
    try {
        await userController.rmSubscription(message.author, projectID);
    } catch (e) {
        message
            .channel
            .send('There was an error unsubscribing from the project');
        logger.error(`Error unsubscribing from the project ` + e);
    }
    message.channel.stopTyping();
}

export const dailyReportParseCommand = (
    args: string[],
    commandController: ICommandController,
    mappingController: IMappingController,
    logger: Logger,
    message: discord.Message
) => {
    if (args.length === 2 && args[0].toLowerCase() === 'subscribe') {
        const projectNumber = parseInt(args[1]);
        if (projectNumber) {
            try {
                if (
                    mappingController.getChannels(projectNumber).length > 0
                ) {
                    reportSubscribeCommand(
                        projectNumber.toString(),
                        logger,
                        message
                    );
                }
            } catch (error) {
                message.channel
                    .send('Invalid project ID. '
                        + 'Please use !listProjects to see valid project IDs');
            }
        }
    }
    else if (args.length === 2 && args[0].toLowerCase() === 'unsubscribe') {
        const projectNumber = parseInt(args[1]);
        if (projectNumber) {
            try {
                if (
                    mappingController.getChannels(projectNumber).length > 0
                ) {
                    reportUnsubscribeCommand(
                        projectNumber.toString(),
                        logger,
                        message
                    );
                }
            } catch (error) {
                message.channel
                    .send('Invalid project ID. '
                        + 'Please use !listProjects to see valid project IDs');
            }
        }
    }
    else if (args.length === 0) {
        dailyReportCommand(message.author, commandController, logger, message);
    }
    else {
        // return some sort of help
        message.channel
            .send('Invalid syntax. Please enter projects to subscribe to');
        message.channel.send('Eg: !dailyReport subscribe <ID>');
    }
};
