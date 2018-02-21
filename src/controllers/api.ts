import { Response, Request } from 'express';
import { WebhookClient } from 'discord.js';
import { Logger } from 'structured-log';

import { IDiscordController, DiscordController } from '../controllers/discord';
import { IEventController } from './event';

type Route = (req: Request, res: Response) => void;

export type PostActiveCollabWebhook = (
    req: Request,
    res: Response
) => void;

export interface IApiController {
    postActiveCollabWebhook: PostActiveCollabWebhook;
}

async function postActiveCollabWebhook (
    discordController: IDiscordController,
    webhookSecret: string,
    logger: Logger,
    eventController: IEventController,
    req: Request,
    res: Response
): Promise<void> {
    if (req.header('X-Angie-WebhookSecret') != webhookSecret) {
        res.sendStatus(403);
        return;
    }
    const processed = await eventController.processEvent(req.body);

    await processed.map(async p => {
        try {
            const projectId = await discordController.determineChannels(p.projectId);

            discordController.sendMessageToChannel(
                p.body,
                projectId
            );
        } catch (e) {
            logger.warn('Issue processing event: {value}', e);
        }
    });

    processed.mapLeft(e => 
        logger.warn('Issue processing event: {value}', e)
    );

    res.sendStatus(200);
}

export function createApiController(
    discordController: IDiscordController,
    webhookSecret: string,
    logger: Logger,
    eventController: IEventController
): IApiController {
    return {
        postActiveCollabWebhook: postActiveCollabWebhook.bind(
            undefined,
            discordController,
            webhookSecret,
            logger,
            eventController)
    };
}