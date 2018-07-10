import { Message, RichEmbed, User, RichEmbedOptions } from 'discord.js';

export async function logsSendFile(eventColor: any): Promise<RichEmbed> {
    const logFile = new RichEmbed()
        .setTitle(`Log file for 10-07-2018`)
        .attachFile('Logs/10-07-2018.txt')
        .setColor(eventColor);

    return logFile;
}
