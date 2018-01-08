import * as sinon from 'sinon';
import { Response, Request } from 'express';

import * as app from '../src/app';
import * as api from '../src/controllers/api'

describe('postActiveCollabWebhook', () => {
    it('should return body', () => {
        let body = { test: 'test' };
        let req : Partial<Request> = {
            body: body
        };
        let res: Partial<Response> = {
            send: sinon.stub()
        };

        api.postActiveCollabWebhook(<Request>req, <Response>res);
        sinon.assert.calledWith(res.send as sinon.SinonStub, { test: 'test' })
    });
});
