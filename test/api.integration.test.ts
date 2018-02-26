import * as request from 'supertest';
import { Client } from 'discord.js';
import * as express from 'express';

import { setupApp } from '../src/app';
import * as testData from './testData';
import { ApiControllerBuilder } from './builders/apiControllerBuilder';

describe('POST /api/webhook', () => {
    it('should return status 200 when webhook secret present', (done) => {
        const webhookSecret = 'secret';

        const app = express();

        const apiController = new ApiControllerBuilder()
            .withWebhookSecret(webhookSecret)
            .build();

        setupApp(app, apiController);
        
        return request(app)
            .post('/api/webhook')
            .set('X-Angie-WebhookSecret', webhookSecret)
            .send(testData.getRawNewComment())
            .end(function(err, res) {
                expect(res.status).toEqual(200);
                done();
        });
    });

   it('should return status 403 when missing webhook secret', (done) => {
        const webhookSecret = 'secret';

        const app = express();

        const apiController = new ApiControllerBuilder()
            .withWebhookSecret(webhookSecret)
            .build();

        setupApp(app, apiController);
        
        return request(app)
            .post('/api/webhook')
            .send(testData.getRawNewTask())
            .end(function(err, res) {
                expect(res.status).toEqual(403);
                done();
        });
    });
});