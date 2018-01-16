import { RequestAPI, UriOptions, UrlOptions } from 'request';
import { RequestPromise, RequestPromiseOptions } from 'request-promise-native';

export type Request =
    RequestAPI<RequestPromise, RequestPromiseOptions, UriOptions | UrlOptions>;

const requestPrefix = '/api/v1';

function get(
    request: Request,
    connectionStr: string,
    token: string,
    route: string
): Promise<Object> {
    return request.get({
        url: connectionStr + requestPrefix + route,
        headers: {
            'X-Angie-AuthApiToken': token
        },
        json: true
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
        url: connectionStr + requestPrefix + route,
        headers: {
            'X-Angie-AuthApiToken': token
        },
        json: body
    });
}

// Login using an email and password and return the API token
async function login(
    request: Request,
    connectionStr: string,
    email: string,
    password: string
): Promise<string> {

    const login = await request.post({
        url: 'https://my.activecollab.com/api/v1/external/login',
        json: {
            email: email,
            password: password
        },
        resolveWithFullResponse: true
    });

    if (login.statusCode !== 200 || !login.body || !login.body.is_ok) {
        if (login.body && login.body.message) {
            throw new Error(`Error ${login.statusCode} returned logging in: ${login.body.message}`);
        }
        throw new Error(`Recieved response code on login ${login.statusCode}`);
    }

    if (!login.body.user || !login.body.user.intent) {
        throw new Error ('Could not retrieve user information from login.');
    }

    const issueToken = await request.post({
        url: connectionStr + '/api/v1/?format=json&path_info=%2Fissue-token-intent',
        json: {
            intent: login.body.user.intent,
            client_name: 'Discord Integration',
            client_vendor: 'Real Serious Games'
        },
        resolveWithFullResponse: true
    });

    if (issueToken.statusCode !== 200 || !issueToken.body || !issueToken.body.token) {
        throw new Error(`Error ${issueToken.statusCode} returned requesting token.`);
    }

    return issueToken.body.token;
}

export interface IActiveCollabRestClient {
    /**
     * Sends an HTTP GET request to the ActiveCollab API
     */
    get: (route: string) => Promise<Object>;

    /**
     * Sends an HTTP POST request to the ActiveCollab API
     */
    post: (route: string, body: Object) => Promise<Object>;
}

export async function createActiveCollabRestClient(
    request: Request,
    connectionStr: string,
    email: string,
    password: string
): Promise<IActiveCollabRestClient> {
    // Login
    const token = await login(request, connectionStr, email, password);

    return {
        get: get.bind(undefined, request, connectionStr, token),
        post: post.bind(undefined, request, connectionStr, token)
    };
}