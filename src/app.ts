import * as express from 'express';

// Create Express server
const app = express();

// Express configuration
app.set('port', process.env.PORT || 8080);

module.exports = app;
