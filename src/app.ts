import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as logger from 'morgan';
import * as config from 'confucious';
import * as circularJson from 'circular-json';

// Controllers (route handlers)
import * as apiController from './controllers/api';

// Setup config
config.pushJsonFile('./src/config.json');
config.pushEnv();
config.pushArgv();

// Create Express server
const app = express();

// Express configuration
app.set('port', config.get('port') || 8080);
app.use(logger('dev'));
app.use(bodyParser.json());
// app.use(function (req, res, next) {
//     console.log('Request Body:\n' + circularJson.stringify(req.body, undefined, 2));
//     next();
// });

import * as discordController from './controllers/discord';

const postActiveCollabWebhook = apiController.postActiveCollabWebhookFactory(discordController.sendMessageToHook, discordController.determineChannel);
app.post('/api/webhook', postActiveCollabWebhook);

module.exports = app;
