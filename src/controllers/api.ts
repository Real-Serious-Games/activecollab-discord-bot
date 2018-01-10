'use strict';

import { Response, Request } from 'express';
import { WebhookClient } from 'discord.js';

import * as eventController from './event';
import { IDiscordController } from '../controllers/discord';

type Route = (req: Request, res: Response) => void;

export function postActiveCollabWebhookFactory(
    discordController: IDiscordController): Route {
        return postActiveCollabWebhook.bind(undefined, discordController);
}

export function postActiveCollabWebhook(
    discordController: IDiscordController,
    req: Request,
    res: Response): void {
        const processed = eventController.processEvent(req.body);
        discordController.sendMessageToChannel(processed, discordController.determineChannel());

        res.send();
}
