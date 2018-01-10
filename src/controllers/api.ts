'use strict';

import { Response, Request } from 'express';
import { WebhookClient } from 'discord.js';

import * as eventController from './event';
import { SendMessageToHook, DetermineChannel } from './discord';

type Route = (req: Request, res: Response) => void;

export function postActiveCollabWebhookFactory(
    sendMessageToHook: SendMessageToHook, 
    determineChannel: DetermineChannel): Route {
        return postActiveCollabWebhook.bind(undefined, sendMessageToHook, determineChannel);
}

export function postActiveCollabWebhook(
    sendMessageToHook: SendMessageToHook,
    determineChannel: DetermineChannel,
    req: Request,
    res: Response): void {
        const processed = eventController.processEvent(req.body);
        sendMessageToHook(processed, determineChannel());

        res.send();
}
