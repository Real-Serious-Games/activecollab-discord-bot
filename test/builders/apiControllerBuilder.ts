import { Logger } from 'structured-log/src';

import { IDiscordController } from '../../src/controllers/discord';
import { IEventController } from '../../src/controllers/event';
import { createApiController, IApiController } from '../../src/controllers/api';
import { DiscordControllerMockBuilder } from './discordControllerMockBuilder';
import { EventControllerMockBuilder } from './eventControllerMockBuilder';
import { LoggerMockBuilder } from './loggerMockBuilder';

export const defaultWebhookSecret = 'secret';

export class ApiControllerBuilder {
    private discordController: Partial<IDiscordController> = 
        new DiscordControllerMockBuilder().build();
    private eventController: Partial<IEventController> = 
        new EventControllerMockBuilder().build();
    private logger: Partial<Logger> = new LoggerMockBuilder().build();
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