import * as request from 'supertest';
import { Client } from 'discord.js';
import * as express from 'express';
import { Logger } from 'structured-log/src';

import { setupApp } from '../src/app';
import * as testData from './testData';
import { Task } from '../src/models/taskEvent';
import { createApiController } from '../src/controllers/api';
import { IDiscordController, SendMessageToChannel, DetermineChannel } from '../src/controllers/discord';
import { IEventController, createEventController } from '../src/controllers/event';
import { IActiveCollabAPI } from '../src/controllers/activecollab-api';

describe('POST /api/webhook', () => {
    it('should return status 200 when webhook secret present', (done) => {
        const webhookSecret = 'secret';

        const client: Partial<Client> = { };

        const discordControllerStub: IDiscordController = {
            sendMessageToChannel: <SendMessageToChannel>jest.fn(),
            determineChannel: <DetermineChannel>jest.fn()
        };

        const eventController: IEventController = createEventController(
            { } as IActiveCollabAPI
        );

        const app = express();
        const logger: Partial<Logger> = { };
        const apiController = createApiController(
            discordControllerStub,
            webhookSecret,
            <Logger>logger,
            <IEventController>eventController);

        setupApp(app, <Logger>logger, discordControllerStub, apiController);
        
        return request(app)
            .post('/api/webhook')
            .set('X-Angie-WebhookSecret', webhookSecret)
            .send(testData.getRawNewTask())
            .end(function(err, res) {
                expect(res.status).toEqual(200);
                done();
        });
    });

   it('should return status 403 when missing webhook secret', (done) => {
        const webhookSecret = 'secret';

        const client: Partial<Client> = {
        };

        const discordControllerStub: IDiscordController = {
            sendMessageToChannel: <SendMessageToChannel>jest.fn(),
            determineChannel: <DetermineChannel>jest.fn()
        };

        const eventControllerStub: IEventController = {
            processEvent: jest.fn()
        };

        const app = express();
        const logger: Partial<Logger> = { };
        const apiController = createApiController(
            discordControllerStub,
            webhookSecret,
            <Logger>logger,
            <IEventController>eventControllerStub);

        setupApp(app, <Logger>logger, discordControllerStub, apiController);
        
        return request(app)
            .post('/api/webhook')
            .send(testData.getRawNewTask())
            .end(function(err, res) {
                expect(res.status).toEqual(403);
                done();
        });
    });
});