import * as request from 'supertest';
import * as sinon from 'sinon';
import { Response, Request } from 'express';

import * as app from '../src/app';
import * as api from '../src/controllers/api'

var chai = require('chai');
var expect = chai.expect;

describe('POST /api/webhook', () => {
  it('should return 200 OK', () => {
    return request(app).post('/api/webhook')
      .expect(200);
  });
});

describe('POST /api/webhook', () => {
  it('should return body', (done) => {
    return request(app).post('/api/webhook')
      .send(
        {
          'test': 'test'
        }
      )
      .end(function(err, res) {
        expect(res.body.test).to.equal('test');
        done();
      });
  });
});

describe('postActiveCollabWebhook', () => {
    it('should return body', () => {
        let body = { test: 'test' };
        let req : Partial<Request> = {
            body: body
        };
        let res: Partial<Response> = {
            send: sinon.stub()
        };

        api.postActiveCollabWebhook(<Request>req, <Response>res);
        sinon.assert.calledWith(res.send as sinon.SinonStub, { test: 'test' })
    });
});
