import * as request from 'supertest';
import * as sinon from 'sinon';

const chai = require('chai');
const expect = chai.expect;

import * as app from '../src/app';
import * as testData from './testData';
import { Task } from '../src/models/taskEvent';

describe('POST /api/webhook', () => {
    it('should return status 200', (done) => {
        return request(app).post('/api/webhook')
            .send(testData.rawNewTask)
            .end(function(err, res) {
                expect(res.status).to.equal(200);
                done();
      });
  });
});
