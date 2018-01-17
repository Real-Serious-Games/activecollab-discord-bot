import { Response, Request } from 'express';

import * as testData from './testData';
import { Task } from '../src/models/taskEvent';
import { createEventController } from '../src/controllers/event';
import { IActiveCollabAPI } from '../src/controllers/activecollab-api';
import { getRawUpdatedTask } from './testData';

describe('calling processEvent', () => {
    describe('with invalid event', () => {
        it('should return error when event is invalid', async () => {
            const invalidEvent = undefined;
    
            const mockActiveCollabApi: Partial<IActiveCollabAPI> = { };
            const eventController =
                createEventController(<IActiveCollabAPI>mockActiveCollabApi);
    
            const actualValue = await eventController.processEvent(invalidEvent);
    
            expect(actualValue.isLeft()).toBeTruthy();
            expect(actualValue.isRight()).toBeFalsy();
            expect(actualValue.value)
                .toContain('Received invalid event: ');
        });
    
        it('should return error when event payload is invalid', async () => {
            const invalidEvent = getRawUpdatedTask();
            invalidEvent.payload = undefined;
    
            const mockActiveCollabApi: Partial<IActiveCollabAPI> = { };
            const eventController =
                createEventController(<IActiveCollabAPI>mockActiveCollabApi);
    
            const actualValue = await eventController.processEvent(invalidEvent);
    
            expect(actualValue.isLeft()).toBeTruthy();
            expect(actualValue.isRight()).toBeFalsy();
            expect(actualValue.value)
                .toContain('Received invalid event: ');
        });
    
        it('should return error when event payload class is invalid', async () => {
            const invalidEvent = getRawUpdatedTask();
            invalidEvent.payload.class = undefined;
    
            const mockActiveCollabApi: Partial<IActiveCollabAPI> = { };
            const eventController =
                createEventController(<IActiveCollabAPI>mockActiveCollabApi);
    
            const actualValue = await eventController.processEvent(invalidEvent);
    
            expect(actualValue.isLeft()).toBeTruthy();
            expect(actualValue.isRight()).toBeFalsy();
            expect(actualValue.value)
                .toContain('Received Event of unknown type: ');
        });
    });

    describe('with task event', () => {
        it('should return formatted task when task type is new task', async () => {
            expect.assertions(2);

            const rawData = testData.getRawNewTask();
            const expectedFormattedTask =
                    'A new task has been created.\n' +
                    `Task Name: ${rawData.payload.name}\n` +
                    `Project Name: ${rawData.payload.project_id}`;

            const mockActiveCollabApi: Partial<IActiveCollabAPI> = { };
            const eventController =
                createEventController(<IActiveCollabAPI>mockActiveCollabApi);

            const actualValue = (await eventController.processEvent(rawData))
                .getOrElseValue(undefined);

            expect(actualValue.body).toEqual(expectedFormattedTask);
            expect(actualValue.projectId).toEqual(rawData.payload.project_id);
        });

        it('should return formatted task when task type is updated task', async () => {
            expect.assertions(2);
            
            const rawData = testData.getRawUpdatedTask();
            const expectedFormattedTask: string =
                    'A task has been updated.\n' +
                    `Task Name: ${rawData.payload.name}\n` +
                    `Project Name: ${rawData.payload.project_id}`;

            const mockActiveCollabApi: Partial<IActiveCollabAPI> = { };
            const eventController = 
                createEventController(<IActiveCollabAPI>mockActiveCollabApi);

            const actualValue = (await eventController.processEvent(rawData))
                .getOrElseValue(undefined);

            expect(actualValue.body).toEqual(expectedFormattedTask);
            expect(actualValue.projectId).toEqual(rawData.payload.project_id);
        });

        it('should return error value when task type unknown', async () => {
            expect.assertions(3);
            
            const rawData = testData.getRawUpdatedTask();
            rawData.type = undefined;

            const mockActiveCollabApi: Partial<IActiveCollabAPI> = { };
            const eventController = 
                createEventController(<IActiveCollabAPI>mockActiveCollabApi);

            const actualValue = await eventController.processEvent(rawData);

            expect(actualValue.isLeft()).toBeTruthy();
            expect(actualValue.isRight()).toBeFalsy();
            expect(actualValue.value)
                .toEqual('Received Task Event with unknown payload type: undefined');
        });
    });

    describe('with comment event', () => {
        it('should return formatted comment when comment type is new comment', async () => {
            expect.assertions(3);

            const rawData = testData.getRawNewComment();
            const projectId = 1;

            const expectedFormattedEvent: string =
                    '*A new comment has been added.*\n' +
                    `**Comment:** \`${rawData.payload.body}\`\n` +
                    `**${rawData.payload.parent_type}:** ${rawData.payload.parent_id}\n` +
                    `**Author:** ${rawData.payload.created_by_id}\n`;

            const mockActiveCollabApi: Partial<IActiveCollabAPI> = {
                getProjectIdForComment: jest.fn(() => Promise.resolve(projectId))
            };

            const eventController = 
                createEventController(<IActiveCollabAPI>mockActiveCollabApi);

            const actualValue = (await eventController.processEvent(rawData))
                .getOrElseValue(undefined);
                
            expect(mockActiveCollabApi.getProjectIdForComment).toBeCalledWith(rawData.payload);
            expect(actualValue.body).toEqual(expectedFormattedEvent);
            expect(actualValue.projectId).toEqual(projectId);
        });

        it('should return error value when comment type unknown', async () => {
            expect.assertions(3);

            const rawData = testData.getRawNewComment();
            rawData.type = undefined;

            const mockActiveCollabApi: Partial<IActiveCollabAPI> = { };
            const eventController = 
                createEventController(<IActiveCollabAPI>mockActiveCollabApi);

            const actualValue = await eventController.processEvent(rawData);

            expect(actualValue.isLeft()).toBeTruthy();
            expect(actualValue.isRight()).toBeFalsy();
            expect(actualValue.value)
                .toEqual('Received Comment Event with unknown payload type: undefined');
        });

        it('should return error value unable to get project ID', async () => {
            expect.assertions(3);
            const rawData = testData.getRawNewComment();

            const mockActiveCollabApi: Partial<IActiveCollabAPI> = {
                getProjectIdForComment: jest.fn(() => Promise.reject(new Error('Dummy Error')))
            };

            const eventController = 
                createEventController(<IActiveCollabAPI>mockActiveCollabApi);

            const actualValue = await eventController.processEvent(rawData);

            expect(actualValue.isLeft()).toBeTruthy();
            expect(actualValue.isRight()).toBeFalsy();
            expect(actualValue.value)
                .toEqual('Error processing comment: Error: Dummy Error');
        });
    });

    describe('with project', () => {
        it('should return formatted project event when project type is new project', async () => {
            expect.assertions(2);
            
            const rawData = testData.getRawNewProjectEvent();
            const expectedFormattedEvent: string =
                    '*A new project has been created.*\n' +
                    `**Project:** \`${rawData.payload.name}\`\n` +
                    `**Company:** ${rawData.payload.company_id}\n` +
                    `**Author:** ${rawData.payload.created_by_id}\n`;

            const mockActiveCollabApi: Partial<IActiveCollabAPI> = { };
            const eventController = 
                createEventController(<IActiveCollabAPI>mockActiveCollabApi);

            const actualValue = (await eventController.processEvent(rawData))
                .getOrElseValue(undefined);

            expect(actualValue.body).toEqual(expectedFormattedEvent);
            expect(actualValue.projectId).toEqual(rawData.payload.id);
        });

        it('should return error value when project type is unknown', async () => {
            expect.assertions(3);

            const rawData = testData.getRawNewProjectEvent();
            rawData.type = undefined;

            const mockActiveCollabApi: Partial<IActiveCollabAPI> = { };
            const eventController = 
                createEventController(<IActiveCollabAPI>mockActiveCollabApi);

            const actualValue = await eventController.processEvent(rawData);

            expect(actualValue.isLeft()).toBeTruthy();
            expect(actualValue.isRight()).toBeFalsy();
            expect(actualValue.value)
                .toEqual('Received Project Event with unknown payload type: undefined');
        });
    });
});