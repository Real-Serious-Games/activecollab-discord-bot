import { Response, Request } from 'express';
import { Logger } from 'structured-log/src';
import { left } from 'fp-ts/lib/Either';

import { Task } from '../src/models/taskEvent';
import { IDiscordController } from '../src/controllers/discord';
import { IEventController } from '../src/controllers/event';
import { ApiControllerBuilder } from './builders/apiControllerBuilder';
import { RequestBuilder } from './builders/requestBuilder';
import { DiscordControllerMockBuilder } from './builders/discordControllerMockBuilder';
import { LoggerMockBuilder } from './builders/loggerMockBuilder';
import { EventControllerMockBuilder } from './builders/eventControllerMockBuilder';

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
        const discordControllerMock = new DiscordControllerMockBuilder().build();
        const loggerMock = new LoggerMockBuilder().build();

        const eventControlerMock = new EventControllerMockBuilder()
            .withProcessEvent(jest.fn().mockReturnValue(left('Error')))
            .build();

        const apiController = new ApiControllerBuilder()
            .withWebhookSecret(webhookSecret)
            .withDiscordController(discordControllerMock as IDiscordController)
            .withEventController(eventControlerMock as IEventController)
            .withLogger(loggerMock as Logger)
            .build();

        await apiController
            .postActiveCollabWebhook(
                new RequestBuilder().build() as Request,
                createResponse() as Response
            );

        expect(discordControllerMock.sendMessageToChannel).toHaveBeenCalledTimes(0);
        expect(loggerMock.warn).toHaveBeenCalled();
    });

    it('should call logger and not sendMessageToChannel determine channel throws error', async () => {
        expect.assertions(2);
        
        const loggerMock = new LoggerMockBuilder().build();

        const discordControllerMock = new DiscordControllerMockBuilder()
            .withDetermineChannels(jest.fn(() => Promise.reject('Channel error')))
            .build();

        const apiController = new ApiControllerBuilder()
            .withDiscordController(discordControllerMock as IDiscordController)
            .withLogger(loggerMock as Logger)
            .build();

        await apiController
            .postActiveCollabWebhook(
                new RequestBuilder().build() as Request,
                createResponse() as Response
            );

        expect(discordControllerMock.sendMessageToChannel).toHaveBeenCalledTimes(0);
        expect(loggerMock.warn).toHaveBeenCalled();
    });

    it('should call sendMessageToChannel to determined channels'
        + ' when known request body', async () => {       
        expect.assertions(2);

        const loggerMock = new LoggerMockBuilder().build();

        const discordControllerMock = new DiscordControllerMockBuilder()
            .withDetermineChannels(jest.fn().mockReturnValue([
                {
                    name: 'channel'
                },
                {
                    name: 'channel 2'
                }
            ]))
            .build();

        const apiController = new ApiControllerBuilder()
            .withDiscordController(discordControllerMock as IDiscordController)
            .withLogger(loggerMock as Logger)
            .build();

        await apiController
            .postActiveCollabWebhook(
                new RequestBuilder().build() as Request,
                createResponse() as Response
            );

        expect(discordControllerMock.sendMessageToChannel).toHaveBeenCalledTimes(2);
        expect(loggerMock.warn).toHaveBeenCalledTimes(0);
    });
});

function createResponse(): Partial<Response> {
    return {
        sendStatus: jest.fn()
    };
}