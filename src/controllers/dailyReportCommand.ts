import { Logger } from 'structured-log';
import * as discord from 'discord.js';
import * as fs from 'fs';
import { IActiveCollabAPI } from './activecollab-api';
import { ICommandController } from './command';
import * as ProjectTasks from '../models/projectTasks';
import * as userController from './userController';
import * as Excel from 'exceljs';

export async function dailyReport(
    projects: string[],
    eventColor: any,
    activeCollabApi: IActiveCollabAPI,
    logger: Logger,
    writeToExcel: (workbook: Excel.Workbook,
        filename: string,
        logger: Logger) => Promise<void>
): Promise<discord.RichEmbed> {
    const workbook = new Excel.Workbook();

    const message = new discord.RichEmbed();
    message
        .setTitle('')
        .setColor(eventColor);
    for (const projectID of projects) {
        let taskData: ProjectTasks.TasksData;
        try {
            taskData = await activeCollabApi
                .getAssignmentTasksByProject(projectID);
        } catch (e) {
            logger.error(`Error getting tasks for project[${projectID}]: ${e}`);
            return new discord.RichEmbed()
                .setTitle(
                    `There was an error getting tasks for project: ${projectID}`
                )
                .setColor(eventColor);
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

        const worksheet = workbook.addWorksheet('Project ' + projectID);
        worksheet.columns = [
            { header: 'Task List', key: 'list', width: 20 },
            { header: 'Remaining', key: 'remaining', width: 15 },
            { header: 'Total', key: 'total', width: 10 },
        ];
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

            worksheet.addRow({
                list: list.name,
                remaining: remainingCount,
                total: fullCount
            });

            messageField += (
                '```ini\n'
                + '[' + list.name + '] '
                + remainingCount + '/' + fullCount + '\n'
                + '```'
            );
        });

        message.addField('**Remaining tasks for project: ' + projectID + '**',
            messageField
        );
    }

    if (!fs.existsSync('Spreadsheets/')) {
        fs.mkdirSync('Spreadsheets/');
    }
    await writeToExcel(workbook, 'Spreadsheets/dailyReport.xlsx', logger);
    message.attachFile('Spreadsheets/dailyReport.xlsx');

    return message;
}

export const writeToExcel = async (
    workbook: Excel.Workbook,
    filename: string,
    logger: Logger
) => {
    try {
        await workbook.xlsx.writeFile(filename);
    } catch (error) {
        logger.error(error);
    }
};


export async function dailyReportCommand(
    discordUser: discord.User,
    commandController: ICommandController,
    logger: Logger,
    message: discord.Message
): Promise<void> {
    message.channel.startTyping();
    message.channel.send('Generating report...');

    try {
        message
            .channel
            .send(
                await commandController.dailyReport(
                    await userController.getSubscriptions(discordUser)
                )
            );
    } catch (e) {
        message.channel.send('There was an error generating the report');
        logger.error(`Error generating report ` + e);
    }
    message.channel.stopTyping();
}

export async function reportSubscribeCommand(
    projects: string[],
    logger: Logger,
    message: discord.Message
): Promise<void> {
    message.channel.startTyping();
    message.channel.send(`Subscribing to project: ` + projects);
    try {
        message.channel.send(
            await userController.addSubscriptions(message.author, projects)
        );
    } catch (e) {
        message
            .channel
            .send('There was an error getting the tasks');
        logger.error(`Error getting tasks ` + e);
    }
    message.channel.stopTyping();
}

export const dailyReportParseCommand = (
    args: string[],
    commandController: ICommandController,
    logger: Logger,
    message: discord.Message
) => {
    if (args.length === 2 && args[0].toLowerCase() === 'subscribe') {
        // If projects (check for projects=)
        let projects: string[];
        if (args[1].toLocaleLowerCase().includes('projects=')) {
            projects = args[1]
                .replace('projects=', '')
                .split('"')
                .join('')
                .split(',');
            reportSubscribeCommand(projects, logger, message);
        }
    }
    else {
        dailyReportCommand(message.author, commandController, logger, message);
    }
};
