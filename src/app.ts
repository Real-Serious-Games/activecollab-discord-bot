import * as https from 'https';
import * as fs from 'fs';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as logger from 'morgan';

import { IApiController } from './controllers/api';

export function setupApp(
    express: express.Express,
    apiController: IApiController,
    spoofKey?: Buffer,
    spoofCert?: Buffer
): https.Server | undefined {
    // Express configuration
    express.set('port', 80 || 8080);
    express.use(logger('dev'));
    express.use(bodyParser.json());

    const postActiveCollabWebhook = apiController.postActiveCollabWebhook;
    const postCommandWebhook = apiController.postCommandWebhook;

    express.post('/api/webhook', postActiveCollabWebhook);
    express.post('/api/cwebhook', postCommandWebhook);
    express.get('/', (req, res) => {
        return res.end('Test');
    });
    express.disable('x-powered-by');

    if (fs.existsSync('./keys/key.pem') && fs.existsSync('./keys/cert.pem')) {
        // https configuration
        const options = {
            key: fs.readFileSync('./keys/key.pem'),
            cert: fs.readFileSync('./keys/cert.pem')
        };

        if (options.key.length > 0 && options.cert.length > 0) {
            console.log('SSL key and certificate found, creating server...');
            return https.createServer(options, express);
        }
        else {
            throw new Error('SSL Certificate or Key is empty!');
        }
    }
    else {
        // Allows for spoofing the certificate in tests
        if (spoofKey && spoofCert) {
            // https configuration
            const options = {
                key: spoofKey,
                cert: spoofCert
            };

            if (options.key.length > 0 && options.cert.length > 0) {
                console.log('SSL key and certificate found, creating server...');
                return https.createServer(options, express);
            }
            else {
                throw new Error('SSL Certificate or Key is empty!');
            }
        }

        throw new Error('SSL Certificate and/or Key do not exist!\n'
            + 'Place \'key.pem\' & \'cert.pem\' into a \'keys\' directory (./keys/<name>.pem)');
    }
}
