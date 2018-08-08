import { Logger } from 'structured-log';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as fs from 'fs';
import * as path from 'path';

import * as discord from 'discord.js';
import { IActiveCollabAPI } from './activecollab-api';
import { ICommandController } from './command';
import { TimeRecord } from '../models/timeRecords';
import { promisify } from 'util';

const spreadsheetPath: string = 'Spreadsheets';

export async function filteredTasks(
    nameFilters: string[],
    projectFilters: string[],
    startDate: string,
    endDate: string,
    eventColor: any,
    activeCollabApi: IActiveCollabAPI,
    logger: Logger,
    writeToCsv: (
        columnNames: string[],
        rows: string[][],
        filePath: string,
        logger: Logger
    ) => Promise<void>
): Promise<discord.RichEmbed> {
    const message = new discord.RichEmbed();

    let tasks: _.LoDashImplicitArrayWrapper<TimeRecord>;
    try {
        tasks = _(await activeCollabApi.getAllAssignmentTasksDateRange(startDate, endDate));
    } catch (e) {
        logger.error(`Error getting tasks: ${e}`);
        return new discord.RichEmbed()
            .setTitle(`There was an error getting tasks.`)
            .setColor(eventColor);
    }

    if (tasks.size() === 0) {
        return new discord.RichEmbed()
            .setTitle(`There were no tasks in that specified command.`)
            .setColor(eventColor);
    }

    tasks = tasks
        .filter(task => {
            const name = task.parent_name.toLocaleLowerCase();
            let isInFilter: boolean = false;

            if (nameFilters.length > 0 || projectFilters.length > 0) {
                nameFilters.forEach(filter => {
                    isInFilter = isInFilter || name.includes(filter.toLocaleLowerCase());
                });
                projectFilters.forEach(filter => {
                    isInFilter = isInFilter || task.project_id.toString() === filter;
                });
            } else {
                isInFilter = true;
            }

            return isInFilter;
        })
        .sort((a, b) => {
            if (a.user_id < b.user_id) {
                return -1;
            }
            if (a.user_id > b.user_id) {
                return 1;
            }
            return 0;
        });

    const columns = [
        'Client',
        '#',
        'Project',
        'Person',
        'Module',
        'Work type',
        'Task',
        'Date',
        'Time',
        'Billable'
    ];
    const rows: string[][] = [];

    tasks.forEach(task => {
        rows.push([
            task.client_name,
            task.project_id.toString(),
            task.project_name,
            task.user_name,
            '',
            task.group_name,
            task.parent_name,
            moment.unix(task.record_date).format('DD/MM/YYYY'),
            task.value.toString(),
            task.billable_status > 0 ? 'yes' : ''
        ]);
    });

    try {
        // Make spreadsheets Directory
        if (!fs.existsSync(spreadsheetPath)) {
            fs.mkdirSync(spreadsheetPath);
        }

        // Delete all spreadsheets
        const files = await promisify(fs.readdir)(spreadsheetPath);
        for (const file of files) {
            await promisify(fs.unlink)(path.join(spreadsheetPath, file));
        }

        const filename = getFilePath(
            nameFilters,
            projectFilters,
            startDate,
            endDate
        );

        await writeToCsv(columns, rows, filename, logger);

        message.setTitle('Successful')
            .attachFile(filename)
            .setColor(eventColor);
    } catch (err) {
        logger.error(err);
        message.setTitle('Spreadsheet')
            .addField('Status', 'Unsuccessful due to error: ' + err)
            .setColor(eventColor);
    }

    return message;
}

const getFilePath = (
    nameFilters: string[],
    projectFilters: string[],
    startDate: string,
    endDate: string
): string => {
    let filename = spreadsheetPath + '/';
    if (nameFilters.length > 0) {
        filename = filename
            + nameFilters.toString()
            + '_';
    }
    if (projectFilters.length > 0) {
        filename = filename
            + projectFilters.toString()
            + '_';
    }
    filename = filename
        + 'Start-'
        + startDate
        + '_End-'
        + endDate
        + '.csv';

    return filename;
};

export async function spreadsheetRangeCommand(
    commandController: ICommandController,
    logger: Logger,
    message: discord.Message,
    nameFilters: string[],
    projectFilters: string[],
    startDate: string,
    endDate: string
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
            .send(await commandController.filteredTasks(
                nameFilters,
                projectFilters,
                startDate,
                endDate
            ));
    } catch (e) {
        message
            .channel
            .send('There was an error creating the spreadsheet');
        logger.error(`Error getting tasks for spreadsheet ` + e);
    }
}

export const spreadsheetParseCommand = (
    firstArgument: string,
    args: string[],
    commandController: ICommandController,
    logger: Logger,
    message: discord.Message
) => {
    let startDate: string = '';
    let endDate: string = '';
    let nameFilters: string[] = [];
    let projectFilters: string[] = [];
    const dateRegex = /^(?:(?:31(\-|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\-|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\-|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\-|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/gm;

    args.forEach(arg => {
        // If date (check for - becuase dates contain -)
        if (arg.match(dateRegex)) {
            if (!startDate) {
                startDate = moment(arg, 'DD-MM-YYYY').format('YYYY-MM-DD');
            } else {
                endDate = moment(arg, 'DD-MM-YYYY').format('YYYY-MM-DD');
            }
        }

        // If nameFilter (check for names=)
        if (arg.toLocaleLowerCase().includes('names=')) {
            nameFilters = arg
                .replace('names=', '')
                .split('"')
                .join('')
                .split(',');
        }

        // If projectFilter (check for projects=)
        if (arg.toLocaleLowerCase().includes('projects=')) {
            projectFilters = arg
                .replace('projects=', '')
                .split('"')
                .join('')
                .split(',');
        }
    });

    if (!startDate) {
        message.channel.send('No dates found. Please use DD-MM-YYYY format');
    }
    else if (startDate.length > 0) {
        spreadsheetRangeCommand(
            commandController,
            logger,
            message,
            nameFilters,
            projectFilters,
            startDate,
            endDate.length > 0 ? endDate : moment().format('YYYY-MM-DD')
        );
    }

};
