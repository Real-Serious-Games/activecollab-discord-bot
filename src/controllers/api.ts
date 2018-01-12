import { Response, Request } from 'express';
import { WebhookClient } from 'discord.js';

import * as eventController from './event';
import { IDiscordController, DiscordController } from '../controllers/discord';

type Route = (req: Request, res: Response) => void;

export type PostActiveCollabWebhookFactory = (discordController: IDiscordController) => Route;

export interface IApiController {
    postActiveCollabWebhookFactory: PostActiveCollabWebhookFactory;
}

export function postActiveCollabWebhookFactory(
    discordController: IDiscordController): Route {
        return postActiveCollabWebhook.bind(undefined, discordController);
}

function postActiveCollabWebhook(
    discordController: IDiscordController,
    req: Request,
    res: Response): void {
        const processed = eventController.processEvent(req.body);
        discordController.sendMessageToChannel(processed.value, discordController.determineChannel());

        res.send();
}
