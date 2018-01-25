import { Response, Request } from 'express';
import { Client } from 'discord.js';
import { Logger } from 'structured-log/src';
import { right, left } from 'fp-ts/lib/Either';

import { Task } from '../src/models/taskEvent';
import { IDiscordController } from '../src/controllers/discord';
import { createApiController, IApiController } from '../src/controllers/api';
import * as testData from './testData';
import { IEventController, createEventController } from '../src/controllers/event';
import { IActiveCollabAPI } from '../src/controllers/activecollab-api';
import { IMappingController } from '../src/controllers/mapping';
import { disconnect } from 'cluster';

describe('postActiveCollabWebhook', () => {
    it('should call send with status 200 when header valid', async () => {
        expect.assertions(1);

        const webhookSecret = 'secret';

        const apiController = new ApiControllerBuilder()
            .withWebhookSecret(webhookSecret)
            .build();

        const res: Partial<Response> = createResponse();

        await apiController
            .postActiveCollabWebhook(
                new RequestBuilder()
                    .withWebhookSecret(webhookSecret)
                    .build() as Request,
                res as Response
            );

        expect(res.sendStatus).toBeCalledWith(200);
    });

    it('should return 403 status when missing webhook secret in auth header', async () => {
        expect.assertions(1);
        
        const webhookSecret = 'secret';

        const apiController = new ApiControllerBuilder()
            .withWebhookSecret(webhookSecret)
            .build();

        const res: Partial<Response> = createResponse();

        await apiController
            .postActiveCollabWebhook(
                new RequestBuilder()
                    .withWebhookSecret(undefined)
                    .build() as Request,
                res as Response
            );

        expect(res.sendStatus).toBeCalledWith(403);
    });

    it('should return 403 status when secret in auth header incorrect', async () => {
        expect.assertions(1);
        
        const webhookSecret = 'secret';
        const wrongWebhookSecret = 'wrongSecret';

        const apiController = new ApiControllerBuilder()
            .withWebhookSecret(webhookSecret)
            .build();

        const res: Partial<Response> = createResponse();

        await apiController
            .postActiveCollabWebhook(
                new RequestBuilder()
                    .withWebhookSecret(wrongWebhookSecret)
                    .build() as Request,
                res as Response
            );

        expect(res.sendStatus).toBeCalledWith(403);
    });

    it('should call logger and not sendMessageToChannel when error processing event', async () => {
        expect.assertions(2);

        const webhookSecret = 'secret';
        const mockEventController: Partial<IEventController> = {
            processEvent: jest.fn().mockReturnValue(left('Error'))
        };
        const mockDiscordController = createMockDiscordController();
        const mockLogger = createMockLogger();

        const apiController = new ApiControllerBuilder()
            .withWebhookSecret(webhookSecret)
            .withDiscordController(mockDiscordController as IDiscordController)
            .withEventController(mockEventController as IEventController)
            .withLogger(mockLogger as Logger)
            .build();

        await apiController
            .postActiveCollabWebhook(
                new RequestBuilder().build() as Request,
                createResponse() as Response
            );

        expect(mockDiscordController.sendMessageToChannel).toHaveBeenCalledTimes(0);
        expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should call logger and not sendMessageToChannel determine channel throws error', async () => {
        expect.assertions(2);
        
        const mockDiscordController: Partial<IDiscordController> = {
            determineChannel: jest.fn(() => Promise.reject('Channel error')),
            sendMessageToChannel: jest.fn()
        };
        const mockLogger = createMockLogger();

        const apiController = new ApiControllerBuilder()
            .withDiscordController(mockDiscordController as IDiscordController)
            .withLogger(mockLogger as Logger)
            .build();

        await apiController
            .postActiveCollabWebhook(
                new RequestBuilder().build() as Request,
                createResponse() as Response
            );

        expect(mockDiscordController.sendMessageToChannel).toHaveBeenCalledTimes(0);
        expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should call sendMessageToChannel when known request body', async () => {       
        expect.assertions(2);

        const mockDiscordController = createMockDiscordController();
        const mockLogger = createMockLogger();

        const apiController = new ApiControllerBuilder()
            .withDiscordController(mockDiscordController as IDiscordController)
            .withLogger(mockLogger as Logger)
            .build();

        await apiController
            .postActiveCollabWebhook(
                new RequestBuilder().build() as Request,
                createResponse() as Response
            );

        expect(mockDiscordController.sendMessageToChannel).toHaveBeenCalled();
        expect(mockLogger.warn).toHaveBeenCalledTimes(0);
    });
});

const defaultWebhookSecret = 'secret';

function createResponse(): Partial<Response> {
    return {
        sendStatus: jest.fn()
    };
}

function createMockDiscordController(): Partial<IDiscordController> {
    return {
        sendMessageToChannel: jest.fn(),
        determineChannel: jest.fn(),
    };   
}

function createMockLogger(): Partial<Logger> {
    return {
        warn: jest.fn()
    };
}

class ApiControllerBuilder {
    private discordController: Partial<IDiscordController> 
        = createMockDiscordController();
    
    private eventController: Partial<IEventController> = {
        processEvent: jest.fn().mockReturnValue(right({ projectId: 1, body: { }}))
    };

    private logger: Partial<Logger> = createMockLogger();

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

class RequestBuilder {
    private body = 'body';
    private header = jest.fn().mockReturnValue(defaultWebhookSecret);

    public withWebhookSecret(webhookSecret: string): RequestBuilder {
        this.header = jest.fn().mockReturnValue(webhookSecret);
        return this;
    }

    public build(): Partial<Request> {
        return {
            body: this.body,
            header: this.header
        };
    }
}