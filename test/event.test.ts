import { Response, Request } from 'express';

const chai = require('chai');
const expect = chai.expect;

import * as eventController from '../src/controllers/event';
import * as testData from './testData';
import { Task } from '../src/models/taskEvent';

describe('calling processEvent', () => {
    describe('with task event', () => {
        it('should return formatted task when task type is new task', () => {
            const rawData = testData.getRawNewTask();
            const expectedFormattedPayload: string =
                    'A new task has been created.\n' +
                    `Task Name: ${rawData.payload.name}\n` +
                    `Project Name: ${rawData.payload.project_id}`;

            const actualValue = eventController.processEvent(rawData)
                .getOrElseValue(undefined);
            expect(actualValue).to.equal(expectedFormattedPayload);
        });

        it('should return formatted task when task type is updated task', () => {
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

    describe('with comment event', () => {
        it('should return formatted comment when comment type is new comment', () => {
            const rawData = testData.getRawNewComment();
            const expectedFormattedPayload: string =
                    '*A new comment has been added.*\n' +
                    `**Comment:** \`${rawData.payload.body}\`\n` +
                    `**${rawData.payload.parent_type}:** ${rawData.payload.parent_id}\n` +
                    `**Author:** ${rawData.payload.created_by_id}\n`;

            const actualValue = eventController.processEvent(rawData)
                .getOrElseValue(undefined);
            expect(actualValue).to.equal(expectedFormattedPayload);
        });

        it('should return error value when comment type unknown', () => {
            const rawData = testData.getRawNewComment();
            rawData.type = undefined;

            const actualValue = eventController.processEvent(rawData);

            expect(actualValue.isLeft())
                .is
                .true;

            expect(actualValue.isRight())
                .is
                .false;

            expect(actualValue.value)
                .to
                .equal('Received Comment Event with unknown payload type: undefined');
        });
    });

    describe('with project', () => {
        it('should return formatted project event when project type is new project', () => {
            const rawData = testData.getRawNewProjectEvent();
            const expectedFormattedEvent: string =
                    '*A new project has been created.*\n' +
                    `**Project:** \`${rawData.payload.name}\`\n` +
                    `**Company:** ${rawData.payload.company_id}\n` +
                    `**Author:** ${rawData.payload.created_by_id}\n`;

            const actualValue = eventController.processEvent(rawData)
                .getOrElseValue(undefined);
            expect(actualValue).to.equal(expectedFormattedEvent);
        });
        it('should return error value when project type is unknown', () => {
            const rawData = testData.getRawNewProjectEvent();
            rawData.type = undefined;

            const actualValue = eventController.processEvent(rawData);

            expect(actualValue.isLeft())
                .is
                .true;

            expect(actualValue.isRight())
                .is
                .false;

            expect(actualValue.value)
                .to
                .equal('Received Project Event with unknown payload type: undefined');
        });
    });
});
