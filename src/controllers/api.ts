'use strict';

import { Response, Request } from 'express';
import { WebhookClient } from 'discord.js';

import * as eventController from './event';
import { SendMessageToHook, DetermineWebhookClient } from './discord';

type Route = (req: Request, res: Response) => void;

export function postActiveCollabWebhookFactory(sendMessageToHook: SendMessageToHook, determineWebhookClient: DetermineWebhookClient): Route {
    return postActiveCollabWebhook.bind(undefined, sendMessageToHook, determineWebhookClient);
}

export function postActiveCollabWebhook(sendMessageToHook: SendMessageToHook, determineWebhookClient: DetermineWebhookClient, req: Request, res: Response): void {
    const processed = eventController.processEvent(req.body);
    sendMessageToHook(processed, determineWebhookClient());

    res.status(200);
}
