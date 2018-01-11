import { Response, Request } from 'express';
import { WebhookClient } from 'discord.js';

import * as eventController from './event';
import { IDiscordController, DiscordController } from '../controllers/discord';

type Route = (req: Request, res: Response) => void;

export type PostActiveCollabWebhookFactory = (discordController: IDiscordController) => Route;
export type PostActiveCollabWebhook = (discordController: IDiscordController, req: Request, res: Response) => void;

export interface IApiController {
    postActiveCollabWebhookFactory: PostActiveCollabWebhookFactory;
    postActiveCollabWebhook: PostActiveCollabWebhook;
}

export function postActiveCollabWebhookFactory(
    discordController: IDiscordController): Route {
        return postActiveCollabWebhook.bind(undefined, discordController);
}

export function postActiveCollabWebhook(
    discordController: IDiscordController,
    req: Request,
    res: Response): void {
        const processed = eventController.processEvent(req.body);
        discordController.sendMessageToChannel(processed.value, discordController.determineChannel());

        res.send();
}
