import { Response, Request } from 'express';

const chai = require('chai');
const expect = chai.expect;

import * as eventController from '../src/controllers/event';
import * as testData from './testData';
import { Task } from '../src/models/taskEvent';

describe('processEvent', () => {
    describe('with task', () => {
        describe('with new task', () => {
            it('should return formatted task', () => {
                const rawData = testData.getRawNewTask();
                const expectedFormattedPayload: string =
                        'A new task has been created.\n' +
                        `Task Name: ${rawData.payload.name}\n` +
                        `Project Name: ${rawData.payload.project_id}`;
        
                const actualValue = eventController.processEvent(rawData)
                    .getOrElseValue(undefined);
                expect(actualValue).to.equal(expectedFormattedPayload);
            });
        });
        
        describe('with updated task', () => {
            it('should return formatted task', () => {
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
    });
    
    describe('with comment', () => {
        describe('with new comment', () => {
            it('should return formatted comment', () => {
                const rawData = testData.rawNewComment;
                const expectedFormattedPayload: string =
                        '*A new comment has been added.*\n' +
                        `**Comment:** \`${rawData.payload.body}\`\n` +
                        `**${rawData.payload.parent_type}:** ${rawData.payload.parent_id}\n` +
                        `**Author:** ${rawData.payload.created_by_id}\n`;
        
                const actualValue = eventController.processEvent(rawData)
                    .getOrElseValue(undefined);
                expect(actualValue).to.equal(expectedFormattedPayload);
            });
        });
    
        describe('with unknown comment type', () => {
            it('should return error value', () => {
                const rawData = testData.rawNewComment;
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
    });

    describe('with project', () => {
        describe('with new project', () => {
            it('should return formatted project event', () => {
                const rawData = testData.rawNewProject;
                const expectedFormattedEvent: string =
                        '*A new project has been created.*\n' +
                        `**Project:** \`${rawData.payload.name}\`\n` +
                        `**Company:** ${rawData.payload.company_id}\n` +
                        `**Author:** ${rawData.payload.created_by_id}\n`;
        
                const actualValue = eventController.processEvent(rawData)
                    .getOrElseValue(undefined);
                expect(actualValue).to.equal(expectedFormattedEvent);
            });
        });
    
        describe('with unknown project type', () => {
            it('should return error value', () => {
                const rawData = testData.rawNewProject;
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
});
