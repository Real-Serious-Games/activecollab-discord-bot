import * as discord from 'discord.js';
import * as config from 'confucious';
import { assert } from 'console';

export type SendMessageToHook = (message: string, channel: discord.TextChannel) => any;
export type DetermineChannel = () => discord.TextChannel;

const client = new discord.Client();

// The ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted
client.on('ready', () => {
    console.log('I am ready!');
})

const token = config.get('token');
    
client.login(config.get('token'))
    .then(result => {   
        console.log('Logged into Discord'); 
    })
    .catch(console.error);

export function sendMessageToHook(message: string, channel: discord.TextChannel): void {
    assert(channel, 'Cannot send without a channel');
    channel
        .send(message)
        .catch(console.error);
}

// TODO Take in project ID as paramater and lookup channel name
export function determineChannel(): discord.TextChannel {
    const channel = <discord.TextChannel>(
        client
            .channels
            .findAll('type', 'text')
                .find(channel => 
                    (<discord.TextChannel>channel).name === "activecollab-notifications"));

    assert(channel, "Unable to find channel");

    return channel;
}
