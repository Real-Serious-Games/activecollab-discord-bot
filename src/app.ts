import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as logger from 'morgan';
import * as config from 'confucious';

import { IDiscordController } from './controllers/discord';
import { IApiController } from './controllers/api';

export function setupApp (
    express: express.Express,
    apiController: IApiController
): void {
    // Express configuration
    express.set('port', config.get('port') || 80);
    express.use(logger('dev'));
    express.use(bodyParser.json());

    const postActiveCollabWebhook = apiController.postActiveCollabWebhook;

    express.post('/api/webhook', postActiveCollabWebhook);
}
