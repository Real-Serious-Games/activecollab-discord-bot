import * as discord from 'discord.js';
import { Logger } from 'structured-log';
import * as _ from 'lodash';

import { TimeRecord } from '../models/timeRecords';
import { IActiveCollabAPI } from './activecollab-api';
import * as moment from '../../node_modules/moment';
import { ICommandController } from './command';

const dayToNumber = (day?: string): number => {
    if (day) {
        switch (day.toLowerCase()) {
            case 'mon':
            case 'monday':
                return 1;
            case 'tue':
            case 'tues':
            case 'tuesday':
                return 2;
            case 'wed':
            case 'wednes':
            case 'wednesday':
                return 3;
            case 'thu':
            case 'thur':
            case 'thurs':
            case 'thursday':
                return 4;
            case 'fri':
            case 'friday':
                return 5;
            default:
                return moment().day();
        }
    }

    return moment().day();
};

export async function userTimes(
    userId: number,
    eventColor: any,
    activeCollabApi: IActiveCollabAPI,
    logger: Logger,
    day?: string
): Promise<discord.RichEmbed> {
    const message = new discord.RichEmbed();
    let tasks: TimeRecord[];

    const dayNum = dayToNumber(day);
    const dayDate = moment().day(dayNum).format('YYYY-MM-DD');

    try {
        tasks = await activeCollabApi.getAllAssignmentTasksDateRange(
            dayDate, dayDate
        );
    } catch (e) {
        logger.error(`Error getting tasks: ${e}`);
        return new discord.RichEmbed()
            .setTitle(`There was an error getting tasks.`)
            .setColor(eventColor);
    }

    if (tasks.length === 0) {
        return new discord.RichEmbed()
            .setTitle(`No tasks logged for that day`)
            .setColor(eventColor);
    }

    const userTasks = tasks.filter(t => t.user_id === userId);
    let time: number = 0;
    userTasks.forEach(task => {
        time += task.value;
    });

    message
        .addField(`Hours for ${dayDate}`,
            moment.utc(time * 3600 * 1000).format('HH:mm')
            + ' - logged\n' +
            moment.utc((7.6 - time) * 3600 * 1000).format('HH:mm')
            + ' - remaining');

    console.log(userTasks);

    return message;
}

export async function timesheetCommand(
    commandController: ICommandController,
    logger: Logger,
    message: discord.Message,
    userId: string,
    day?: string
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
            .send(await commandController.userTimes(
                parseInt(userId),
                day)
            );
    } catch (e) {
        message
            .channel
            .send('There was an error creating the spreadsheet');
        logger.error(`Error getting tasks for spreadsheet ` + e);
    }
}

export const timesheetParseCommand = (
    args: string[],
    commandController: ICommandController,
    logger: Logger,
    message: discord.Message
) => {
    timesheetCommand(
        commandController,
        logger,
        message,
        args[0],
        args[1]
    );
};
