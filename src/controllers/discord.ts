import * as discord from 'discord.js';
import { assert } from 'console';
import { Logger } from 'structured-log';
import * as moment from 'moment';

import { IMappingController } from '../controllers/mapping';
import { ICommandController } from '../controllers/command';
import { timesheetParseCommand, wallOfShameCommand, timeReportCommand } from './timesheet';
import {
    dailyReportParseCommand,
    dailyReportCommand
} from './dailyReportCommand';
import { spreadsheetParseCommand } from '../controllers/spreadsheetCommand';
import { userConfigParseCommand } from './userController';
import { CommandEvent } from '../models/commandEvent';
import { TextChannel } from 'discord.js';

export interface IDiscordController {
    sendMessageToChannel: (
        message: discord.RichEmbed,
        channel: discord.TextChannel
    ) => any;
    determineChannels: (projectId: number) => Array<discord.TextChannel>;
    getUserId: (username: string) => string;
    runUserCommand: (e: CommandEvent) => number;
    runChannelCommand: (e: CommandEvent) => number;
}

export class DiscordController implements IDiscordController {
    private readonly client: discord.Client;
    private readonly mappingController: IMappingController;
    private readonly guildNames: Array<string>;
    private readonly commandController: ICommandController;
    private readonly logger: Logger;

    public constructor(
        token: string,
        discordClient: discord.Client,
        mappingController: IMappingController,
        commandController: ICommandController,
        logger: Logger,
        commandPrefix: string,
        guildNames: Array<string>
    ) {
        this.client = discordClient;
        this.mappingController = mappingController;
        this.guildNames = guildNames;
        this.logger = logger;
        this.commandController = commandController;

        // The ready event is vital, it means that your bot will only start
        // reacting to information from Discord _after_ ready is emitted
        this.client.on('ready', () => { });

        this.client.login(token).catch(console.error);

        this.client.on('message', async message => {
            if (
                !message.content.startsWith(commandPrefix) ||
                message.author.bot
            ) {
                return;
            }

            const args = message.content
                .slice(commandPrefix.length)
                .trim()
                .match(/(?:[^\s"]+|"[^"]*")+/g) as string[];
            if (args.length <= 0) {
                return;
            }
            let command = args.shift();

            if (!command) {
                return;
            }

            command = command.toLowerCase();

            let firstArgument = undefined;

            if (args.length > 0) {
                firstArgument = args[0].toLowerCase();
            }

            if (command === 'tasks') {
                if (firstArgument === 'list') {
                    this.listCommand(message, args);
                } else if (firstArgument === 'due' && args.length === 1) {
                    this.dueCommand(message);
                } else if (firstArgument === 'in' && args.length > 1) {
                    args.shift();
                    const list = args.join(' ');
                    this.inListCommand(message, list);
                } else if (firstArgument === 'create' && args.length > 1) {
                    args.shift();
                    const taskName = args.join(' ');
                    this.createTaskCommand(message, taskName);
                } else {
                    message.channel.send(
                        `Unknown command, *${message.content}*, ` +
                        `use *!tasks help* or *!tasks commands* for list of commands.`
                    );
                }
            }
            else if (command === 'spreadsheet') {
                if (firstArgument) {
                    spreadsheetParseCommand(
                        args,
                        this.commandController,
                        this.logger,
                        message
                    );
                } else {
                    message.channel.send(`Wrong syntax. Please enter at least one date`);
                    message.channel.send(`Eg: !spreadsheet ` + moment().format('DD-MM-YYYY'));
                }
            }
            else if (command === 'listprojects') {
                const channels = mappingController.getAllChannels();
                let messageField: string = '';
                channels.forEach(channel => {
                    messageField +=
                        '```ini\n' +
                        '[' +
                        channel.channelName +
                        '] ' +
                        'ID: ' +
                        channel.projectId +
                        '\n' +
                        '```';
                });

                const projectsMessage = new discord.RichEmbed()
                    .addField('Projects:', messageField);
                message.channel.send(projectsMessage);
            } else if (command === 'dailyreport') {
                dailyReportParseCommand(
                    args,
                    commandController,
                    mappingController,
                    logger,
                    message
                );
            } else if (command === 'users') {
                userConfigParseCommand(args, logger, message);
            }
            else if (command === 'logs') {
                if (firstArgument === 'sendfile') {
                    this.logsSendFileCommand(message, args);
                } else if (firstArgument === 'message') {
                    this.logsSendMessageCommand(message, args);
                } else {
                    message.channel.send(`Unknown command, *${message.content}*, `
                        + `use *!logs help* or *!logs commands* for list of commands.`);
                }
            }
            else if (command === 'times') {
                try {
                    const activeCollabID = this.mappingController.getActiveCollabUser(message.author.tag);

                    timesheetParseCommand(
                        activeCollabID.toString(),
                        args[0],
                        this.commandController,
                        this.logger,
                        message.channel
                    );
                } catch (error) {
                    message.channel.send('ActiveCollabID not found for your Discord tag.\n'
                        + 'Please contact an administrator for assistance.');
                    logger.error(error);
                }
            }
            else if (command === 'timereport') {
                try {
                    const activeCollabID = this.mappingController.getActiveCollabUser(message.author.tag);

                    timeReportCommand(this.commandController, this.logger, message.channel, activeCollabID.toString());
                } catch (error) {
                    message.channel.send('ActiveCollabID not found for your Discord tag.\n'
                        + 'Please contact an administrator for assistance.');
                    logger.error(error);
                }
            }
            else if (command === 'wallofshame') {
                wallOfShameCommand(this.commandController, this.logger, message.channel);
            }
            else if (command === 'help' || command === 'commands') {
                message.channel.send(new discord.RichEmbed()
                    .setTitle('Commands')
                    .addField('!tasks',
                        '**!tasks list** - lists your tasks.\n' +
                        '**!tasks list for @user** - lists tasks for mentioned user.\n' +
                        '**!tasks due** - lists tasks due this week for current channel\'s project\n' +
                        '**!tasks create <task name>** - creates a task for current channel\'s project\n' +
                        '**!tasks in <list>** - lists tasks in task list for current channel\'s project\n'
                    )
                    .addField('!spreadsheet',
                        '**!spreadsheet <date>** - All time records since <date>.\n' +
                        '**!spreadsheet <startdate> <enddate>** - All time records between <startdate> and <enddate>.\n' +
                        'You can also add optional filters in the command:\n' +
                        '**names=<name>** - This will only show times with <name> in thier task name\n' +
                        '**names=<name>,<name>** - Filters are separated by commas\n' +
                        '**names="<Name with spaces>"** - If your filter has spaces, wrap it in quotes\n' +
                        '**projects=<ID>** - This will only show times from the project with the ID <ID>\n' +
                        'Note: project ID can be found by looking in the URL in active collab\n' +
                        '**projects=<ID>,<ID>** - Filters are separated by commas\n'
                    )
                    .addField('!listProjects',
                        '*!listProjects* - lists all the known projects and thier IDs'
                    )
                    .addField('!dailyReport',
                        '*!dailyReport* - sends the daily report manually\n' +
                        '*!dailyReport subscribe <Project ID>* - subscribes to a daily report of that project\n' +
                        '*!dailyReport unsubscribe <Project ID>* - unsubscribes from a project project'
                    )
                    .addField('!logs',
                        '*!logs sendfile* - sends the logfile.\n' +
                        '*!logs message* - sends the logfile as text in a private message.\n'
                    )
                );
            } else {
                message.channel.send(
                    `Unknown command, *${message.content}*, ` +
                    `use *!help* or *!commands*`
                );
            }
        });
    }

    public determineChannels(projectId: number): Array<discord.TextChannel> {
        assert(projectId, `Project ID not valid: ${projectId}`);

        const channelMaps = this.mappingController.getChannels(projectId);

        assert(channelMaps, `Channels not found for project ID: ${projectId}`);

        // Get all channels that match the channel maps
        const textChannels = this.client.channels
            .findAll('type', 'text')
            .map(channel => channel as discord.TextChannel)
            .filter(textChannel =>
                channelMaps.some(
                    channelMap =>
                        channelMap.channelName === textChannel.name &&
                        this.guildNames[channelMap.guildIndex] ===
                        textChannel.guild.name
                )
            );

        let unfoundChannels = '';

        if (textChannels.length !== channelMaps.length) {
            unfoundChannels = channelMaps
                .filter(
                    channelMap =>
                        !textChannels.some(
                            textChannel =>
                                textChannel.guild.name ===
                                this.guildNames[channelMap.guildIndex]
                        )
                )
                .map(c => `${c.channelName} (${this.guildNames[c.guildIndex]})`)
                .join(', ');

            this.logger.warn(`Unable to find channels: ${unfoundChannels}`);
        }

        if (textChannels.length > 0) {
            return textChannels;
        }

        throw new Error(`Channels do not exist on Discord: ${unfoundChannels}`);
    }

    public getUserId(username: string): string {
        assert(username, `Username not valid: ${username}`);

        const guilds = this.guildNames.map(guildName =>
            this.client.guilds.find(guild => guild.name === guildName)
        );

        if (guilds.every(guild => guild === undefined)) {
            throw Error(`Guilds not found: ${this.guildNames}`);
        }

        const members = guilds.map(guild =>
            guild.members.find(member => member.user.tag === username)
        );

        if (members.every(member => member === undefined)) {
            throw Error(`User not found: ${username}`);
        }

        return members[0].id;
    }

    public sendMessageToChannel(
        message: discord.RichEmbed,
        channel: discord.TextChannel
    ): void {
        assert(channel, `Cannot send without a channel: ${channel}`);

        channel.send(message).catch(console.error);
    }

    /**
     * Create a task in ActiveCollab and notify the user if task creation fails
     */
    private async createTaskCommand(
        message: discord.Message,
        taskName: string
    ): Promise<void> {
        if (message.channel.type !== 'text') {
            message.channel.send(
                `!tasks create command must be called` +
                ' from a text channel associated with a project'
            );
            return;
        }

        message.channel.send('Creating task...');

        const channelName = (<discord.TextChannel>message.channel).name;

        try {
            const projectId = this.mappingController.getProjectId(channelName);

            message.channel.startTyping();

            const result = await this.commandController.createTask(
                projectId,
                taskName
            );
        } catch (e) {
            message.channel.send(
                'There was an error creating task for ' + channelName
            );
            this.logger.error(`Error creating task: ` + e.message);
        }

        message.channel.stopTyping();
    }

    /**
     * Lists all tasks for first user specified in discord message mentions
     */
    private async logsSendFileCommand(
        message: discord.Message,
        args: Array<string>
    ): Promise<void> {
        message
            .channel
            .send('Getting log file...');

        message.channel.startTyping();

        message
            .channel
            .send(await this.commandController
                .logsSendFile());

        message.channel.stopTyping();
    }

    /**
     * Lists all tasks for first user specified in discord message mentions
     */
    private async logsSendMessageCommand(
        message: discord.Message,
        args: Array<string>
    ): Promise<void> {
        message
            .channel
            .send('Sending full log to ' + message.author);

        await this.commandController.logsSendMessage(message.author);
    }

    /**
     * Lists all tasks for first user specified in discord message mentions
     */
    private async listCommand(
        message: discord.Message,
        args: Array<string>
    ): Promise<void> {
        const sentMessage = (await message.channel.send(
            'Getting tasks...'
        )) as discord.Message;

        const lowerCaseArgs = args.map(a => a.toLowerCase());

        message.channel.startTyping();

        if (lowerCaseArgs.length === 3 && lowerCaseArgs[1] === 'for') {
            message.channel.send(
                await this.commandController.tasksForUser(
                    message.mentions.users.first()
                )
            );
        } else {
            message.channel.send(
                await this.commandController.tasksForUser(message.author)
            );
        }

        message.channel.stopTyping();
    }

    /**
     * Get all tasks for project discord message is sent from
     * in specified task list
     */
    private async inListCommand(
        message: discord.Message,
        list: string
    ): Promise<void> {
        if (message.channel.type !== 'text') {
            message.channel.send(
                `!tasks in ${list} command must be called` +
                ' from a text channel associated with a project'
            );
            return;
        }

        message.channel.send(`Getting tasks in ${list}...`);

        const channelName = (<discord.TextChannel>message.channel).name;

        try {
            const projectId = this.mappingController.getProjectId(channelName);

            message.channel.startTyping();

            message.channel.send(
                await this.commandController.tasksInListForProject(
                    list,
                    projectId
                )
            );
        } catch (e) {
            message.channel.send(
                'There was an error creating task for ' + channelName
            );
            this.logger.error(`Error getting tasks in ${list}: ` + e);
        }

        message.channel.stopTyping();
    }

    /**
     * Returns all tasks for project discord message is sent from that
     * are due this week
     */
    private async dueCommand(message: discord.Message): Promise<void> {
        if (message.channel.type !== 'text') {
            message.channel.send(
                '!tasks due command must be called' +
                ' from a text channel associated with a project'
            );
            return;
        }

        const sentMessage = (await message.channel.send(
            'Getting tasks due this week...'
        )) as discord.Message;

        const channelName = (<discord.TextChannel>message.channel).name;

        try {
            const projectId = this.mappingController.getProjectId(channelName);

            message.channel.startTyping();

            message.channel.send(
                await this.commandController.tasksDueThisWeekForProject(
                    projectId
                )
            );
        } catch (e) {
            message.channel.send(
                'Unable to find ActiveCollab' +
                ' project for channel ' +
                channelName
            );
            this.logger.warn('Error getting tasks due for week: ' + e);
        }

        message.channel.stopTyping();
    }

    public runUserCommand(e: CommandEvent): number {
        if (!e.address) {
            this.logger.error(
                'Failed to find any valid Users! Tags may have changed or the Address value was invalid!'
            );
            return 400;
        }

        const immuneUsers: string[] = [
            'realseriousandrew#8738'
        ];

        const users = e.address.split(',');
        users.forEach(u => u.trim());

        // An array to hold validated users
        let filteredUsers: discord.User[] = [];

        // If addressing all users, get all users from ActiveCollab channel and perform command
        if (users.length === 1 && users[0] === '*') {
            this.logger.warn('Wildcard User is dangerous, use with caution\n Currently set to development-internal to prevent excessive spam whilst testing');
            console.log('[WARNING] Wildcard User is dangerous, use with caution\n Currently set to development-internal to prevent excessive spam whilst testing');

            // Gets all users from the specified channel (Set to Dev-Internal to test on a small group of people)
            // TODO: Change to RSG-Internal-Chat when ready 
            const internalChannel = this.client.channels.get('383420835605512192') as discord.TextChannel;
            filteredUsers = (internalChannel.members.map(gm => gm.user).filter(u => !u.bot));
        } else {
            for (let i = 0; i < users.length; i++) {
                const tempUser = this.client.users.filter(u => u.tag === users[i]).first();
                if (tempUser) {
                    filteredUsers.push(tempUser);
                }
                else {
                    this.logger.error(
                        `Failed to find User with tag: ${users[i]}!`
                    );
                }
            }
        }

        if (filteredUsers.length === 0) {
            this.logger.error(
                'Failed to find any valid Users! Tags may have changed or the Address value was invalid!'
            );
            return 400;
        }

        const command = e.command ? e.command.toLowerCase() : '';

        for (let i = 0; i < filteredUsers.length; i++) {
            switch (command) {
                case 'dailyreport':
                    dailyReportCommand(filteredUsers[i], this.commandController, this.logger);

                    if (i === filteredUsers.length - 1) {
                        return 200;
                    }
                    else {
                        continue;
                    }
                case 'log':
                    this.commandController.logsSendMessage(filteredUsers[i]);

                    if (i === filteredUsers.length - 1) {
                        return 200;
                    }
                    else {
                        continue;
                    }
                case 'msg':
                    if (e.parameters[0].length === 0) {
                        console.log('Blank message sent to user, cancelling.');
                        return 400;
                    }

                    filteredUsers[i].send(e.parameters[0]);

                    if (i === filteredUsers.length - 1) {
                        return 200;
                    }
                    else {
                        continue;
                    }
                case 'spreadsheet':
                    break;
                case 'timereport':
                    if (immuneUsers.find(immuneUser => immuneUser === filteredUsers[i].tag)) {
                        if (i === filteredUsers.length - 1) {
                            return 200;
                        }
                        else {
                            continue;
                        }
                    }

                    try {
                        const activeCollabID = this.mappingController.getActiveCollabUser(filteredUsers[i].tag);

                        this.commandController.userWeekTimes(activeCollabID)
                            .then((embed) => {
                                filteredUsers[i].send(embed);
                            })
                            .catch(error => this.logger.error(
                                `Failed to send TimeReport: ${error}`
                            ));
                    } catch (error) {
                        this.logger.error(
                            `Failed to send TimeReport: ${error}`
                        );
                    } finally {
                        if (i === filteredUsers.length - 1) {
                            return 200;
                        }
                        else {
                            continue;
                        }
                    }

                case 'timereminder':
                    if (immuneUsers.find(immuneUser => immuneUser === filteredUsers[i].tag)) {
                        if (i === filteredUsers.length - 1) {
                            return 418;
                        }
                        else {
                            continue;
                        }
                    }

                    filteredUsers[i].send(new discord.RichEmbed().setTitle('Timesheet Reminder!').addField('<Cool image coming soon>', 'In the meantime, make sure your timesheet is filled out!'));

                    if (i === filteredUsers.length - 1) {
                        return 418;
                    }
                    else {
                        continue;
                    }
                default:
                    this.logger.error(
                        'Failed to process CommandEvent: Invalid CommandType or type not supported!'
                    );
                    return 400;
            }
        }
        return 501;
    }

    public runChannelCommand(e: CommandEvent): number {
        if (!e.address) {
            this.logger.error(
                'Failed to find Address! Value was undefined!'
            );
            return 400;
        }

        const channel = this.client.channels.filter(ch => ch.id === e.address).first() as TextChannel;

        if (!channel) {
            this.logger.error(
                'Failed to find Channel for specified Address!'
            );
            return 400;
        }

        const command = e.command ? e.command.toLowerCase() : '';

        switch (command) {
            case 'msg':
                if (e.parameters[0].length === 0) {
                    console.log('Blank message sent to channel, cancelling.');
                    return 400;
                }

                channel.send(e.parameters[0]);
                break;
            case 'log':
                break;
            // case 'dailyreport':
            //     // Not to be implemented, will default and log an error
            //     break;
            case 'spreadsheet':
                break;
            case 'timereminder':
                // Internal chat channel
                channel.send(new discord.RichEmbed().setTitle('Timesheet Reminder!').addField('<Cool image coming soon>', 'In the meantime, make sure your timesheet is filled out!'));
                return 418;
            case 'wallofshame':
                wallOfShameCommand(this.commandController, this.logger, channel);
                return 418;
            default:
                this.logger.error(
                    'Failed to process CommandEvent: Invalid CommandType or type not supported!'
                );
                return 400;
        }
        return 501;
    }
}
