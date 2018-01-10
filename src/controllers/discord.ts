import { WebhookClient } from 'discord.js';
import * as config from 'confucious';

export type SendMessageToHook = (message: string, hook: WebhookClient) => any;
export type DetermineWebhookClient = () => WebhookClient;

export function sendMessageToHook(message: string, hook: WebhookClient): void {
        hook
            .send(message)
            .then(sentMessage => {
                console.log(`Sent message: ${sentMessage}`);
            })
            .catch(console.error);
}

// TODO Take in project ID as paramater and lookup webhook ID and Token
export function determineWebhookClient(): WebhookClient {
    return new WebhookClient(config.get('webhookId'), config.get('webhookToken'));
}
