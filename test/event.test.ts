import { Response, Request } from 'express';
import { some, none } from 'fp-ts/lib/Option';

import * as testData from './testData';
import { Task } from '../src/models/taskEvent';
import * as event from '../src/controllers/event';
import { IActiveCollabAPI } from '../src/controllers/activecollab-api';
import { getRawUpdatedTask } from './testData';
import { IMappingController } from '../src/controllers/mapping';
import { IDiscordController } from '../src/controllers/discord';

describe('calling processEvent', () => {
    describe('with invalid event', () => {
        it('should return error when event is invalid', async () => {
            const invalidEvent = undefined;
    
            const eventController = createEventController();
    
            const actualValue = await eventController.processEvent(invalidEvent);
    
            expect(actualValue.isLeft()).toBe(true);
            expect(actualValue.isRight()).toBe(false);
            expect(actualValue.value)
                .toContain('Received invalid event: ');
        });
    
        it('should return error when event payload is invalid', async () => {
            const invalidEvent = getRawUpdatedTask();
            invalidEvent.payload = undefined;
    
            const eventController = createEventController();
    
            const actualValue = await eventController.processEvent(invalidEvent);
    
            expect(actualValue.isLeft()).toBe(true);
            expect(actualValue.isRight()).toBe(false);
            expect(actualValue.value)
                .toContain('Received invalid event: ');
        });
    
        it('should return error when event payload class is invalid', async () => {
            const invalidEvent = getRawUpdatedTask();
            invalidEvent.payload.class = undefined;
    
            const eventController = createEventController();
    
            const actualValue = await eventController.processEvent(invalidEvent);
    
            expect(actualValue.isLeft()).toBe(true);
            expect(actualValue.isRight()).toBe(false);
            expect(actualValue.value)
                .toContain('Received Event of unknown type: ');
        });
    });

    describe('with task event', () => {
        it('should return formatted task when task type is new task', async () => {
            expect.assertions(2);

            const assignee = 'Test';
            const isCompleted = true;

            const rawData = testData.getRawNewTask();
            rawData.payload.is_completed = isCompleted;

            const expectedFormattedTask =
                `Task Created: **${rawData.payload.name}**\n` +
                `Assignee: <@${assignee}>\n` +
                `Completed: ${rawData.payload.is_completed}`;

            const mockMappingController: Partial<IMappingController> = {
                getDiscordUser: jest.fn().mockReturnValue(assignee)
            };

            const mockDiscordController: Partial<IDiscordController> = {
                getUserId: jest.fn().mockReturnValue(assignee)
            };

            const eventController = createEventController(
                undefined,
                <IMappingController>mockMappingController,
                mockDiscordController
            );

            const actualValue = (await eventController.processEvent(rawData))
                .getOrElseValue(undefined);

            expect(actualValue.body).toEqual(expectedFormattedTask);
            expect(actualValue.projectId).toEqual(rawData.payload.project_id);
        });

        it('should return formatted task when task type is new task without completed when completed is false', async () => {
            expect.assertions(2);

            const assigned = 'Test';
            const completed = false;

            const rawData = testData.getRawNewTask();
            rawData.payload.is_completed = completed;

            const expectedFormattedTask =
                `Task Created: **${rawData.payload.name}**\n` +
                `Assignee: <@${assigned}>\n`;

            const mockMappingController: Partial<IMappingController> = {
                getDiscordUser: jest.fn().mockReturnValue(assigned)
            };

            const mockDiscordController: Partial<IDiscordController> = {
                getUserId: jest.fn().mockReturnValue(assigned)
            };
            
            const eventController = createEventController(
                undefined,
                <IMappingController>mockMappingController,
                mockDiscordController
            );

            const actualValue = (await eventController.processEvent(rawData))
                .getOrElseValue(undefined);

            expect(actualValue.body).toEqual(expectedFormattedTask);
            expect(actualValue.projectId).toEqual(rawData.payload.project_id);
        });

        it('should return formatted task when task type is new task without assigned when not assigned', async () => {
            expect.assertions(2);

            const rawData = testData.getRawNewTask();
            rawData.payload.assignee_id = undefined;
            
            const expectedFormattedTask =
                `Task Created: **${rawData.payload.name}**\n`;

            const eventController = createEventController();

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

            const eventController = createEventController();

            const actualValue = (await eventController.processEvent(rawData))
                .getOrElseValue(undefined);

            expect(actualValue.body).toEqual(expectedFormattedTask);
            expect(actualValue.projectId).toEqual(rawData.payload.project_id);
        });

        it('should return error value when task type unknown', async () => {
            expect.assertions(3);
            
            const rawData = testData.getRawUpdatedTask();
            rawData.type = undefined;

            const eventController = createEventController();

            const actualValue = await eventController.processEvent(rawData);

            expect(actualValue.isLeft()).toBe(true);
            expect(actualValue.isRight()).toBe(false);
            expect(actualValue.value)
                .toEqual('Received Task Event with unknown payload type: undefined');
        });

        it('should return error value when error getting assigned', async () => {
            expect.assertions(3);
            
            const rawData = testData.getRawNewTask();
            const error = 'error';

            const mockMappingController: Partial<IMappingController> = {
                getDiscordUser: jest.fn(() => { throw Error(error); })
            };
            const eventController = createEventController(
                undefined,
                <IMappingController>mockMappingController
            );

            const actualValue = await eventController.processEvent(rawData);

            expect(actualValue.isLeft()).toBe(true);
            expect(actualValue.isRight()).toBe(false);
            expect(actualValue.value)
                .toEqual('Unable to process Task Event: Error: ' + error);
        });
    });

    describe('with comment event', () => {
        it('should return formatted comment when comment type is new comment', async () => {
            expect.assertions(2);

            const rawData = testData.getRawNewComment();
            const projectId = 1;

            const expectedFormattedEvent: string =
                    '*A new comment has been added.*\n' +
                    `**Comment:** \`${rawData.payload.body}\`\n` +
                    `**${rawData.payload.parent_type}:** ${rawData.payload.parent_id}\n` +
                    `**Author:** ${rawData.payload.created_by_id}\n`;

            const mockActiveCollabApi: Partial<IActiveCollabAPI> = {
                findProjectForTask: jest.fn(() => Promise.resolve(some(projectId)))
            };

            const eventController = 
                createEventController(<IActiveCollabAPI>mockActiveCollabApi);

            const processedEvent = (await eventController.processEvent(rawData))
                .getOrElseValue(undefined);
                
            expect(processedEvent.body).toEqual(expectedFormattedEvent);
            expect(processedEvent.projectId).toEqual(projectId);
        });

        it('should return error value when comment type unknown', async () => {
            expect.assertions(3);

            const rawData = testData.getRawNewComment();
            rawData.type = undefined;

            const eventController = createEventController();

            const actualValue = await eventController.processEvent(rawData);

            expect(actualValue.isLeft()).toBe(true);
            expect(actualValue.isRight()).toBe(false);
            expect(actualValue.value)
                .toEqual('Received Comment Event with unknown payload type: undefined');
        });

        it('should return error value when comment parent type unknown', async () => {
            expect.assertions(3);

            const rawData = testData.getRawNewComment();
            rawData.payload.parent_type = undefined;

            const eventController = createEventController();

            const actualValue = await eventController.processEvent(rawData);

            expect(actualValue.isLeft()).toBe(true);
            expect(actualValue.isRight()).toBe(false);
            expect(actualValue.value)
                .toEqual('Received Comment Event with unknown parent type: undefined');
        });

        it('should return error value when finding project returns error', async () => {
            expect.assertions(3);
            const rawData = testData.getRawNewComment();

            const mockActiveCollabApi: Partial<IActiveCollabAPI> = {
                findProjectForTask: jest.fn(() => Promise.reject(new Error('Dummy Error')))
            };

            const eventController = 
                createEventController(<IActiveCollabAPI>mockActiveCollabApi);

            const actualValue = await eventController.processEvent(rawData);

            expect(actualValue.isLeft()).toBe(true);
            expect(actualValue.isRight()).toBe(false);
            expect(actualValue.value)
                .toEqual('Error processing Comment: Error: Dummy Error');
        });

        it('should return error value when finding project returns no ID', async () => {
            expect.assertions(3);
            const rawData = testData.getRawNewComment();

            const mockActiveCollabApi: Partial<IActiveCollabAPI> = {
                findProjectForTask: jest.fn(() => Promise.resolve(none))
            };

            const eventController = 
                createEventController(<IActiveCollabAPI>mockActiveCollabApi);

            const actualValue = await eventController.processEvent(rawData);

            expect(actualValue.isLeft()).toBe(true);
            expect(actualValue.isRight()).toBe(false);
            expect(actualValue.value)
                .toEqual(`Project ID not found for Comment with parent: ${rawData.payload.parent_id}`);
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

            const eventController = createEventController();

            const actualValue = (await eventController.processEvent(rawData))
                .getOrElseValue(undefined);

            expect(actualValue.body).toEqual(expectedFormattedEvent);
            expect(actualValue.projectId).toEqual(rawData.payload.id);
        });

        it('should return error value when project type is unknown', async () => {
            expect.assertions(3);

            const rawData = testData.getRawNewProjectEvent();
            rawData.type = undefined;

            const eventController = createEventController();

            const actualValue = await eventController.processEvent(rawData);

            expect(actualValue.isLeft()).toBe(true);
            expect(actualValue.isRight()).toBe(false);
            expect(actualValue.value)
                .toEqual('Received Project Event with unknown payload type: undefined');
        });
    });
});

function createEventController(
    activeCollabApi: Partial<IActiveCollabAPI> = { },
    mappingController: Partial<IMappingController> = { },
    discordController: Partial<IDiscordController> = { }
) {
    return event.createEventController(
        <IActiveCollabAPI>activeCollabApi,
        <IMappingController>mappingController,
        <IDiscordController>discordController
    );
}