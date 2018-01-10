'use strict';

import * as sinon from 'sinon';
import { RequestAPI, UriOptions, UrlOptions } from 'request';
import { RequestPromise, RequestPromiseOptions } from 'request-promise-native';

import * as activeCollabApi from '../src/controllers/activecollab-api';
import { createActiveCollabApi } from '../src/controllers/activecollab-api';

describe('ActiveCollab API', () => {
    it('should POST to correct URL for login', () => {
        const request = createRequestOkStub();

        createActiveCollabApi(
            <activeCollabApi.Request>request,
            'connection',
            'email',
            'password'
        );

        const expected = {
            url: 'https://my.activecollab.com/api/v1/external/login'
        };

        sinon.assert.calledWithMatch(request.post as sinon.SinonStub, expected);
    });

    it('sets content-type header to application/json on login', () => {
        const request = createRequestOkStub();

        createActiveCollabApi(
            <activeCollabApi.Request>request,
            'connection',
            'email',
            'password'
        );

        const expected = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        sinon.assert.calledWithMatch(request.post as sinon.SinonStub, expected);
    });

    it('uses specified username and password', () => {
        const request = createRequestOkStub();

        const testEmail = 'someone@example.com';
        const testPassword = 'Easy to remember, hard to guess';

        createActiveCollabApi(
            <activeCollabApi.Request>request,
            'connection',
            testEmail,
            testPassword
        );

        const expected = {
            json: {
                email: testEmail,
                password: testPassword
            }
        };

        sinon.assert.calledWithMatch(request.post as sinon.SinonStub, expected);
    });

    it('throws error on failed login', async () => {
        const expectedMessage = 'Invalid password.';
        const request = createRequest(500, false, undefined, expectedMessage);

        expect.assertions(1);

        await expect(createActiveCollabApi(
                <activeCollabApi.Request>request,
                'connection',
                'someone@example.com',
                'password'
            )
        ).rejects.toMatchObject(
            new Error('Error 500 returned logging in: Invalid password.')
        );
    });

    function createRequestOkStub(): Partial<activeCollabApi.Request> {
        return createRequest(200, true, 'test intent');
    }

    function createRequest(
        status: number,
        is_ok: boolean,
        intent?: string,
        message?: string
    ): Partial<activeCollabApi.Request> {
        return {
            post: sinon.stub().returns(Promise.resolve({
                status: status,
                body: {
                    is_ok: is_ok,
                    user: {
                        intent: intent
                    },
                    message: message
                }
            }))
        };
    }
});
