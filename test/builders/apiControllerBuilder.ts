import { right, left } from 'fp-ts/lib/Either';
import { Logger } from 'structured-log/src';

import { IDiscordController } from '../../src/controllers/discord';
import { IEventController, createEventController } from '../../src/controllers/event';
import { createApiController, IApiController } from '../../src/controllers/api';

export const defaultWebhookSecret = 'secret';

export class ApiControllerBuilder {
    private discordController: Partial<IDiscordController> = {
            sendMessageToChannel: jest.fn(),
            determineChannels: jest.fn(),
        };
    
    private eventController: Partial<IEventController> = {
        processEvent: jest.fn().mockReturnValue(right({ projectId: 1, body: { }}))
    };

    private logger: Partial<Logger> = {
        warn: jest.fn()
    };

    private webhookSecret = defaultWebhookSecret;

    public withDiscordController(
        discordController: IDiscordController
    ): ApiControllerBuilder {
        this.discordController = discordController;
        return this;
    }

    public withEventController(
        eventController: IEventController
    ): ApiControllerBuilder {
        this.eventController = eventController;
        return this;
    }

    public withLogger(logger: Logger): ApiControllerBuilder {
        this.logger = logger;
        return this;
    }

    public withWebhookSecret(webhookSecret: string): ApiControllerBuilder {
        this.webhookSecret = webhookSecret;
        return this;
    }

    public build(): IApiController {
        return createApiController(
            this.discordController as IDiscordController,
            this.webhookSecret,
            this.logger,
            this.eventController as IEventController
        );
    }
}