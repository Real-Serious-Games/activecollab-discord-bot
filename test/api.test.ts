import * as sinon from 'sinon';
import { Response, Request } from 'express';
import { Client } from 'discord.js';

import { IDiscordController, SendMessageToChannel, DetermineChannel } from '../src/controllers/discord';
import * as apiController from '../src/controllers/api';
import * as testData from './testData';

describe('postActiveCollabWebhook', () => {
    it('should call send', () => {
        const body = testData.rawNewTask;

        const req: Partial<Request> = {
            body: body
        };

        const res: Partial<Response> = {
            send: sinon.stub()
        };

        const client: Partial<Client> = {
        };


        const discordControllerStub: IDiscordController = {
            client: <Client>client,
            sendMessageToChannel: <SendMessageToChannel>sinon.stub(),
            determineChannel: <DetermineChannel>sinon.stub()
        };

        apiController.postActiveCollabWebhook(discordControllerStub, <Request>req, <Response>res);
        sinon.assert.calledOnce(res.send as sinon.SinonStub);
    });
});
