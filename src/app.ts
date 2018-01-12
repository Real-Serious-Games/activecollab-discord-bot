import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as morganLogger from 'morgan';
import * as config from 'confucious';
import { Logger } from 'structured-log/src';

import { IDiscordController } from './controllers/discord';
import { IApiController } from './controllers/api';

export function setupApp (
    express: express.Express,
    logger: Logger,
    discordController: IDiscordController,
    apiController: IApiController
): void {
    // Express configuration
    express.set('port', config.get('port') || 8080);
    express.use(morganLogger('dev'));
    express.use(bodyParser.json());

    const postActiveCollabWebhook = apiController
        .postActiveCollabWebhookFactory(discordController, logger);

    express.post('/api/webhook', postActiveCollabWebhook);
}
