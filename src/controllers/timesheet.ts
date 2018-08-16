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
            case 'm':
            case 'mon':
            case 'monday':
                return 1;
            case 't':
            case 'tue':
            case 'tues':
            case 'tuesday':
                return 2;
            case 'w':
            case 'wed':
            case 'wednes':
            case 'wednesday':
                return 3;
            case 't':
            case 'thu':
            case 'thur':
            case 'thurs':
            case 'thursday':
                return 4;
            case 'f':
            case 'fri':
            case 'friday':
                return 5;
            default:
                return moment().day();
        }
    }

    return moment().day();
};

const humanizeTime = (time: number): string => {
    return moment.utc(time * 3600 * 1000).format('HH:mm');
};

const getAllTimes = async (
    startDate: moment.Moment,
    endDate: moment.Moment,
    logger: Logger,
    activeCollabApi: IActiveCollabAPI
): Promise<TimeRecord[]> => {
    try {
        return await activeCollabApi.getAllAssignmentTasksDateRange(
            startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')
        );
    } catch (e) {
        logger.error(`Error getting times: ${e}`);
        throw new Error(`There was an error getting times.`);
    }
};

export async function userTimes(
    userId: number,
    eventColor: any,
    activeCollabApi: IActiveCollabAPI,
    logger: Logger,
    day?: string
): Promise<discord.RichEmbed> {
    const message = new discord.RichEmbed();
    const dayNum = dayToNumber(day);
    const dayDate = moment().day(dayNum);

    const times = await getAllTimes(dayDate, dayDate, logger, activeCollabApi);

    if (times.length === 0) {
        return new discord.RichEmbed()
            .setTitle(`No tasks logged for that day`)
            .setColor(eventColor);
    }

    const userTasks = times.filter(t => t.user_id === userId);
    let time: number = 0;
    userTasks.forEach(task => {
        time += task.value;
    });

    message
        .addField(`Hours for ${dayDate}`,
            humanizeTime(time)
            + ' - logged\n' +
            humanizeTime(7.6 - time)
            + ' - remaining');

    console.log(userTasks);

    return message;
}

export async function userWeekTimes(
    userId: number,
    eventColor: any,
    activeCollabApi: IActiveCollabAPI,
    logger: Logger
): Promise<discord.RichEmbed> {
    const message = new discord.RichEmbed()
        .setTitle('Total hours for the week');
    const startDate = moment().day(1);
    const endDate = moment().day(5);

    const times = await getAllTimes(
        startDate,
        endDate,
        logger,
        activeCollabApi
    );

    if (times.length === 0) {
        return new discord.RichEmbed()
            .setTitle(`No tasks logged for that day`)
            .setColor(eventColor);
    }

    const userTasks = times.filter(t => t.user_id === userId);
    let totalHours: number = 0;

    for (let weekday = 1; weekday <= 5; weekday++) {
        const date = moment().day(weekday);
        let dayTotalTimes: number = 0;
        userTasks
            .filter(t => moment.unix(t.record_date).day() === date.day())
            .forEach(time => {
                dayTotalTimes += time.value;
            });

        message.addField(
            date.format('dddd'),
            'Time logged: '
            + humanizeTime(dayTotalTimes)
        );

        totalHours += dayTotalTimes;
    }

    message.addField(
        'Total Hours',
        'Total: ' + humanizeTime(totalHours)
    );

    return message;
}

export async function wallOfShame(
    eventColor: any,
    activeCollabApi: IActiveCollabAPI,
    logger: Logger
): Promise<discord.RichEmbed> {
    const message = new discord.RichEmbed();
    const startDate = moment().day(1);
    const endDate = moment().day(5);

    const times = _(await getAllTimes(
        startDate,
        endDate,
        logger,
        activeCollabApi
    ));

    if (times.size() === 0) {
        return new discord.RichEmbed()
            .setTitle(`No tasks logged for that day`)
            .setColor(eventColor);
    }

    let shamedUsers: string = '';

    times
        .groupBy(t => t.user_id)
        .forEach(timeGroup => {
            let userTotalTimes: number = 0;
            timeGroup.forEach(t => {
                userTotalTimes += t.value;
            });

            if (userTotalTimes < 38) {
                shamedUsers += timeGroup[0].user_name
                    + ' is missing ' + humanizeTime(38 - userTotalTimes)
                    + '\n';
            }
        });

    message
        .addField('Wall of Shame!', shamedUsers);

    return message;
}

export async function timesheetCommand(
    commandController: ICommandController,
    logger: Logger,
    channel: discord.TextChannel | discord.DMChannel | discord.GroupDMChannel,
    userId: string,
    day?: string
): Promise<void> {
    channel
        .send(`Getting tasks... (This may take a while)`);

    try {
        channel
            .startTyping();

        channel
            .send(await commandController.userTimes(
                parseInt(userId),
                day)
            );
    } catch (e) {
        channel
            .send('There was an error creating the spreadsheet');
        logger.error(`Error getting tasks for spreadsheet ` + e);
    }
}

export const timesheetParseCommand = (
    args: string[],
    commandController: ICommandController,
    logger: Logger,
    channel: discord.TextChannel | discord.DMChannel | discord.GroupDMChannel
) => {
    timesheetCommand(
        commandController,
        logger,
        channel,
        args[0],
        args[1]
    );
};
