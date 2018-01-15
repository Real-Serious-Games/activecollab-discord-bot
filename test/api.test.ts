import * as sinon from 'sinon';
import { Response, Request } from 'express';
import { Client } from 'discord.js';

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
});

function createApiTestFramework(
    expectedSecret = 'secret',
    responseSecret = 'secret',
    responseSecretUndefined = false,
    bodyToTest = testData.rawNewTask,
    req: Partial<Request> = {
        body: bodyToTest,
        header: sinon.stub().returns(
            responseSecretUndefined 
            ? undefined 
            : responseSecret)
    },
    res: Partial<Response> = {
        sendStatus: sinon.stub()
    },
    client: Partial<Client> = {
    },
    discordControllerStub: IDiscordController = {
        sendMessageToChannel: <SendMessageToChannel>sinon.stub(),
        determineChannel: <DetermineChannel>sinon.stub()
    },
    apiController = createApiController(discordControllerStub, expectedSecret)
) {
    return {
        webhookSecret: expectedSecret,
        req: req,
        res: res,
        client: client,
        discordController: discordControllerStub,
        apiController: apiController
    };
}
