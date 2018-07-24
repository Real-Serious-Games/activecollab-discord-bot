import { RichEmbed, User } from 'discord.js';
import * as fs from 'fs';
import { getDate } from './FileSink';

const logsFolder = 'Logs/';

const getLogsFile = (date: string): string => {
    if (fs.existsSync(logsFolder + getDate() + '.txt')) {
        return logsFolder + getDate() + '.txt';
    }
    return '';
};

export async function logsSendFile(eventColor: any): Promise<RichEmbed> {
    const embed = new RichEmbed();
    const fileDate = getDate();
    const file = getLogsFile(fileDate);

    if (file !== '') {
        embed.setTitle('Log file for ' + fileDate)
            .attachFile(file)
            .setColor(eventColor);
    } else {
        embed.setTitle('Unable to find log file for today (' + fileDate + ')')
            .setColor(eventColor);
    }
    return embed;
}

export async function logsSendMessage(
    eventColor: any,
    discordUser: User
): Promise<void> {
    const embed = new RichEmbed();
    const fileDate = getDate();
    const file = getLogsFile(fileDate);
    const fileContents = fs.readFileSync(file);

    if (file !== '') {
        embed.setTitle('Log file for ' + fileDate)
            .addField('Output', fileContents)
            .setColor(eventColor);
    } else {
        embed.setTitle('Unable to find log file for today (' + fileDate + ')')
            .setColor(eventColor);
    }
    discordUser.send(embed);
}
