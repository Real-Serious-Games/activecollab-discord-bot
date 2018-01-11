import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as logger from 'morgan';
import * as config from 'confucious';

import { IDiscordController } from './controllers/discord';

// Controllers (route handlers)
// TODO: App apiController via constructor
import * as apiController from './controllers/api';

export function setupApp (
    express: express.Express,
    discordController: IDiscordController
): void {
    // Express configuration
    express.set('port', config.get('port') || 8080);
    express.use(logger('dev'));
    express.use(bodyParser.json());

    const postActiveCollabWebhook = apiController
        .postActiveCollabWebhookFactory(discordController);

    express.post('/api/webhook', postActiveCollabWebhook);
}
