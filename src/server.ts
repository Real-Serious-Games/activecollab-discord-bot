import * as config from 'confucious';
import * as discord from 'discord.js';

import { App } from './app';
import { DiscordController } from './controllers/discord';

// Setup config
config.pushJsonFile('./src/config.json');
config.pushEnv();
config.pushArgv();

const discordController = new DiscordController(config.get('token'), new discord.Client());
const app =  new App(discordController);

const server = App.express.listen(App.express.get('port'), () => {
    console.log(('  App is running at http://localhost:%d in %s mode'), App.express.get('port'), App.express.get('env'));
    console.log('  Press CTRL-C to stop\n');
});

export = server;
