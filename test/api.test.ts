import * as sinon from 'sinon';
import { Response, Request } from 'express';

import * as apiController from '../src/controllers/api'
import * as testData from './testData';

describe('postActiveCollabWebhook', () => {
    it('should return formatted body', () => {
        let body = testData.rawNewTask;
        let req : Partial<Request> = {
            body: body
        };
        let res: Partial<Response> = {
            send: sinon.stub()
        };

        let expectedFormattedPayload : string =
                'A new task has been created.\n' +
                `Task Name: ${testData.rawNewTask.payload.name}\n` +
                `Project Name: ${testData.rawNewTask.payload.project_id}`;

        apiController.postActiveCollabWebhook(<Request>req, <Response>res);
        sinon.assert.calledWith(res.send as sinon.SinonStub, expectedFormattedPayload)
    });
});
