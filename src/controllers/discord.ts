import * as discord from 'discord.js';
import * as config from 'confucious';
import { assert } from 'console';
import { AssertionError } from 'assert';
import { IMappingController } from '../controllers/mapping';

export type SendMessageToChannel =
    (message: string, channel: discord.TextChannel) => any;
export type DetermineChannel =
    (projectId: number) => discord.TextChannel;

export interface IDiscordController {
    sendMessageToChannel: SendMessageToChannel;
    determineChannel: DetermineChannel;
}

export class DiscordController implements IDiscordController {
    private readonly client: discord.Client;
    private readonly mappingController: IMappingController;

    public constructor(
        token: string,
        discordClient: discord.Client,
        mappingController: IMappingController
    ) {
        this.client = discordClient;
        this.mappingController = mappingController;

        // The ready event is vital, it means that your bot will only start 
        // reacting to information from Discord _after_ ready is emitted
        this.client.on('ready', () => {});

        this.client.login(token)
            .catch(console.error);
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

    public sendMessageToChannel(message: string, channel: discord.TextChannel): void {
        assert(channel, `Cannot send without a channel: ${channel}`);

        channel
            .send(message)
            .catch(console.error);
    }
}
