import { Logger } from 'structured-log';
import * as Excel from 'exceljs';
import * as _ from 'lodash';
import * as moment from 'moment';

import * as discord from 'discord.js';
import { IActiveCollabAPI } from './activecollab-api';
import { ICommandController } from './command';
import { TimeRecord } from '../models/timeRecords';

export async function filteredTasks(
    nameFilters: string[],
    projectFilters: string[],
    startDate: string,
    endDate: string,
    eventColor: any,
    activeCollabApi: IActiveCollabAPI,
    logger: Logger
): Promise<discord.RichEmbed> {

    let tasks: _.LoDashImplicitArrayWrapper<TimeRecord>;
    try {
        tasks = _(await activeCollabApi.getAllAssignmentTasksDateRange(startDate, endDate));
    } catch (e) {
        logger.error(`Error getting tasks: ${e}`);
        return new discord.RichEmbed()
            .setTitle(`There was an error getting tasks.`)
            .setColor(eventColor);
    }

    const message = new discord.RichEmbed();
    message.setTitle('Spreadsheet')
        .setColor(eventColor);
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
        { header: 'Id', key: 'id', width: 5 },
        { header: 'Project', key: 'project', width: 50 },
        { header: 'Assignee', key: 'assignee', width: 20 },
        // { header: 'Module', key: 'module', width: 6 },
        { header: 'Work Type', key: 'workType', width: 10 },
        { header: 'Name', key: 'name', width: 90 },
        { header: 'Date', key: 'date', width: 12 },
        { header: 'Time', key: 'time', width: 12 },
        { header: 'Billable', key: 'billable', width: 5 },
    ];

    tasks.forEach(task => {
        worksheet.addRow({
            client: task.client_name,
            id: task.id,
            project: task.project_name,
            assignee: task.user_name,
            workType: task.group_name,
            name: task.parent_name,
            date: moment.unix(task.record_date).format('DD/MM/YYYY'),
            time: task.value,
            billable: task.billable_status > 0 ? 'yes' : ''
        });
    });

    workbook.xlsx.writeFile('Logs/RnDSpreadsheet.xlsx')
        .then(() => {
            message.addField('Status', 'Successful')
                .attachFile('Logs/RnDSpreadsheet.xlsx');
        })
        .catch(err => {
            console.log(err);
            message.addField('Status', 'Unsuccessful');
        });

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