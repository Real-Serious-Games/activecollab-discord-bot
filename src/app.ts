import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as logger from 'morgan';
import * as config from 'confucious';

// Controllers (route handlers)
import * as apiController from './controllers/api';

// Setup config
config.pushEnv();
config.pushArgv();

// Create Express server
const app = express();

// Express configuration
app.set('port', config.get('port') || 8080);
app.use(bodyParser.json());
app.use(logger('dev'));

app.post('/api/webhook', apiController.postActiveCollabWebhook);

module.exports = app;
