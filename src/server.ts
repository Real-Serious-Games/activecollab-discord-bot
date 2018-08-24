import * as config from 'confucious';
import * as discord from 'discord.js';
import * as express from 'express';
import * as mongoose from 'mongoose';
import * as request from 'request-promise-native';

import { Logger } from 'structured-log';
import { setupApp } from './app';
import { DiscordController } from './controllers/discord';
import { createApiController } from './controllers/api';
import { createLogger } from './controllers/logger';
import { createEventController } from './controllers/event';
import { createActiveCollabAPI } from './controllers/activecollab-api';
import { createActiveCollabRestClient } from './controllers/activecollab-rest';
import { createMappingController, ChannelMap, UserMap } from './controllers/mapping';
import { createCommandController } from './controllers/command';
import { createDatabaseController } from './controllers/database';

async function createServer() {
    // Setup config
    config.pushJsonFile('./config.json');
    config.pushEnv();
    config.pushArgv();

    const app = express();

    const logger = createLogger();

    try {
        const mappingController = createMappingController(
            () => getConfigValue('channels'),
            () => getConfigValue('users')
        );

        const activeCollabRestClient = await createActiveCollabRestClient(
            request,
            getConfigValue('activeCollab:connectionStr'),
            getConfigValue('activeCollab:email'),
            getConfigValue('activeCollab:password')
        );

        const activeCollabApi = createActiveCollabAPI(activeCollabRestClient);

        connectToDatabase(logger);

        const databaseController = createDatabaseController();

        const commandController = createCommandController(
            activeCollabApi,
            mappingController,
            databaseController,
            logger
        );

        const discordController = new DiscordController(
            getConfigValue('discordBotToken'),
            new discord.Client(),
            mappingController,
            commandController,
            logger,
            getConfigValue('commandPrefix'),
            getConfigValue('guildNames')
        );

        const eventController = createEventController(
            activeCollabApi,
            mappingController,
            discordController,
            getConfigValue('activeCollab:connectionStr')
        );

        const apiController = createApiController(
            discordController,
            getConfigValue('webhookSecret'),
            logger,
            eventController
        );

        const server = setupApp(app, apiController);

        // if (server) {
        console.log('Running HTTPS server');
        //     return server;
        // }
        // else {
        console.log('Running HTTP server');
        return app.listen(app.get('port'), () => {
            logger.info('  App is running at http://localhost:{port} in {env} mode',
                app.get('port'), app.get('env')
            );

            logger.info('  Press CTRL-C to stop\n');
        });
        // }
    } catch (e) {
        logger.fatal('Unable to setup server: {e}', e);
        throw e;
    }
}

function getConfigValue(key: string): any {
    const value = config.get(key);

    if (value == undefined) {
        throw new Error(`Missing config: ${key}`);
    }

    return value;
}

async function connectToDatabase (logger: Logger) {
    let databaseConnected = false;
    let errorMessage;
    try {
        // May want to rename the database to something more appropriate (currently 'database' as shown below)
        await mongoose.connect('mongodb://mongodb:27017/database'); 
        databaseConnected = true;
        logger.info('Connected to docker database successfully');
    }
    catch (error) {
        errorMessage = error;
    }
    // If the remote database failed, try a local database
    if (!databaseConnected) {
        try {
            // May want to rename the database to something more appropriate (currently 'database' as shown below
            await mongoose.connect('mongodb://localhost:27017/database');
            databaseConnected = true;
            logger.info('Connected to local database successfully');
        }
        catch (error) {
            errorMessage = error;
        }
    }
    if (!databaseConnected) {
        logger.error(errorMessage);
    }
}

export = createServer()
    .catch(e => {
        console.log(`Server Error: ${e}`);
    });
