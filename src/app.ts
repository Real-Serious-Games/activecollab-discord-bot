import * as https from 'https';
import * as fs from 'fs';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as logger from 'morgan';
import * as config from 'confucious';

import { IDiscordController } from './controllers/discord';
import { IApiController } from './controllers/api';

export function setupApp(
    express: express.Express,
    apiController: IApiController
): https.Server | undefined {
    // Express configuration
    express.set('port', 80 || 8080);
    express.use(logger('dev'));
    express.use(bodyParser.json());

    const postActiveCollabWebhook = apiController.postActiveCollabWebhook;
    const postCommandWebhook = apiController.postCommandWebhook;

    express.post('/api/webhook', postActiveCollabWebhook);
    express.post('/api/cwebhook', postCommandWebhook);
    express.disable('x-powered-by');

    // https configuration
    const options = {
        key: fs.readFileSync('./keys/key.pem'),
        cert: fs.readFileSync('./keys/cert.pem')
    };

    if (options.key.length > 0 && options.cert.length > 0) {
        console.log('listening on port 443');
        return https.createServer(options, express).listen(443);
    }
    return undefined;
}
