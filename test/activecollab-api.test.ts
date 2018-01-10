'use strict';

import * as sinon from 'sinon';
import { RequestAPI, UriOptions, UrlOptions } from 'request';
import { RequestPromise, RequestPromiseOptions } from 'request-promise-native';

import * as activeCollabApi from '../src/controllers/activecollab-api';
import { createActiveCollabApi } from '../src/controllers/activecollab-api';

describe('ActiveCollab API', () => {
    const loginUrl = 'https://my.activecollab.com/api/v1/external/login';
    const connectionStr = 'https://app.activecollab.com/1';

    it('should POST to correct URL for login', () => {
        const request = createRequestOkStub();

        createActiveCollabApi(
            <activeCollabApi.Request>request,
            'connection',
            'email',
            'password'
        );

        const expected = {
            url: loginUrl
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
        expect.assertions(1);

        const expectedMessage = 'Invalid password.';
        const request = createRequestStub(500, false, undefined, expectedMessage);

        await expect(
            createActiveCollabApi(
                <activeCollabApi.Request>request,
                'connection',
                'someone@example.com',
                'password'
            )
        ).rejects.toMatchObject(
            new Error('Error 500 returned logging in: Invalid password.')
        );
    });

    it('should POST to correct URL to get token', async () => {
        const request = createRequestOkStub();

        const issueTokenUrl = connectionStr
            + '/api/v1/?format=json&path_info=%2Fissue-token-intent';

        await createActiveCollabApi(
            <activeCollabApi.Request>request,
            connectionStr,
            'email',
            'password'
        );

        const expected = {
            url: issueTokenUrl
        };

        sinon.assert.calledWithMatch(request.post as sinon.SinonStub, expected);
    });

    it('specifies intent from login when requesting token', async () => {
        const testIntent = 'test intent';

        const request = createRequestStub(200, true, testIntent);

        await createActiveCollabApi(
            <activeCollabApi.Request>request,
            connectionStr,
            'email',
            'password'
        );

        const expected = {
            json: {
                intent: testIntent,
                client_name: 'Discord Integration',
                client_vendor: 'Real Serious Games'
            }
        };

        sinon.assert.calledWithMatch(request.post as sinon.SinonStub, expected);
    });

    it('sets content-type header when requesting token', async () => {
        const request = createRequestOkStub();

        await createActiveCollabApi(
            <activeCollabApi.Request>request,
            connectionStr,
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

    it('throws error on failure to obtain token', async () => {
        expect.assertions(1);

        const request: Partial<activeCollabApi.Request> = {
            post: sinon.stub().onFirstCall().returns(Promise.resolve({
                status: 200,
                body: {
                    is_ok: true,
                    user: {
                        intent: 'intent'
                    }
                }
            })).onSecondCall().returns(Promise.resolve({
                status: 500
            }))
        };

        await expect(
            createActiveCollabApi(
                <activeCollabApi.Request>request,
                'connection',
                'someone@example.com',
                'password'
            )
        ).rejects.toMatchObject(
            new Error('Error 500 returned requesting token.')
        );
    });

    it('sets token header on GET requests', async () => {
        const expectedToken = 'test token';
        const request = createRequestStubWithToken(expectedToken);

        const api = await createActiveCollabApi(
            <activeCollabApi.Request>request,
            connectionStr,
            'email',
            'password'
        );

        const testRoute = '/api/v1/initial';
        await api.get(testRoute);

        const expected = {
            headers: {
                'X-Angie-AuthApiToken': expectedToken
            }
        };

        sinon.assert.calledWithMatch(request.get as sinon.SinonStub, expected);
    });

    it('sets token header on POST requests', async () => {
        const expectedToken = 'test token';
        const request = createRequestStubWithToken(expectedToken);

        const api = await createActiveCollabApi(
            <activeCollabApi.Request>request,
            connectionStr,
            'email',
            'password'
        );

        const testRoute = '/api/v1/projects/1/task-lists';
        await api.post(testRoute, {});

        const expected = {
            headers: {
                'X-Angie-AuthApiToken': expectedToken
            }
        };

        sinon.assert.calledWithMatch(request.post as sinon.SinonStub, expected);
    });

    function createRequestStubWithToken(token: string): Partial<activeCollabApi.Request> {
        return createRequestStub(200, true, 'test intent', token);
    }

    function createRequestOkStub(): Partial<activeCollabApi.Request> {
        return createRequestStub(200, true, 'test intent');
    }

    function createRequestStub(
        status: number,
        is_ok: boolean,
        intent?: string,
        message?: string,
        token?: string,
    ): Partial<activeCollabApi.Request> {
        return {
            post: sinon.stub().onFirstCall().returns(
                Promise.resolve({
                    status: status,
                    body: {
                        is_ok: is_ok,
                        user: {
                            intent: intent
                        },
                        message: message
                    }
                })
            ).onSecondCall().returns(
                Promise.resolve({
                    status: status,
                    body: {
                        is_ok: is_ok,
                        token: token || 'test token'
                    }
                })
            ),
            get: sinon.spy()
        };
    }
});
