import { Logger } from 'structured-log';
import * as Excel from 'exceljs';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as fs from 'fs';
import * as path from 'path';

import * as discord from 'discord.js';
import { IActiveCollabAPI } from './activecollab-api';
import { ICommandController } from './command';
import { TimeRecord } from '../models/timeRecords';

const spreadsheetPath: string = 'Spreadsheets';
const spreadsheetBaseName: string = 'Spreadsheet';

export async function filteredTasks(
    nameFilters: string[],
    projectFilters: string[],
    startDate: string,
    endDate: string,
    eventColor: any,
    activeCollabApi: IActiveCollabAPI,
    logger: Logger
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
            .setTitle(`There was no tasks in that specified command.`)
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

    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Sheet');
    worksheet.columns = [
        { header: 'Client', key: 'client', width: 25 },
        { header: '#', key: 'id', width: 5 },
        { header: 'Project', key: 'project', width: 50 },
        { header: 'Assignee', key: 'assignee', width: 20 },
        { header: 'Module', key: 'module', width: 6 },
        { header: 'Work Type', key: 'workType', width: 10 },
        { header: 'Name', key: 'name', width: 90 },
        { header: 'Date', key: 'date', width: 12 },
        { header: 'Time', key: 'time', width: 12 },
        { header: 'Billable', key: 'billable', width: 5 },
    ];

    tasks.forEach(task => {
        worksheet.addRow({
            client: task.client_name,
            id: task.project_id,
            project: task.project_name,
            assignee: task.user_name,
            workType: task.group_name,
            name: task.parent_name,
            date: moment.unix(task.record_date).format('DD/MM/YYYY'),
            time: task.value,
            billable: task.billable_status > 0 ? 'yes' : ''
        });
    });

    try {
        // Make spreadsheets Directory
        if (!fs.existsSync(spreadsheetPath)) {
            fs.mkdirSync(spreadsheetPath);
        }

        fs.readdir(spreadsheetPath, (err, files) => {
            if (err) throw err;

            for (const file of files) {
                fs.unlink(path.join(spreadsheetPath, file), err => {
                    if (err) throw err;
                });
            }
        });

        let filename = spreadsheetPath
            + '/'
            + spreadsheetBaseName
            + '_';
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
            + startDate
            + '-'
            + endDate
            + '.xlsx';

        await workbook.xlsx.writeFile(filename);
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
    args.forEach(arg => {
        // If date (check for - becuase dates contain -)
        if (arg.includes('-')) {
            if (!startDate) {
                startDate = arg;
            } else {
                endDate = arg;
            }
        }

        // If nameFilter (check for names=)
        if (arg.includes('names=')) {
            nameFilters = arg
                .replace('names=', '')
                .split('"')
                .join('')
                .split(',');
        }

        // If projectFilter (check for projects=)
        if (arg.includes('projects=')) {
            projectFilters = arg
                .replace('projects=', '')
                .split('"')
                .join('')
                .split(',');
        }
    });

    if (startDate.length > 0) {
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
