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

export class ApiController implements IApiController {
    private readonly discordController: IDiscordController;
    private readonly webhookSecret: string;

    public constructor(
        discordController: IDiscordController,
        webhookSecret: string) {
            assert(discordController, 'Invalid DiscordController: ' + discordController);
            assert(webhookSecret, 'Invalid webhookSecret: ' + webhookSecret);

            this.webhookSecret = webhookSecret;
            this.discordController = discordController;
        }
    
    public postActiveCollabWebhook = (
        req: Request,
        res: Response
    ): void => {
        if (req.header('X-Angie-WebhookSecret') != this.webhookSecret) {
            res.sendStatus(403);
        } else {
            const processed = eventController.processEvent(req.body);
            this.discordController.sendMessageToChannel(processed.value, this.discordController.determineChannel());
        
            res.sendStatus(200);
        }
    }
}