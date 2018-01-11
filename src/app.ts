import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as logger from 'morgan';
import * as config from 'confucious';

import { IDiscordController } from './controllers/discord';
import { IApiController } from './controllers/api';

export function setupApp (
    express: express.Express,
    discordController: IDiscordController,
    apiController: IApiController
): void {
    // Express configuration
    express.set('port', config.get('port') || 8080);
    express.use(logger('dev'));
    express.use(bodyParser.json());

    const postActiveCollabWebhook = apiController
        .postActiveCollabWebhookFactory(discordController);

    express.post('/api/webhook', postActiveCollabWebhook);
}
