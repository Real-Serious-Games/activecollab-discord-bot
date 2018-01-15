import { Response, Request } from 'express';

const chai = require('chai');
const expect = chai.expect;

import * as eventController from '../src/controllers/event';
import * as testData from './testData';
import { Task } from '../src/models/taskEvent';

describe('processPayload with new task', () => {
    it('should return formatted payload', () => {
        const rawData = testData.rawNewTask;
        const expectedFormattedPayload: string =
                'A new task has been created.\n' +
                `Task Name: ${rawData.payload.name}\n` +
                `Project Name: ${rawData.payload.project_id}`;

        const actualValue = eventController.processEvent(rawData)
            .getOrElseValue(undefined);
        expect(actualValue).to.equal(expectedFormattedPayload);
    });
});

describe('processPayload with updated task', () => {
    it('should return formatted payload', () => {
        const rawData = testData.rawUpdatedTask;
        const expectedFormattedPayload: string =
                'A task has been updated.\n' +
                `Task Name: ${rawData.payload.name}\n` +
                `Project Name: ${rawData.payload.project_id}`;

        const actualValue = eventController.processEvent(rawData)
            .getOrElseValue(undefined);
        expect(actualValue).to.equal(expectedFormattedPayload);
    });
});

describe('processNewTask', () => {
    it('should return formatted task', () => {
        const expectedFormattedTask: string =
                'A new task has been created.\n' +
                `Task Name: ${testData.rawNewTask.payload.name}\n` +
                `Project Name: ${testData.rawNewTask.payload.project_id}`;

        expect(eventController.processNewTask(testData.rawNewTask.payload))
            .to.equal(expectedFormattedTask);
    });
});

describe('processUpdatedTask', () => {
    it('should return formatted task', () => {
        const expectedFormattedTask: string =
                'A task has been updated.\n' +
                `Task Name: ${testData.rawNewTask.payload.name}\n` +
                `Project Name: ${testData.rawNewTask.payload.project_id}`;

        expect(eventController.processUpdatedTask(testData.rawUpdatedTask.payload))
            .to.equal(expectedFormattedTask);
    });
});
