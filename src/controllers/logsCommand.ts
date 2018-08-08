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

// Split log message into fields with no more than 1000 characters in each (1024 max)
const splitLogMessage = (fileContents: Buffer | string, embed: RichEmbed) => {
    const messageArray = fileContents.toString().split('\n');
    let charCount = 0;
    let fieldContents = '';
    let hasTitle = false;

    for (let i = 0; i < messageArray.length; i++) {
        if (charCount + messageArray[i].length < 1000) {
            charCount += messageArray[i].length;
            fieldContents += messageArray[i];

            // Doesn't add a new line if it is the end of the file
            if (i !== messageArray.length - 1) {
                fieldContents += '\n';
                charCount += 2;
            }
        } else {
            if (!hasTitle) {
                embed.addField('Output', fieldContents);
                hasTitle = true;
            } else {
                embed.addField('---------', fieldContents);
            }

            charCount = messageArray[i].length;
            fieldContents = messageArray[i];

            // Doesn't add a new line if it is the end of the file
            if (i !== messageArray.length - 1) {
                fieldContents += '\n';
                charCount += 2;
            }

            if (embed.fields && embed.fields.length >= 25) {
                console.log(
                    'Log file too large to send in its entirety, consider implementing the sending of multiple messages!'
                );
                return embed;
            }
        }
    }

    if (embed.fields) {
        for (let i = 0; i < embed.fields.length; i++) {
            if (embed.fields[i].value.length > 1024) {
                console.log(
                    'Embed field exceeds maximum value after splitting! Consider lowering the splitting threshold'
                );
                if (embed.fields.length < 25) {
                    embed.addField(
                        'Error',
                        'A log message exceeded maximum length, sent maximum slice. Field: ' +
                            i.toString()
                    );
                }
                const newVal = embed.fields[i].value.slice(0, 1023);
                embed.fields[i].value = newVal;
            }
        }
    }
    return embed;
};

export async function logsSendFile(eventColor: any): Promise<RichEmbed> {
    const embed = new RichEmbed();
    const fileDate = getDate();
    const file = getLogsFile(fileDate);

    if (file !== '') {
        embed
            .setTitle('Log file for ' + fileDate)
            .attachFile(file)
            .setColor(eventColor);
    } else {
        embed
            .setTitle('Unable to find log file for today (' + fileDate + ')')
            .setColor(eventColor);
    }
    return embed;
}

export async function logsSendMessage(
    eventColor: any,
    discordUser: User
): Promise<void> {
    let embed = new RichEmbed();
    const fileDate = getDate();
    const file = getLogsFile(fileDate);
    const fileContents = fs.readFileSync(file);

    console.log(fileContents.toString());

    if (file !== '') {
        if (fileContents.length > 0) {
            embed.setTitle('Log file for ' + fileDate).setColor(eventColor);

            if (fileContents.length < 1024) {
                embed.addField('Output', fileContents);
            } else {
                embed = splitLogMessage(fileContents, embed);
            }
        } else {
            embed
                .setTitle('The log file for today (' + fileDate + ') is empty')
                .setColor(eventColor);
        }
    } else {
        embed
            .setTitle('Unable to find log file for today (' + fileDate + ')')
            .setColor(eventColor);
    }
    discordUser.send(embed);
}
