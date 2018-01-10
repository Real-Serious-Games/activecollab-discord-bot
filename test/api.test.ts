import * as sinon from 'sinon';
import { Response, Request } from 'express';

import { SendMessageToHook, DetermineWebhookClient } from '../src/controllers/discord';
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
        const sendMessageToHook: SendMessageToHook = sinon.stub();
        const determineWebhookClient: DetermineWebhookClient = sinon.stub();

        apiController.postActiveCollabWebhook(sendMessageToHook, determineWebhookClient, <Request>req, <Response>res);
        sinon.assert.calledOnce(res.send as sinon.SinonStub);
    });
});
