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
): void {
    // Express configuration
    express.set('port', config.get('port') || 8080);
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
        https.createServer(options, express).listen(8443);
        console.log('listening on port 8443');
    }
}
