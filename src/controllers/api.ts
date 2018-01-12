import { Response, Request } from 'express';
import { WebhookClient } from 'discord.js';
import * as structuredLog from 'structured-log/src';
import { Logger } from 'structured-log/src';

import * as eventController from './event';
import { IDiscordController, DiscordController } from '../controllers/discord';

type Route = (req: Request, res: Response) => void;

export type PostActiveCollabWebhookFactory = (discordController: IDiscordController, logger: Logger) => Route;

export interface IApiController {
    postActiveCollabWebhookFactory: PostActiveCollabWebhookFactory;
}

export function postActiveCollabWebhookFactory(
    discordController: IDiscordController,
    log: Logger
): Route {
        return postActiveCollabWebhook.bind(undefined, discordController, log);
}

function postActiveCollabWebhook(
    discordController: IDiscordController,
    logger: Logger,
    req: Request,
    res: Response
): void {
        const processed = eventController.processEvent(req.body);
        processed.map(value => discordController.sendMessageToChannel(value, discordController.determineChannel()));
        processed.mapLeft(value => logger.warn('Issue processing event: {value}', value));

        res.send();
}
