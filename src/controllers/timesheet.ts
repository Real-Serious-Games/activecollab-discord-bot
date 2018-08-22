import * as discord from 'discord.js';
import { Logger } from 'structured-log';
import * as _ from 'lodash';

import { TimeRecord } from '../models/timeRecords';
import { IActiveCollabAPI } from './activecollab-api';
import * as moment from '../../node_modules/moment';
import { ICommandController } from './command';
import { IMappingController } from './mapping';
import { IDatabaseController } from './database';

const dayToNumber = (day?: string): number => {
    if (day) {
        switch (day.toLowerCase()) {
            case 'm':
            case 'mo':
            case 'mon':
            case 'monday':
                return 1;
            case 't':
            case 'tu':
            case 'tue':
            case 'tues':
            case 'tuesday':
                return 2;
            case 'w':
            case 'we':
            case 'wed':
            case 'wednes':
            case 'wednesday':
                return 3;
            case 'th':
            case 'thu':
            case 'thur':
            case 'thurs':
            case 'thursday':
                return 4;
            case 'f':
            case 'fr':
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
    if (time < 0) {
        return '-' + moment.utc(-time * 3600 * 1000).format('H:mm');
    }
    return moment.utc(time * 3600 * 1000).format('H:mm');
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
        .addField(`Hours for ${dayDate.format('dddd')}`,
            humanizeTime(time)
            + ' - logged\n' +
            humanizeTime(7.6 - time)
            + ' - remaining');

    return message;
}

export async function userWeekTimes(
    userId: number,
    eventColor: any,
    activeCollabApi: IActiveCollabAPI,
    databaseController: IDatabaseController,
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
            .setTitle(`No hours logged for this week`)
            .setColor(eventColor);
    }

    const userTasks = times.filter(t => t.user_id === userId);
    let totalDuration: number = 0;

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

        totalDuration += dayTotalTimes;
    }

    const totalHours = Math.floor(totalDuration);
    const totalHoursStr =
        totalHours >= 10 ? totalHours.toString() : '0' + totalHours;
    const totalMins = Math.round((totalDuration - totalHours) * 60);
    const totalMinsStr =
        totalMins >= 10 ? totalMins.toString() : '0' + totalMins;

    message.addField(
        'Total Hours',
        'Total: ' + totalHoursStr + ':' + totalMinsStr
    );

    try {
        let image;
        if (totalDuration < 38) {
            image = await databaseController.getImage('negative');
        }
        else {
            image = await databaseController.getImage('positive');
        }

        if (image) {
            const attachment = new discord.Attachment(image, image.split('/').pop());
            message.attachFile(attachment);
            console.log('attached image successfully!');
        }
    }
    catch (error) {
        logger.error('Failed to attach image to TimeReport\n' + 
    `Error: ${error}`);
    }

    return message;
}

export async function wallOfShame(
    mappingController: IMappingController,
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
            .setTitle(`No times logged by anyone this week?\n`
                + 'Probably an error...')
            .setColor(eventColor);
    }

    let shamedUsers: string = '';

    mappingController.getAllUsers()
        .forEach(user => {
            let userTotalTimes: number = 0;
            times.filter(t => t.user_id === user.activeCollabUser)
                .forEach(t => {
                    userTotalTimes += t.value;
                });

            if (userTotalTimes < 38) {
                const totalDuration = 38 - userTotalTimes;
                const totalHours = Math.floor(totalDuration);
                const totalHoursStr =
                    totalHours >= 10 ? totalHours.toString() : '0' + totalHours;
                const totalMins = Math.round((totalDuration - totalHours) * 60);
                const totalMinsStr =
                    totalMins >= 10 ? totalMins.toString() : '0' + totalMins;

                shamedUsers += '**' + user.discordUser.split('#')[0]
                    + '** is missing ' + totalHoursStr + ':' + totalMinsStr
                    + '\n';
            }
        });

    // times
    //     .groupBy(t => t.user_id)
    //     .forEach(timeGroup => {
    //         let userTotalTimes: number = 0;
    //         timeGroup.forEach(t => {
    //             userTotalTimes += t.value;
    //         });

    //         if (userTotalTimes < 38) {
    //             shamedUsers += timeGroup[0].user_name
    //                 + ' is missing ' + humanizeTime(38 - userTotalTimes)
    //                 + '\n';
    //         }
    //     });


    if (shamedUsers.length === 0) {
        shamedUsers = 'The Wall of Shame is empty for this week!\n'
            + 'Congratulations everyone!';
    }

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
        channel.startTyping();

        channel
            .send(await commandController.userTimes(
                parseInt(userId),
                day)
            );
    } catch (e) {
        channel
            .send('There was an error creating the timesheet');
        logger.error(`Error getting tasks for timesheet ` + e);
    }

    channel.stopTyping();
}

export async function wallOfShameCommand(
    commandController: ICommandController,
    logger: Logger,
    channel: discord.TextChannel | discord.DMChannel | discord.GroupDMChannel
): Promise<void> {
    channel
        .send(`Getting tasks... (This may take a while)`);

    try {
        channel.startTyping();

        channel
            .send(await commandController.wallOfShame());
    } catch (e) {
        channel
            .send('There was an error calling the Wall of Shame!');
        logger.error(`Error calling the Wall of Shame: ` + e);
    }

    channel.stopTyping();
}

export async function timeReportCommand(
    commandController: ICommandController,
    logger: Logger,
    channel: discord.TextChannel | discord.DMChannel | discord.GroupDMChannel,
    userId: string
): Promise<void> {
    channel
        .send(`Getting tasks... (This may take a while)`);

    try {
        channel.startTyping();

        channel
            .send(await commandController.userWeekTimes(parseInt(userId)));
    } catch (e) {
        channel
            .send('There was an error sending the user\'s week timesheet!');
        logger.error(`Error sending the user\'s week timesheet: ` + e);
    }

    channel.stopTyping();
}

export const timesheetParseCommand = (
    activeCollabID: string,
    day: string,
    commandController: ICommandController,
    logger: Logger,
    channel: discord.TextChannel | discord.DMChannel | discord.GroupDMChannel
) => {
    timesheetCommand(
        commandController,
        logger,
        channel,
        activeCollabID,
        day
    );
};
