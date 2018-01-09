import * as request from 'supertest';
import * as sinon from 'sinon';

var chai = require('chai');
var expect = chai.expect;

import * as app from '../src/app';
import * as testData from './testData';
import { Task } from '../src/models/taskEvent';

describe('POST /api/webhook', () => {
    it('should return formatted body', (done) => {
        let expectedFormattedTask : string =
            'A new task has been created.\n' +
            `Task Name: ${testData.rawNewTask.payload.name}\n` +
            `Project Name: ${testData.rawNewTask.payload.project_id}`;

        return request(app).post('/api/webhook')
            .send(
                testData.rawNewTask
            )
            .end(function(err, res) {
                expect(res.text).to.equal(expectedFormattedTask);
                done();
      });
  });
});
