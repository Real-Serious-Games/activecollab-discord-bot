import * as discord from 'discord.js';
import { assert } from 'console';
import { Logger } from 'structured-log';

import { IMappingController } from '../controllers/mapping';
import { ICommandController } from '../controllers/command';
import {
    dailyReportParseCommand,
    dailyReportCommand
} from './dailyReportCommand';
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
                .split(/ +/g);
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
            } else if (command === 'listprojects') {
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

                const projectsMessage = new discord.RichEmbed().addField(
                    'Projects:',
                    messageField
                );

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
            } else if (command === 'help' || command === 'commands') {
                message.channel.send(
                    new discord.RichEmbed()
                        .setTitle('Commands')
                        .addField(
                            '!tasks',
                            '*!tasks list* - lists your tasks.\n' +
                            '*!tasks list for @user* - lists tasks for mentioned user.\n' +
                            "*!tasks due* - lists tasks due this week for current channel's project\n" +
                            "*!tasks create <task name>* - creates a task for current channel's project\n" +
                            "*!tasks in <list>* - lists tasks in task list for current channel's project\n"
                        )
                        .addField(
                            '!listProjects',
                            '*!listProjects* - lists all the known projects and thier IDs'
                        )
                        .addField(
                            '!dailyReport',
                            '*!dailyReport* - sends the daily report manually\n' +
                            '*!dailyReport subscribe <Project ID>* - subscribes to a daily report of that project\n' +
                            '*!dailyReport unsubscribe <Project ID>* - unsubscribes from a project project'
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
    }

    private async sendLogMessage(user: discord.User) {
        return; // await this.commandController.logsSendMessage(user);
    }

    public runUserCommand(e: CommandEvent): number {
        const user = this.client.users.filter(u => u.tag === e.address).first();
        if (!user) {
            return 400;
        }

        switch (e.command.toLowerCase()) {
            case 'msg':
                user.send(e.parameters[0]);
                return 200;
            case 'log':
                // this.commandController.logsSendMessage(user);
                this.sendLogMessage(user);
                break;
            case 'dailyreport':
                dailyReportCommand(user, this.commandController, this.logger);
                return 200;
            case 'spreadsheet':
                break;
            default:
                this.logger.error(
                    'Failed to process CommandEvent: Invalid CommandType or type not supported!'
                );
                return 400;
        }
        return 501;
    }

    public runChannelCommand(e: CommandEvent): number {
        switch (e.command.toLowerCase()) {
            case 'msg':
                break;
            case 'log':
                break;
            case 'dailyreport':
                // Not to be implemented, log warning
                break;
            case 'spreadsheet':
                break;
            default:
                this.logger.error(
                    'Failed to process CommandEvent: Invalid CommandType or type not supported!'
                );
                return 400;
        }
        return 501;
    }
}
