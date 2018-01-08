import * as sinon from 'sinon';
import { Response, Request } from 'express';

var chai = require('chai');
var expect = chai.expect;

import * as app from '../src/app';
import * as api from '../src/controllers/api'
import * as testData from './testData';
import { Task } from '../src/models/taskPayload';

describe('postActiveCollabWebhook', () => {
    it('should return formatted body', () => {
        let body = testData.rawNewTask;
        let req : Partial<Request> = {
            body: body
        };
        let res: Partial<Response> = {
            send: sinon.stub()
        };

        let expectedFormattedPayload : string =
                'A new task has been created. \n' +
                'Task Name: ' + testData.rawNewTask.payload.name +
                '\n Project Name: ' + testData.rawNewTask.payload.project_id;

        api.postActiveCollabWebhook(<Request>req, <Response>res);
        sinon.assert.calledWith(res.send as sinon.SinonStub, expectedFormattedPayload)
    });
});

describe('processPayload with new task', () => {
    it('should return formatted payload', () => {
        let rawData : Task = testData.rawNewTask;

        let expectedFormattedPayload : string =
                'A new task has been created. \n' +
                'Task Name: ' + rawData.payload.name +
                '\n Project Name: ' + rawData.payload.project_id;

        expect(api.processEvent(rawData)).to.equal(expectedFormattedPayload);
    });
});

describe('processPayload with updated task', () => {
    it('should return formatted payload', () => {
        let rawData : Task = testData.rawUpdatedTask;
        let expectedFormattedPayload : string =
                'A task has been updated. \n' +
                'Task Name: ' + rawData.payload.name +
                '\n Project Name: ' + rawData.payload.project_id;

        expect(api.processEvent(rawData)).to.equal(expectedFormattedPayload);
    });
});

describe('processNewTask', () => {
    it('should return formatted task', () => {
        let expectedFormattedTask : string =
                'A new task has been created. \n' +
                'Task Name: ' + testData.rawNewTask.payload.name +
                '\n Project Name: ' + testData.rawNewTask.payload.project_id;

        expect(api.processNewTask(testData.rawNewTask)).to.equal(expectedFormattedTask);
    });
});

describe('processUpdatedTask', () => {
    it('should return formatted task', () => {
        let expectedFormattedTask : string =
                'A task has been updated. \n' +
                'Task Name: ' + testData.rawNewTask.payload.name +
                '\n Project Name: ' + testData.rawNewTask.payload.project_id;

        expect(api.processUpdatedTask(testData.rawUpdatedTask)).to.equal(expectedFormattedTask);
    });
});
