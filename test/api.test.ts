import * as sinon from 'sinon';
import { Response, Request } from 'express';
import { Client } from 'discord.js';

import { IDiscordController, SendMessageToChannel, DetermineChannel } from '../src/controllers/discord';
import { createApiController } from '../src/controllers/api';
import * as testData from './testData';

describe('postActiveCollabWebhook', () => {
    it('should call send with status 200', () => {
        const webhookSecret = 'secret';

        const req: Partial<Request> = {
            body: testData.rawNewTask,
            header: sinon.stub().returns(webhookSecret)
        };

        const res: Partial<Response> = {
            sendStatus: sinon.stub()
        };

        const client: Partial<Client> = {
        };

        const discordControllerStub: IDiscordController = {
            sendMessageToChannel: <SendMessageToChannel>sinon.stub(),
            determineChannel: <DetermineChannel>sinon.stub()
        };

        const apiController = createApiController(discordControllerStub, webhookSecret);

        apiController.postActiveCollabWebhook(<Request>req, <Response>res);
        sinon.assert.calledOnce(res.sendStatus as sinon.SinonStub);
        sinon.assert.calledWith(res.sendStatus as sinon.SinonStub, 200);
    });

    it('should return 403 status when missing auth header', () => {
        const webhookSecret = 'secret';

        const req: Partial<Request> = {
            body: testData.rawNewTask,
            header: sinon.stub().returns('')
        };

        const res: Partial<Response> = {
            sendStatus: sinon.stub()
        };

        const client: Partial<Client> = {
        };


        const discordControllerStub: IDiscordController = {
            sendMessageToChannel: <SendMessageToChannel>sinon.stub(),
            determineChannel: <DetermineChannel>sinon.stub()
        };

        const apiController = createApiController(discordControllerStub, webhookSecret);

        apiController.postActiveCollabWebhook(<Request>req, <Response>res);
        sinon.assert.calledOnce(res.sendStatus as sinon.SinonStub);
        sinon.assert.calledWith(res.sendStatus as sinon.SinonStub, 403);
    });
});
