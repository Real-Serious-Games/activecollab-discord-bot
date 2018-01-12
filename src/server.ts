import * as config from 'confucious';
import * as discord from 'discord.js';
import * as express from 'express';

import { setupApp } from './app';
import { DiscordController } from './controllers/discord';
import { ApiController } from './controllers/api';
import { disconnect } from 'cluster';

// Setup config
config.pushJsonFile('./config.json');
config.pushEnv();
config.pushArgv();

const app = express();

const discordController = new DiscordController(config.get('discordBotToken'), new discord.Client());
const apiController = new ApiController(discordController, config.get('webhookSecret'));

setupApp(app, discordController, apiController);

const server = app.listen(app.get('port'), () => {
    console.log('  App is running at http://localhost:%d in %s mode', app.get('port'), app.get('env'));
    console.log('  Press CTRL-C to stop\n');
});

export = server;
