import * as config from 'confucious';
import * as discord from 'discord.js';
import * as express from 'express';
import * as request from 'request-promise-native';

import { setupApp } from './app';
import { DiscordController } from './controllers/discord';
import { createApiController } from './controllers/api';
import { createLogger } from './controllers/logger';
import { createEventController } from './controllers/event';
import { createActiveCollabAPI } from './controllers/activecollab-api';
import { createActiveCollabRestClient } from './controllers/activecollab-rest';
import { createMappingController, ChannelMap, UserMap } from './controllers/mapping';

async function createServer() {
    // Setup config
    config.pushJsonFile('./config.json');
    config.pushEnv();
    config.pushArgv();

    const app = express();

    const logger = createLogger();

    try {
        const mappingController = createMappingController(
            () => config.get('channels'),
            () => config.get('users')
        );
    
        const discordController = new DiscordController(
            config.get('discordBotToken'),
            new discord.Client(),
            mappingController,
            config.get('guildName')
        );

        const activeCollabRestClient = await createActiveCollabRestClient(
            request,
            config.get('activeCollab:connectionStr'),
            config.get('activeCollab:email'),
            config.get('activeCollab:password')
        );

        const activeCollabApi = createActiveCollabAPI(activeCollabRestClient);
        const eventController = createEventController(
            activeCollabApi,
            mappingController,
            discordController);

        const apiController = createApiController(
            discordController,
            config.get('webhookSecret'),
            logger,
            eventController
        );

        setupApp(app, apiController);

        return app.listen(app.get('port'), () => {
            logger.info('  App is running at http://localhost:{port} in {env} mode',
                app.get('port'), app.get('env')
            );

            logger.info('  Press CTRL-C to stop\n');
        });
    } catch (e) {
        logger.fatal('Unable to setup server: {e}', JSON.stringify(e, undefined, 4));
        throw e;
    }
}

export = createServer()
    .catch(e => {
        console.log(  `Server Error: ${JSON.stringify(e, undefined, 4)}`);
     });
