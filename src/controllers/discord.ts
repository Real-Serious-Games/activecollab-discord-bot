import * as discord from 'discord.js';
import * as config from 'confucious';
import { assert } from 'console';
import { AssertionError } from 'assert';
import { get } from 'confucious';

export type SendMessageToChannel =
    (message: string, channel: discord.TextChannel) => any;
export type DetermineChannel = (projectId: number) => discord.TextChannel;

export interface IDiscordController {
    sendMessageToChannel: SendMessageToChannel;
    determineChannel: DetermineChannel;
}

export class DiscordController implements IDiscordController {
    private readonly client: discord.Client;
    private readonly getChannelFromId: (id: number) => string;

    public constructor(
        token: string,
        discordClient: discord.Client,
        getChannelFromId: (id: number) => string
    ) {
        this.client = discordClient;
        this.getChannelFromId = getChannelFromId;

        // The ready event is vital, it means that your bot will only start 
        // reacting to information from Discord _after_ ready is emitted
        this.client.on('ready', () => {});

        this.client.login(token)
            .catch(console.error);
    }

    public determineChannel(projectId: number): discord.TextChannel {
        assert(projectId, `Project ID not valid: ${projectId}`);
        
        const channelToFind = this.getChannelFromId(projectId);

        assert(channelToFind, `Project ID not found: ${projectId}`);

        const channel = <discord.TextChannel>(
            this
                .client
                .channels
                .findAll('type', 'text')
                .find(channel => 
                    (<discord.TextChannel>channel).name === channelToFind
                )
            );
    
        assert(channel, `Channel not found: ${channel}`);
    
        return channel;
    }

    public sendMessageToChannel(message: string, channel: discord.TextChannel): void {
        assert(channel, `Cannot send without a channel: ${channel}`);

        channel
            .send(message)
            .catch(console.error);
    }
}
