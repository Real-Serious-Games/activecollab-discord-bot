'use strict';

import * as sinon from 'sinon';
import { RequestAPI, UriOptions, UrlOptions } from 'request';
import { RequestPromise, RequestPromiseOptions } from 'request-promise-native';

import * as activeCollabApi from '../src/controllers/activecollab-api';
import { createActiveCollabApi } from '../src/controllers/activecollab-api';

describe('ActiveCollab API', () => {
    it('should POST to correct URL on creation', () => {
        const request: Partial<activeCollabApi.Request> = {
            post: sinon.stub().returns(Promise.resolve({
                status: 200,
                body: {
                    is_ok: true,
                    user: {
                        intent: 'test intent'
                    }
                }
            }))
        };

        createActiveCollabApi(
            <activeCollabApi.Request>request,
            'connection',
            'email',
            'password'
        );

        const expectedPayload = {
            url: 'https://my.activecollab.com/api/v1/external/login'
        };

        sinon.assert.calledWithMatch(request.post as sinon.SinonStub, expectedPayload);
    });
});