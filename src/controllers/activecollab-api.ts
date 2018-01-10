'use strict';

import { RequestAPI, UriOptions, UrlOptions } from 'request';
import { RequestPromise, RequestPromiseOptions } from 'request-promise-native';

export type Request =
    RequestAPI<RequestPromise, RequestPromiseOptions, UriOptions | UrlOptions>;

function get(
    request: Request,
    connectionStr: string,
    token: string,
    route: string
): Promise<Object> {
    return request.get({
        url: connectionStr + route,
        headers: {
            'X-Angie-AuthApiToken': token
        }
    });
}

function post(
    request: Request,
    connectionStr: string,
    token: string,
    route: string,
    body: Object
): Promise<Object> {
    return request.post({
        url: connectionStr + route,
        headers: {
            'X-Angie-AuthApiToken': token,
            'Content-Type': 'application/json'
        },
        body: body
    });
}

// Login using an email and password and return the API token
async function login(
    request: Request,
    email: string,
    password: string
): Promise<string> {
    const login = await request.post({
        url: 'https://my.activecollab.com/api/v1/external/login',
        headers: {
            'Content-Type': 'application/json'
        },
        json: {
            email: email,
            password: password
        }
    });

    if (login.status !== 200 || !login.body || !login.body.is_ok) {
        if (login.body && login.body.message) {
            throw new Error(`Error ${login.status} returned logging in: ${login.body.message}`);
        }
        throw new Error(`Recieved response code on login ${login.status}`);
    }

    if (!login.body.user || !login.body.user.intent) {
        throw new Error ('Could not retrieve user information from login.');
    }

    return login.body.user.intent;
}

export interface ActiveCollabAPI {
    get: (route: string) => Promise<Object>;

    post: (route: string, body: Object) => Promise<Object>;
}

export async function createActiveCollabApi(
    request: Request,
    connectionStr: string,
    email: string,
    password: string
): Promise<ActiveCollabAPI> {
    // Login
    const token = await login(request, email, password);

    return {
        get: get.bind(undefined, request, connectionStr, token),
        post: post.bind(undefined, request, connectionStr, token)
    };
}