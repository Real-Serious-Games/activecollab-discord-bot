import * as config from 'confucious';
import * as discord from 'discord.js';
import * as express from 'express';

import { setupApp } from './app';
import { DiscordController } from './controllers/discord';
import { createApiController } from './controllers/api';
import { createLogger } from './controllers/logger';

// Setup config
config.pushJsonFile('./config.json');
config.pushEnv();
config.pushArgv();

const app = express();

const logger = createLogger();

const discordController = new DiscordController(
    config.get('discordBotToken'),
    new discord.Client(),
    (projectId: number) => config.get(`channels:${projectId}`)
);

const apiController = createApiController(
    discordController,
    config.get('webhookSecret'),
    logger
);

setupApp(app, logger, discordController, apiController);

const server = app.listen(app.get('port'), () => {
    logger.info('  App is running at http://localhost:{port} in {env} mode',
        app.get('port'), app.get('env')
    );

    logger.info('  Press CTRL-C to stop\n');
});

export = server;
