import { Response, Request } from 'express';

const chai = require('chai');
const expect = chai.expect;

import * as eventController from '../src/controllers/event';
import * as testData from './testData';
import { Task } from '../src/models/taskEvent';

describe('processPayload with new task', () => {
    it('should return formatted payload', () => {
        const rawData = testData.getRawNewtask();
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
        const rawData = testData.getRawUpdatedTask();
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
                `Task Name: ${testData.getRawNewtask().payload.name}\n` +
                `Project Name: ${testData.getRawNewtask().payload.project_id}`;

        expect(eventController.processNewTask(testData.getRawNewtask())).to.equal(expectedFormattedTask);
    });
});

describe('processUpdatedTask', () => {
    it('should return formatted task', () => {
        const rawData = testData.getRawUpdatedTask();
        
        const expectedFormattedTask: string =
                'A task has been updated.\n' +
                `Task Name: ${rawData.payload.name}\n` +
                `Project Name: ${rawData.payload.project_id}`;

        expect(eventController.processUpdatedTask(rawData)).to.equal(expectedFormattedTask);
    });
});
