import * as discord from 'discord.js';
import * as config from 'confucious';
import { assert } from 'console';
import { Logger } from 'structured-log';

import { IMappingController } from '../controllers/mapping';
import { ICommandController } from '../controllers/command';

export interface IDiscordController {
    sendMessageToChannel: (
        message: discord.RichEmbed, channel: discord.TextChannel
    ) => any;
    determineChannel: (projectId: number) => discord.TextChannel;
    getUserId: (username: string) => string;
}

export class DiscordController implements IDiscordController {
    private readonly client: discord.Client;
    private readonly mappingController: IMappingController;
    private readonly guildName: string;
    private readonly commandController: ICommandController;
    private readonly logger: Logger;

    public constructor(
        token: string,
        discordClient: discord.Client,
        mappingController: IMappingController,
        commandController: ICommandController,
        logger: Logger,
        commandPrefix: string,
        guildName: string
    ) {
        this.client = discordClient;
        this.mappingController = mappingController;
        this.guildName = guildName;
        this.logger = logger;
        this.commandController = commandController;

        // The ready event is vital, it means that your bot will only start 
        // reacting to information from Discord _after_ ready is emitted
        this.client.on('ready', () => {});

        this.client.login(token)
            .catch(console.error);

        this.client.on('message', async message => {
            if (!message.content.startsWith(commandPrefix) || message.author.bot) {
                return;
            }

            const args = message.content.toLowerCase().slice(commandPrefix.length).trim().split(/ +/g);
            const command = args.shift();

            if (command === undefined || command === '') {
                return;
            }

            if (command === 'tasks') {
                if (args[0] === 'list') {
                    this.ListCommand(message, args);
                } else if (args.length === 1 && args[0] === 'due') {
                    this.DueCommand(message);
                } else {
                    message.channel.send(`Unknown command, *${message.content}*, ` 
                        + `use *!tasks help* or *!tasks commands* for list of commands.`);
                }
            }
            else if (command === 'help' || command === 'commands') {
                message.channel.send(new discord.RichEmbed()
                    .setTitle('Commands')
                    .addField('!tasks', 
                        '*!tasks list* - lists your tasks.\n' +
                        '*!tasks list for @user* - lists tasks for mentioned user.\n' +
                        '*!tasks due* - lists tasks due this week for current channel\'s project\n'
                    )
                );
            } else {
                message.channel.send(`Unknown command, *${message.content}*, `
                    + `use *!help* or *!commands*`);
            }

            message
                .channel
                .stopTyping(true);
        });
    }

    public determineChannel(projectId: number): discord.TextChannel {
        assert(projectId, `Project ID not valid: ${projectId}`);
        
        const channelToFind = this.mappingController.getChannel(projectId);
        
        assert(channelToFind, `Project ID not found: ${projectId}`);

        const channel = this
            .client
            .channels
            .findAll('type', 'text')
            .map(channel => channel as discord.TextChannel)
            .find(channel => channel.name === channelToFind);
    
        if (channel) {
            return channel;
        } 

        throw new Error(`Channel does not exist on Discord: ${channelToFind}`);
    }

    public getUserId(username: string): string {
        assert(username, `Username not valid: ${username}`);
        
        const guild = this.client.guilds.find(g => g.name === this.guildName);
        const user = guild.members.find(m => m.user.tag === username);

        if (user) {
            return user.id;
        }

        throw Error(`User not found in guild: ${username}`);
    }

    public sendMessageToChannel(
        message: discord.RichEmbed,
        channel: discord.TextChannel
    ): void {
        assert(channel, `Cannot send without a channel: ${channel}`);

        channel
            .send(message)
            .catch(console.error);
    }

    private async ListCommand(message: discord.Message, args: Array<string>): Promise<void> {
        const sentMessage = await message
            .channel
            .send('Getting tasks...') as discord.Message;

        message
            .channel
            .startTyping();

        if (args.length === 3 && args[1] === 'for') {
            sentMessage.edit(await this.commandController
                .listTasksForUser(message.mentions.users.first()));
        } else {
            sentMessage.edit(await this.commandController
                .listTasksForUser(message.author));
        }
    }

    private async DueCommand(message: discord.Message): Promise<void> {
        if (message.channel.type !== 'text') {
            message.channel.send('!tasks due command must be called' 
                + ' from a text channel');
            return;
        }

        const sentMessage = await message
            .channel
            .send('Getting tasks due this week...') as discord.Message;

        const channelName = (<discord.TextChannel>message.channel).name;

        try {
            const projectId = this.mappingController
                .getProjectId(channelName);

            message
                .channel
                .startTyping();

            sentMessage.edit(await this.commandController
                .tasksDueThisWeekForProject(projectId));
        } catch (e) {
            sentMessage.edit('Unable to find ActiveCollab' 
                + ' project for channel ' + channelName);
            this.logger.warn('Error getting tasks due for week: ' + e);
        }
    }
}
