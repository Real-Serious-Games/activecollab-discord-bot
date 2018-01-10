import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as logger from 'morgan';
import * as config from 'confucious';

import { IDiscordController } from './controllers/discord';

// Controllers (route handlers)
// TODO: App apiController via constructor
import * as apiController from './controllers/api';

export class App {
    public static express: express.Express;

    public constructor(discordController: IDiscordController) {
        if (App.express != undefined) {
            return;
        }

        App.express = express();

        // Create Express server
        const app = express();

        // Express configuration
        App.express.set('port', config.get('port') || 8080);
        App.express.use(logger('dev'));
        App.express.use(bodyParser.json());

        const postActiveCollabWebhook = apiController
            .postActiveCollabWebhookFactory(discordController);

        App.express.post('/api/webhook', postActiveCollabWebhook);
    }
}
