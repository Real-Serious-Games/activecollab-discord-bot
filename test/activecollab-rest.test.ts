import { RequestAPI, UriOptions, UrlOptions } from 'request';
import { RequestPromise, RequestPromiseOptions } from 'request-promise-native';

import * as activeCollabRest from '../src/controllers/activecollab-rest';
import { createActiveCollabRestClient } from '../src/controllers/activecollab-rest';

describe('ActiveCollab Rest Client', () => {
    const loginUrl = 'https://my.activecollab.com/api/v1/external/login';
    const connectionStr = 'https://app.activecollab.com/1';

    it('should POST to correct URL for login', async () => {
        expect.assertions(1);

        const request = createRequestOkStub();

        await createDefaultTestObject(request);

        const expected = expect.objectContaining({
            url: loginUrl
        });

        expect(request.post).toBeCalledWith(expected);
    });

    it('uses specified username and password', async () => {
        expect.assertions(1);

        const request = createRequestOkStub();

        const testEmail = 'someone@example.com';
        const testPassword = 'Easy to remember, hard to guess';

        await createActiveCollabRestClient(
            <activeCollabRest.Request>request,
            'connection',
            testEmail,
            testPassword
        );

        const expected = expect.objectContaining({
            json: {
                email: testEmail,
                password: testPassword
            }
        });

        expect(request.post).toBeCalledWith(expected);
    });

    it('throws error on failed login with message if one is present', async () => {
        expect.assertions(1);

        const expectedMessage = 'Invalid password.';
        const request = createRequestStub(500, false, undefined, expectedMessage);

        await expect(createDefaultTestObject(request))
            .rejects.toMatchObject(
                new Error('Error 500 returned logging in: Invalid password.')
            );
    });

    it('throws generic error on failed login if no message is present', async () => {
        expect.assertions(1);

        const expectedMessage = 'Invalid password.';
        const request = createRequestStub(500, false, undefined, undefined);

        await expect(createDefaultTestObject(request))
            .rejects.toMatchObject(
                new Error('Recieved response code on login 500')
            );
    });

    it('throws error on login if user information not present', async () => {
        expect.assertions(1);

        const expectedMessage = 'Invalid password.';
        const request = createRequestStub(200, true, undefined, undefined);

        await expect(createDefaultTestObject(request))
            .rejects.toMatchObject(
                new Error('Could not retrieve user information from login.')
            );
    });

    it('should POST to correct URL to get token', async () => {
        expect.assertions(1);

        const request = createRequestOkStub();

        const issueTokenUrl = connectionStr
            + '/api/v1/?format=json&path_info=%2Fissue-token-intent';

        await createDefaultTestObject(request);

        const expected = expect.objectContaining({
            url: issueTokenUrl
        });

        expect(request.post).toBeCalledWith(expected);
    });

    it('specifies intent from login when requesting token', async () => {
        expect.assertions(1);

        const testIntent = 'test intent';
        const request = createRequestStub(200, true, testIntent);

        await createDefaultTestObject(request);

        const expected = expect.objectContaining({
            json: {
                intent: testIntent,
                client_name: 'Discord Integration',
                client_vendor: 'Real Serious Games'
            }
        });

        expect(request.post).toBeCalledWith(expected);
    });

    it('throws error on failure to obtain token', async () => {
        expect.assertions(1);

        const request: Partial<activeCollabRest.Request> = {
            post: jest.fn().mockReturnValueOnce(Promise.resolve({
                statusCode: 200,
                body: {
                    is_ok: true,
                    user: {
                        intent: 'intent'
                    }
                }
            })).mockReturnValueOnce(Promise.resolve({
                statusCode: 500
            }))
        };

        await expect(createDefaultTestObject(request))
            .rejects.toMatchObject(
                new Error('Error 500 returned requesting token.')
            );
    });

    it('sets token header on GET requests', async () => {
        expect.assertions(1);

        const expectedToken = 'test token';
        const request = createRequestStubWithToken(expectedToken);

        const api = await createDefaultTestObject(request);

        await api.get('/initial');

        const expected = expect.objectContaining({
            headers: {
                'X-Angie-AuthApiToken': expectedToken
            }
        });

        expect(request.get).toBeCalledWith(expected);
    });

    it('sets token header on POST requests', async () => {
        expect.assertions(1);

        const expectedToken = 'test token';
        const request = createRequestStubWithToken(expectedToken);

        const api = await createDefaultTestObject(request);

        const testRoute = '/projects/1/task-lists';
        await api.post(testRoute, {});

        const expected = expect.objectContaining({
            headers: {
                'X-Angie-AuthApiToken': expectedToken
            }
        });

        expect(request.post).toBeCalledWith(expected);
    });

    it('includes connection string and prefix in GET requests', async () => {
        expect.assertions(1);

        const request = createRequestOkStub();
        const api = await createDefaultTestObject(request);

        const testRoute = '/initial';
        const expected = expect.objectContaining({
            url: `${connectionStr}/api/v1${testRoute}`
        });
        await api.get(testRoute);

        expect(request.get).toBeCalledWith(expected);
    });

    it('includes connection string and prefix in POST requests', async () => {
        expect.assertions(1);

        const request = createRequestOkStub();
        const api = await createDefaultTestObject(request);

        const testRoute = '/task-lists';
        const expected = expect.objectContaining({
            url: `${connectionStr}/api/v1${testRoute}`
        });
        await api.post(testRoute, {});

        expect(request.post).toBeCalledWith(expected);
    });

    function createDefaultTestObject(request: Partial<activeCollabRest.Request>) {
        return createActiveCollabRestClient(
            <activeCollabRest.Request>request,
            connectionStr,
            'email',
            'password'
        );
    }

    function createRequestStubWithToken(token: string): Partial<activeCollabRest.Request> {
        return createRequestStub(200, true, 'test intent', token);
    }

    function createRequestOkStub(): Partial<activeCollabRest.Request> {
        return createRequestStub(200, true, 'test intent');
    }

    function createRequestStub(
        status: number,
        is_ok: boolean,
        intent?: string,
        message?: string,
        token?: string,
    ): Partial<activeCollabRest.Request> {
        return {
            post: jest.fn().mockReturnValueOnce(
                Promise.resolve({
                    statusCode: status,
                    body: {
                        is_ok: is_ok,
                        user: {
                            intent: intent
                        },
                        message: message
                    }
                })
            ).mockReturnValueOnce(
                Promise.resolve({
                    statusCode: status,
                    body: {
                        is_ok: is_ok,
                        token: token || 'test token'
                    }
                })
            ),
            get: jest.fn()
        };
    }
});
