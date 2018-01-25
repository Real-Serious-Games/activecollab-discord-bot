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

describe('postActiveCollabWebhook', () => {
    it('should call send with status 200', async () => {
        expect.assertions(1);

        const testFramework = createApiTestFramework();

        await testFramework
            .apiController
            .postActiveCollabWebhook(
                <Request>testFramework.req,
                <Response>testFramework.res
            );

        expect(testFramework.res.sendStatus).toBeCalledWith(200);
    });

    it('should return 403 status when missing auth header', async () => {
        expect.assertions(1);
        
        const authHeaderMissing = true;
        const testFramework = createApiTestFramework(undefined, undefined, authHeaderMissing);

        await testFramework
            .apiController
            .postActiveCollabWebhook(
                <Request>testFramework.req,
                <Response>testFramework.res
            );

        expect(testFramework.res.sendStatus).toBeCalledWith(403);
    });

    it('should return 403 status when auth header wrong', async () => {
        expect.assertions(1);
        
        const secret = 'secret';
        const wrongSecret = 'wrong secret';

        const testFramework = createApiTestFramework(secret, wrongSecret);

        await testFramework
            .apiController
            .postActiveCollabWebhook(
                <Request>testFramework.req,
                <Response>testFramework.res
            );

        expect(testFramework.res.sendStatus).toBeCalledWith(403);
    });

    it('should call logger and not sendMessageToChannel when error processing event', async () => {
        expect.assertions(2);

        const eventController: Partial<IEventController> = {
            processEvent: jest.fn().mockReturnValue(left('Error'))
        };

        const testFramework = createApiTestFramework(
            undefined,
            undefined, 
            undefined, 
            undefined, 
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            <IEventController>eventController
        );

        await testFramework
            .apiController
            .postActiveCollabWebhook(
                <Request>testFramework.req,
                <Response>testFramework.res
            );

        expect(testFramework.discordController.sendMessageToChannel).toHaveBeenCalledTimes(0);
        expect(testFramework.logger.warn).toHaveBeenCalled();
    });

    it('should call logger and not sendMessageToChannel when unable to determine channel', async () => {
        expect.assertions(2);
        
        const body = testData.getRawNewTask();

        const discordController: Partial<IDiscordController> = {
            determineChannel: jest.fn(() => Promise.reject('Channel error')),
            sendMessageToChannel: jest.fn(),
            getUserId: jest.fn()
        };

        const testFramework = createApiTestFramework(
            undefined,
            undefined, 
            undefined, 
            body, 
            undefined,
            undefined,
            undefined,
            <IDiscordController>discordController
        );

        await testFramework
            .apiController
            .postActiveCollabWebhook(
                <Request>testFramework.req,
                <Response>testFramework.res
            );

        expect(testFramework.discordController.sendMessageToChannel).toHaveBeenCalledTimes(0);
        expect(testFramework.logger.warn).toHaveBeenCalled();
    });

    it('should call sendMessageToChannel when known request body', async () => {       
        expect.assertions(2);
        
        const testFramework = createApiTestFramework();
        const body = testData.getRawNewTask;

        await testFramework
            .apiController
            .postActiveCollabWebhook(
                <Request>testFramework.req,
                <Response>testFramework.res
            );

        expect(testFramework.discordController.sendMessageToChannel).toHaveBeenCalled();
        expect(testFramework.logger.warn).toHaveBeenCalledTimes(0);
    });

});

function createApiTestFramework(
    expectedSecret = 'secret',
    responseSecret = 'secret',
    responseSecretUndefined = false,
    bodyToTest = testData.getRawNewTask(),
    req: Partial<Request> = {
        body: bodyToTest,
        header: jest.fn().mockReturnValue(
            responseSecretUndefined 
            ? undefined 
            : responseSecret)
    },
    res: Partial<Response> = {
        sendStatus: jest.fn()
    },
    client: Partial<Client> = {
    },
    discordController: Partial<IDiscordController> = {
        sendMessageToChannel: jest.fn(),
        determineChannel: jest.fn(),
        getUserId: jest.fn()
    },
    logger: Partial<Logger> = {
        warn: jest.fn()
    },
    mockMappingController: Partial<IMappingController> = {
        getDiscordUser: jest.fn()
    },
    eventController: Partial<IEventController> = {
        processEvent: jest.fn().mockReturnValue(right({ projectId: 1, body: { }}))
    },
    apiController = createApiController(
        discordController as IDiscordController,
        expectedSecret, 
        <Logger>logger,
        <IEventController>eventController
    )
) {
    return {
        webhookSecret: expectedSecret,
        req: req,
        res: res,
        client: client,
        discordController: discordController,
        apiController: apiController,
        logger: logger,
        eventControllerStub: eventController
    };
}
