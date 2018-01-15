import { Response, Request } from 'express';
import { WebhookClient } from 'discord.js';
import { Logger } from 'structured-log/src';

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
    logger: Logger,
    req: Request,
    res: Response
): void {
    if (req.header('X-Angie-WebhookSecret') != webhookSecret) {
        res.sendStatus(403);
        return;
    }
    const processed = eventController.processEvent(req.body);

    processed.map(value =>
        discordController
            .sendMessageToChannel(
                value,
                discordController.determineChannel())
            );

    processed.mapLeft(value => 
        logger
            .warn(
                'Issue processing event: {value}',
                value)
            );

    res.sendStatus(200);
}

export function createApiController(
    discordController: IDiscordController,
    webhookSecret: string,
    logger: Logger
): IApiController {
    return {
        postActiveCollabWebhook: postActiveCollabWebhook.bind(
            undefined,
            discordController,
            webhookSecret,
            logger)
    };
}