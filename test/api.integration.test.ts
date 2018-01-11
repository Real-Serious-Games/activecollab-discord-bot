'use strict';

import * as request from 'supertest';
import * as sinon from 'sinon';
import { Client } from 'discord.js';

const chai = require('chai');
const expect = chai.expect;

import { App } from '../src/app';
import * as testData from './testData';
import { Task } from '../src/models/taskEvent';
import { IDiscordController, SendMessageToChannel, DetermineChannel } from '../src/controllers/discord';


describe('POST /api/webhook', () => {
    it('should return status 200', (done) => {
        const client: Partial<Client> = {
        };

        const discordControllerStub: IDiscordController = {
            client: <Client>client,
            sendMessageToChannel: <SendMessageToChannel>sinon.stub(),
            determineChannel: <DetermineChannel>sinon.stub()
        };

        const app = new App(discordControllerStub);
        
        return request(App.express).post('/api/webhook')
            .send(testData.rawNewTask)
            .end(function(err, res) {
                expect(res.status).to.equal(200);
                done();
      });
  });
});
