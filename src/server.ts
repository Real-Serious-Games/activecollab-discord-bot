import * as config from 'confucious';
import * as discord from 'discord.js';
import * as express from 'express';
import * as structuredLog from 'structured-log/src';

import { setupApp } from './app';
import { DiscordController } from './controllers/discord';
import { createApiController } from './controllers/api';

// Setup config
config.pushJsonFile('./config.json');
config.pushEnv();
config.pushArgv();

const app = express();

const logger = structuredLog
    .configure()
    .writeTo(new structuredLog.ConsoleSink())
    .create();

const discordController = new DiscordController(
    config.get('discordBotToken'),
    new discord.Client()
);

const apiController = createApiController(
    discordController,
    config.get('webhookSecret')
);

setupApp(app, logger, discordController, apiController);

const server = app.listen(app.get('port'), () => {
    logger.info('  App is running at http://localhost:{port} in {env} mode',
        app.get('port'), app.get('env')
    );

    logger.info('  Press CTRL-C to stop\n');
});

export = server;
