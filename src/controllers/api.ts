import { Response, Request } from 'express';
import { WebhookClient } from 'discord.js';
import { assert } from 'console';

import * as eventController from './event';
import { IDiscordController, DiscordController } from '../controllers/discord';

type Route = (req: Request, res: Response) => void;

export type PostActiveCollabWebhook = (
    req: Request,
    res: Response
) => void;

export interface IApiController {
    postActiveCollabWebhook: PostActiveCollabWebhook;
}

function postActiveCollabWebhook (
    discordController: IDiscordController,
    webhookSecret: string,
    req: Request,
    res: Response
): void {
    if (req.header('X-Angie-WebhookSecret') != webhookSecret) {
        res.sendStatus(403);
    } else {
        const processed = eventController.processEvent(req.body);
        discordController.sendMessageToChannel(
            processed.value,
             discordController.determineChannel());
    
        res.sendStatus(200);
    }
}

export function createApiController(
    discordController: IDiscordController,
    webhookSecret: string
): IApiController {
    return {
        postActiveCollabWebhook: postActiveCollabWebhook.bind(
            undefined,
            discordController,
            webhookSecret)
    };
}