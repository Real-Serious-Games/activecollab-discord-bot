import * as discord from 'discord.js';
import * as config from 'confucious';
import { assert } from 'console';
import { AssertionError } from 'assert';
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

    public constructor(
        token: string,
        discordClient: discord.Client,
        mappingController: IMappingController,
        commandController: ICommandController,
        commandPrefix: string,
        guildName: string
    ) {
        this.client = discordClient;
        this.mappingController = mappingController;
        this.guildName = guildName;

        // The ready event is vital, it means that your bot will only start 
        // reacting to information from Discord _after_ ready is emitted
        this.client.on('ready', () => {});

        this.client.login(token)
            .catch(console.error);

        this.client.on('message', async message => {
            if (!message.content.startsWith(commandPrefix) || message.author.bot) {
                return;
            }

            console.log('Command received: ' + message.content);

            const args = message.content.slice(commandPrefix.length).trim().split(/ +/g);
            const command = args.shift();

            if (command === undefined || command === '') {
                return;
            }

            command.toLowerCase();

            if (command === 'tasks') {
                if (args[0] === 'list') {
                    message.channel.send('Getting tasks...');
                    if (args.length === 3 && args[1].toLowerCase() === 'for') {
                        message.channel.send(await commandController
                            .listTasksForUser(message.mentions.users.first()));
                    } else {
                        message.channel.send(await commandController
                            .listTasksForUser(message.author));
                    }
                }
            }
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
}
