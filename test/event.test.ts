import { Response, Request } from 'express';

var chai = require('chai');
var expect = chai.expect;

import * as eventController from '../src/controllers/event'
import * as testData from './testData';
import { Task } from '../src/models/taskEvent';

describe('processPayload with new task', () => {
    it('should return formatted payload', () => {
        let rawData = testData.rawNewTask;
        let expectedFormattedPayload : string =
                'A new task has been created.\n' +
                `Task Name: ${rawData.payload.name}\n` +
                `Project Name: ${rawData.payload.project_id}`;

        expect(eventController.processEvent(rawData)).to.equal(expectedFormattedPayload);
    });
});

describe('processPayload with updated task', () => {
    it('should return formatted payload', () => {
        let rawData = testData.rawUpdatedTask;
        let expectedFormattedPayload : string =
                'A task has been updated.\n' +
                `Task Name: ${rawData.payload.name}\n` +
                `Project Name: ${rawData.payload.project_id}`;

        expect(eventController.processEvent(rawData)).to.equal(expectedFormattedPayload);
    });
});

describe('processNewTask', () => {
    it('should return formatted task', () => {
        let expectedFormattedTask : string =
                'A new task has been created.\n' +
                `Task Name: ${testData.rawNewTask.payload.name}\n` +
                `Project Name: ${testData.rawNewTask.payload.project_id}`;

        expect(eventController.processNewTask(testData.rawNewTask)).to.equal(expectedFormattedTask);
    });
});

describe('processUpdatedTask', () => {
    it('should return formatted task', () => {
        let expectedFormattedTask : string =
                'A task has been updated.\n' +
                `Task Name: ${testData.rawNewTask.payload.name}\n` +
                `Project Name: ${testData.rawNewTask.payload.project_id}`;

        expect(eventController.processUpdatedTask(testData.rawUpdatedTask)).to.equal(expectedFormattedTask);
    });
});
