import * as request from 'supertest';
import * as sinon from 'sinon';
import { Client } from 'discord.js';
import * as express from 'express';

const chai = require('chai');
const expect = chai.expect;

import { setupApp } from '../src/app';
import * as testData from './testData';
import { Task } from '../src/models/taskEvent';
import { createApiController } from '../src/controllers/api';
import { IDiscordController, SendMessageToChannel, DetermineChannel } from '../src/controllers/discord';


describe('POST /api/webhook', () => {
    it('should return status 200 when webhook secret present', (done) => {
        const webhookSecret = 'secret';

        const client: Partial<Client> = {
        };

        const discordControllerStub: IDiscordController = {
            sendMessageToChannel: <SendMessageToChannel>sinon.stub(),
            determineChannel: <DetermineChannel>sinon.stub()
        };

        const app = express();

        const apiController = createApiController(discordControllerStub, webhookSecret);

        setupApp(app, discordControllerStub, apiController);
        
        return request(app)
            .post('/api/webhook')
            .set('X-Angie-WebhookSecret', webhookSecret)
            .send(testData.rawNewTask)
            .end(function(err, res) {
                expect(res.status).to.equal(200);
                done();
      });
  });

  it('should return status 403 when missing webhook secret', (done) => {
    const webhookSecret = 'secret';

    const client: Partial<Client> = {
    };

    const discordControllerStub: IDiscordController = {
        sendMessageToChannel: <SendMessageToChannel>sinon.stub(),
        determineChannel: <DetermineChannel>sinon.stub()
    };

    const app = express();

    const apiController = createApiController(discordControllerStub, webhookSecret);

    setupApp(app, discordControllerStub, apiController);
    
    return request(app)
        .post('/api/webhook')
        .send(testData.rawNewTask)
        .end(function(err, res) {
            expect(res.status).to.equal(403);
            done();
  });
});
});
