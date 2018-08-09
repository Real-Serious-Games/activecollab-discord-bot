import { Response, Request } from 'express';
import { WebhookClient, RichEmbed } from 'discord.js';
import { Logger } from 'structured-log';

import { IDiscordController, DiscordController } from './discord';
import { IEventController } from './event';
import { CommandEvent } from '../models/commandEvent';

type Route = (req: Request, res: Response) => void;

export type PostActiveCollabWebhook = (req: Request, res: Response) => void;

export type PostCommandWebhook = (req: Request, res: Response) => void;

export interface IApiController {
    postActiveCollabWebhook: PostActiveCollabWebhook;
    postCommandWebhook: PostCommandWebhook;
}

async function postActiveCollabWebhook(
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
            const channels = await discordController.determineChannels(
                p.projectId
            );

            channels.forEach(channel => {
                discordController.sendMessageToChannel(p.body, channel);
            });
        } catch (e) {
            logger.warn('Issue processing event: {value}', e);
        }
    });

    processed.mapLeft(e => logger.warn('Issue processing event: {value}', e));

    res.sendStatus(200);
}

async function postCommandWebhook(
    discordController: IDiscordController,
    webhookSecret: string,
    logger: Logger,
    req: Request,
    res: Response
): Promise<void> {
    if (req.header('X-Angie-WebhookSecret') != webhookSecret) {
        res.sendStatus(403);
        return;
    }

    const commandEvent = <CommandEvent>req.body;

    switch (commandEvent.addressType) {
        case 'user':
            res.sendStatus(discordController.runUserCommand(commandEvent));
            return;
        case 'channel':
            res.sendStatus(discordController.runChannelCommand(commandEvent));
            return;
        default:
            logger.error(
                'Failed to process CommandEvent: Invalid CommandAddressType or type not supported!'
            );
            res.sendStatus(400);
            return;
    }
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
            eventController
        ),
        postCommandWebhook: postCommandWebhook.bind(
            undefined,
            discordController,
            webhookSecret,
            logger
        )
    };
}
