import * as request from 'supertest';
import * as sinon from 'sinon';

const chai = require('chai');
const expect = chai.expect;

import { App } from '../src/app';
import * as testData from './testData';
import { Task } from '../src/models/taskEvent';
import { IDiscordController } from '../src/controllers/discord';

describe('POST /api/webhook', () => {
    it('should return status 200', (done) => {
        const discordControllerStub: IDiscordController = {
            sendMessageToChannel: sinon.stub(),
            determineChannel: sinon.stub()
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
