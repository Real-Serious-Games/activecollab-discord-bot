import * as discord from 'discord.js';
import * as config from 'confucious';
import { assert } from 'console';
import { AssertionError } from 'assert';

export type SendMessageToHook = (message: string, channel: discord.TextChannel) => any;
export type DetermineChannel = () => discord.TextChannel;

export interface IDiscordController {
    client: discord.Client;
    sendMessageToChannel: SendMessageToHook;
    determineChannel: DetermineChannel;
}

export class DiscordController implements IDiscordController {
    public static instance: IDiscordController;
    public readonly client: discord.Client;

    public constructor(token: string, discordClient: discord.Client) {
        if (DiscordController.instance != undefined) {
            throw new Error('Attempting to create a new DiscordController when one already exists');
        }

        this.client = discordClient;

        // The ready event is vital, it means that your bot will only start reacting to information
        // from Discord _after_ ready is emitted
        this.client.on('ready', () => {});

        this.client.login(token)
            .catch(console.error);

        DiscordController.instance = this;
    }

    // TODO Take in project ID as paramater and lookup channel name
    public determineChannel(): discord.TextChannel {
        const channel = <discord.TextChannel>(
            DiscordController.instance.client
                .channels
                .findAll('type', 'text')
                    .find(channel => 
                        (<discord.TextChannel>channel).name === 'activecollab-notifications'));
    
        assert(channel, 'Unable to find channel');
    
        return channel;
    }

    public sendMessageToChannel(message: string, channel: discord.TextChannel): void {
        assert(channel, `Cannot send without a channel: ${channel}`);

        channel
            .send(message)
            .catch(console.error);
    }
}
