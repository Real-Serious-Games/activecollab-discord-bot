import * as discord from 'discord.js';
import * as config from 'confucious';
import { assert } from 'console';

export type SendMessageToHook = (message: string, channel: discord.TextChannel) => any;
export type DetermineChannel = () => discord.TextChannel;

export interface IDiscordController {
    sendMessageToChannel: SendMessageToHook;
    determineChannel: DetermineChannel;
}

// const client = new discord.Client();

// // The ready event is vital, it means that your bot will only start reacting to information
// // from Discord _after_ ready is emitted
// client.on('ready', () => {
//     console.log('I am ready!');
// })

// const token = config.get('token');
    
// client.login(config.get('token'))
//     .then(result => {   
//         console.log('Logged into Discord'); 
//     })
//     .catch(console.error);

// export function sendMessageToHook(message: string, channel: discord.TextChannel): void {
//     assert(channel, 'Cannot send without a channel');
//     channel
//         .send(message)
//         .catch(console.error);
// }

// // TODO Take in project ID as paramater and lookup channel name
// export function determineChannel(): discord.TextChannel {
//     const channel = <discord.TextChannel>(
//         client
//             .channels
//             .findAll('type', 'text')
//                 .find(channel => 
//                     (<discord.TextChannel>channel).name === "activecollab-notifications"));

//     assert(channel, "Unable to find channel");

//     return channel;
// }

export class DiscordController implements IDiscordController {
    public static client: discord.Client;

    public constructor(token: string, discordClient: discord.Client) {
        if (DiscordController.client != null) {
            console.log('Warning: Attempting to create a new DiscordController when one already exists');
            return;
        }

        DiscordController.client = discordClient;

        // The ready event is vital, it means that your bot will only start reacting to information
        // from Discord _after_ ready is emitted
        DiscordController.client.on('ready', () => {
            console.log('I am ready!');
        })

        DiscordController.client.login(token)
            .then(result => {   
                console.log('Logged into Discord'); 
            })
            .catch(console.error);
    }

    // TODO Take in project ID as paramater and lookup channel name
    public determineChannel(): discord.TextChannel {
        const channel = <discord.TextChannel>(
            DiscordController.client
                .channels
                .findAll('type', 'text')
                    .find(channel => 
                        (<discord.TextChannel>channel).name === "activecollab-notifications"));
    
        assert(channel, "Unable to find channel");
    
        return channel;
    }

    public sendMessageToChannel(message: string, channel: discord.TextChannel): void {
        assert(channel, 'Cannot send without a channel');
        channel
            .send(message)
            .catch(console.error);
    }
}
