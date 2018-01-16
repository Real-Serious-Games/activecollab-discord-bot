import * as sinon from 'sinon';
import { Response, Request } from 'express';
import { Client } from 'discord.js';
import { Logger } from 'structured-log/src';
import { Task } from '../src/models/taskEvent';
 
import { IDiscordController, SendMessageToChannel, DetermineChannel } from '../src/controllers/discord';
import { createApiController } from '../src/controllers/api';
import * as testData from './testData';

describe('postActiveCollabWebhook', () => {
    it('should call send with status 200', () => {
        const testFramework = createApiTestFramework();

        testFramework
            .apiController
            .postActiveCollabWebhook(
                <Request>testFramework.req,
                <Response>testFramework.res
            );
        sinon.assert.calledOnce(testFramework.res.sendStatus as sinon.SinonStub);
        sinon.assert.calledWith(testFramework.res.sendStatus as sinon.SinonStub, 200);
    });

    it('should return 403 status when missing auth header', () => {
        const authHeaderMissing = true;

        const testFramework = createApiTestFramework(undefined, undefined, authHeaderMissing);

        testFramework
            .apiController
            .postActiveCollabWebhook(
                <Request>testFramework.req,
                <Response>testFramework.res
            );
        sinon.assert.calledOnce(testFramework.res.sendStatus as sinon.SinonStub);
        sinon.assert.calledWith(testFramework.res.sendStatus as sinon.SinonStub, 403);
    });

    it('should return 403 status when auth header wrong', () => {
        const secret = 'secret';
        const wrongSecret = 'wrong secret';

        const testFramework = createApiTestFramework(secret, wrongSecret);

        testFramework
            .apiController
            .postActiveCollabWebhook(
                <Request>testFramework.req,
                <Response>testFramework.res
            );
        sinon.assert.calledOnce(testFramework.res.sendStatus as sinon.SinonStub);
        sinon.assert.calledWith(testFramework.res.sendStatus as sinon.SinonStub, 403);
    });
    

    it('should call logger and not sendMessageToChannel when unknown request body', () => {
        const body: Task = testData.getRawNewTask();
        body.payload.class = undefined;

        const testFramework = createApiTestFramework(
            undefined,
            undefined, 
            undefined, 
            body, 
            undefined,
            undefined,
            undefined
        );

        testFramework
            .apiController
            .postActiveCollabWebhook(
                <Request>testFramework.req,
                <Response>testFramework.res
            );

        sinon.assert.notCalled(testFramework.discordController.sendMessageToChannel as sinon.SinonSpy);
        sinon.assert.calledOnce(testFramework.logger.warn as sinon.SinonStub);
    });

    it('should call sendMessageToChannel when known request body', () => {       
        const testFramework = createApiTestFramework();

        const body = testData.getRawNewTask;

        testFramework
            .apiController
            .postActiveCollabWebhook(
                <Request>testFramework.req,
                <Response>testFramework.res
            );

        sinon.assert.calledOnce(testFramework.discordController.sendMessageToChannel as sinon.SinonSpy);
        sinon.assert.notCalled(testFramework.logger.warn as sinon.SinonStub);
    });

});

function createApiTestFramework(
    expectedSecret = 'secret',
    responseSecret = 'secret',
    responseSecretUndefined = false,
    bodyToTest = testData.getRawNewTask(),
    req: Partial<Request> = {
        body: bodyToTest,
        header: sinon.stub().returns(
            responseSecretUndefined 
            ? undefined 
            : responseSecret)
    },
    res: Partial<Response> = {
        sendStatus: sinon.spy()
    },
    client: Partial<Client> = {
    },
    discordController: IDiscordController = {
        sendMessageToChannel: <SendMessageToChannel>sinon.spy(),
        determineChannel: <DetermineChannel>sinon.spy()
    },
    logger: Partial<Logger> = {
        warn: sinon.spy()
     },
    apiController = createApiController(
        discordController,
        expectedSecret, 
        <Logger>logger
    )
) {
    return {
        webhookSecret: expectedSecret,
        req: req,
        res: res,
        client: client,
        discordController: discordController,
        apiController: apiController,
        logger: logger
    };
}
