import * as request from 'supertest';
import * as sinon from 'sinon';

import * as app from '../src/app';

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
