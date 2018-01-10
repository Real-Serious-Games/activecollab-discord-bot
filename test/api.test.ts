import * as sinon from 'sinon';
import { Response, Request } from 'express';

import { IDiscordController } from '../src/controllers/discord';
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

        const discordControllerStub: IDiscordController = {
            sendMessageToChannel: sinon.stub(),
            determineChannel: sinon.stub()
        };

        apiController.postActiveCollabWebhook(discordControllerStub, <Request>req, <Response>res);
        sinon.assert.calledOnce(res.send as sinon.SinonStub);
    });
});
