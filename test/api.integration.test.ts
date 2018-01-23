import * as request from 'supertest';
import { Client } from 'discord.js';
import * as express from 'express';
import { Logger } from 'structured-log/src';
import { right } from 'fp-ts/lib/Either';

import { setupApp } from '../src/app';
import * as testData from './testData';
import { Task } from '../src/models/taskEvent';
import { createApiController } from '../src/controllers/api';
import { IDiscordController, } from '../src/controllers/discord';
import { IEventController, IProcessedEvent, createEventController } from '../src/controllers/event';
import { IActiveCollabAPI } from '../src/controllers/activecollab-api';
import { IMappingController } from '../src/controllers/mapping';

describe('POST /api/webhook', () => {
    it('should return status 200 when webhook secret present', (done) => {
        const webhookSecret = 'secret';

        const client: Partial<Client> = { };

        const discordControllerStub: Partial<IDiscordController> = {
            sendMessageToChannel: jest.fn(),
            determineChannel: jest.fn(),
            getUserId: jest.fn()
        };

        const mockMappingController: Partial<IMappingController> = {
            getDiscordUser: jest.fn()
        };

        const mockEventController: Partial<IEventController> = {
            processEvent: jest.fn(() => Promise.resolve(right({ })))
        };

        const app = express();
        const logger: Partial<Logger> = { };
        const apiController = createApiController(
            discordControllerStub as IDiscordController,
            webhookSecret,
            <Logger>logger,
            <IEventController>mockEventController);

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

        const client: Partial<Client> = {
        };

        const discordControllerStub: Partial<IDiscordController> = {
            sendMessageToChannel: jest.fn(),
            determineChannel: jest.fn()
        };

        const eventControllerStub: IEventController = {
            processEvent: jest.fn()
        };

        const app = express();
        const logger: Partial<Logger> = { };
        const apiController = createApiController(
            discordControllerStub as IDiscordController,
            webhookSecret,
            <Logger>logger,
            <IEventController>eventControllerStub);

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