import { some, none } from 'fp-ts/lib/Option';
import { RichEmbed } from 'discord.js';

import * as testData from './testData';
import { Task } from '../src/models/taskEvent';
import * as event from '../src/controllers/event';
import { IActiveCollabAPI } from '../src/controllers/activecollab-api';
import { getRawUpdatedTask } from './testData';
import { IMappingController } from '../src/controllers/mapping';
import { IDiscordController, DiscordController } from '../src/controllers/discord';

const eventColor = '#449DF5';
const baseUrl = 'https://app.activecollab.com/8008';

describe('calling processEvent', () => {
    describe('with invalid event', () => {
        it('should return error when event is invalid', async () => {
            const invalidEvent = undefined;
    
            const eventController = createEventController();
    
            const returnedValue = await eventController.processEvent(invalidEvent);
    
            expect(returnedValue.isLeft()).toBe(true);
            expect(returnedValue.isRight()).toBe(false);
            expect(returnedValue.value)
                .toContain('Received invalid event: ');
        });
    
        it('should return error when event payload is invalid', async () => {
            const invalidEvent = getRawUpdatedTask();
            invalidEvent.payload = undefined;
    
            const eventController = createEventController();
    
            const returnedValue = await eventController.processEvent(invalidEvent);
    
            expect(returnedValue.isLeft()).toBe(true);
            expect(returnedValue.isRight()).toBe(false);
            expect(returnedValue.value)
                .toContain('Received invalid event: ');
        });
    
        it('should return error when event payload class is invalid', async () => {
            const invalidEvent = getRawUpdatedTask();
            invalidEvent.payload.class = undefined;
    
            const eventController = createEventController();
    
            const returnedValue = await eventController.processEvent(invalidEvent);
    
            expect(returnedValue.isLeft()).toBe(true);
            expect(returnedValue.isRight()).toBe(false);
            expect(returnedValue.value)
                .toContain('Received Event of unknown type: ');
        });
    });

    describe('with task event', () => {
        it('should return formatted task with Not Assigned when not assigned', async () => {
            expect.assertions(1);
    
            const rawData = testData.getRawTaskCompleted();
            rawData.payload.assignee_id = 0;
            
            const expectedRichEmbed = new RichEmbed()
                .addField('Assignee', `Not Assigned`, true);
    
            const eventController = createEventController();
    
            const returnedValue = (await eventController.processEvent(rawData))
                .getOrElseValue(undefined);
    
            expect(returnedValue.body.fields).toContainEqual(expectedRichEmbed.fields[0]);
        });

        it('when task is completed task should return formatted task', async () => {
            expect.assertions(2);

            const rawData = testData.getRawTaskCompleted();

            const expectedRichEmbed = new RichEmbed()
                .setTitle(`*Task Completed:* ${rawData.payload.name}`);

            const eventController = createEventController();

            const returnedValue = (await eventController.processEvent(rawData))
                .getOrElseValue(undefined);

            expect(returnedValue.body.title).toEqual(expectedRichEmbed.title);
            expect(returnedValue.projectId).toEqual(rawData.payload.project_id);
        });

        it('when task is new task should return formatted task', async () => {
            expect.assertions(2);

            const rawData = testData.getRawNewTask();
            rawData.payload.is_completed = true;

            const expectedRichEmbed = new RichEmbed()
                .setTitle(`*Task Created:* ${rawData.payload.name}`);

            const eventController = createEventController();

            const returnedValue = (await eventController.processEvent(rawData))
                .getOrElseValue(undefined);

            expect(returnedValue.body.title).toEqual(expectedRichEmbed.title);
            expect(returnedValue.projectId).toEqual(rawData.payload.project_id);
        });

        it('when task is updated task should return formatted task', async () => {
            expect.assertions(2);

            const assignee = 'Test';
            const status = 'Status';

            const rawData = testData.getRawUpdatedTask();

            const expectedRichEmbed = new RichEmbed()
                .setTitle(`*Task Updated:* ${rawData.payload.name}`)
                .setColor(eventColor)
                .setURL(baseUrl + rawData.payload.url_path)
                .addField('Assignee', `<@${assignee}>`, true)
                .addField('Status', status, true);

            const mockMappingController: Partial<IMappingController> = {
                getDiscordUser: jest.fn().mockReturnValue(assignee)
            };

            const mockDiscordController: Partial<IDiscordController> = {
                getUserId: jest.fn().mockReturnValue(assignee)
            };

            const mockActiveCollabApi: Partial<IActiveCollabAPI> = {
                getTaskListNameById: jest.fn().mockReturnValue(status)
            };

            const eventController = createEventController(
                mockActiveCollabApi,
                <IMappingController>mockMappingController,
                mockDiscordController,
                baseUrl
            );

            const returnedValue = (await eventController.processEvent(rawData))
                .getOrElseValue(undefined);

            expect(returnedValue.body).toEqual(expectedRichEmbed);
            expect(returnedValue.projectId).toEqual(rawData.payload.project_id);
        });

        it('should return error when processing task fails', async () => {
            expect.assertions(3);

            const mockMappingController: Partial<IMappingController> = {
                getDiscordUser: jest.fn(() => { throw new Error(); })
            };

            const eventController = createEventController(
                undefined,
                <IMappingController>mockMappingController,
            );

            const returnedValue = 
                await eventController.processEvent(testData.getRawUpdatedTask());

            expect(returnedValue.isLeft()).toBe(true);
            expect(returnedValue.isRight()).toBe(false);
            expect(returnedValue.value)
                .toEqual('Unable to process Task Event: Error');
        });

        it('should return error value when error getting task list name', async () => {
            expect.assertions(3);
            
            const rawData = testData.getRawUpdatedTask();
            const error = 'error';

            const mockActiveCollabApi: Partial<IActiveCollabAPI> = {
                getTaskListNameById: jest.fn(() => Promise.reject(error))
            };

            const eventController = createEventController(mockActiveCollabApi);

            const returnedValue = await eventController.processEvent(rawData);

            expect(returnedValue.isLeft()).toBe(true);
            expect(returnedValue.isRight()).toBe(false);
            expect(returnedValue.value)
                .toEqual('Unable to process Task Event: ' + error);
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

            const returnedValue = await eventController.processEvent(rawData);

            expect(returnedValue.isLeft()).toBe(true);
            expect(returnedValue.isRight()).toBe(false);
            expect(returnedValue.value)
                .toEqual('Unable to process Task Event: Error: ' + error);
        });
        
        it('should return error value when task type unknown', async () => {
            expect.assertions(3);
            
            const rawData = testData.getRawUpdatedTask();
            rawData.type = undefined;

            const eventController = createEventController();

            const returnedValue = await eventController.processEvent(rawData);

            expect(returnedValue.isLeft()).toBe(true);
            expect(returnedValue.isRight()).toBe(false);
            expect(returnedValue.value)
                .toEqual('Received Task Event with unknown payload type: undefined');
        });
    });

    describe('with comment event', () => {
        it('should return formatted comment when comment type is new comment and parent is task', async () => {
            expect.assertions(2);
    
            const assignee = 'Test';
            const projectId = 1;
            const taskName = 'Task';

            const rawData = testData.getRawNewComment();

            const expectedRichEmbed = new RichEmbed()
                .setTitle(`*Comment Added to Task:* ${taskName}`)
                .setDescription(rawData.payload.body)
                .setColor(eventColor)
                .setURL(`${baseUrl}/projects/${projectId}/` 
                    + `tasks/${rawData.payload.parent_id}`)
                .addField('Author', `<@${assignee}>`, true);

            const mockMappingController: Partial<IMappingController> = {
                getDiscordUser: jest.fn().mockReturnValue(assignee)
            };

            const mockDiscordController: Partial<IDiscordController> = {
                getUserId: jest.fn().mockReturnValue(assignee)
            };

            const mockActiveCollabApi: Partial<IActiveCollabAPI> = {
                findProjectForTask: jest.fn(() => Promise.resolve(some(projectId))),
                taskIdToName: jest.fn(() => Promise.resolve(taskName))
            };

            const eventController = createEventController(
                mockActiveCollabApi,
                <IMappingController>mockMappingController,
                mockDiscordController,
                baseUrl
            );

            const processedEvent = (await eventController.processEvent(rawData))
                .getOrElseValue(undefined);
                
            expect(processedEvent.body).toEqual(expectedRichEmbed);
            expect(processedEvent.projectId).toEqual(projectId);
        });

        it('should return error value when comment type unknown', async () => {
            expect.assertions(3);

            const rawData = testData.getRawNewComment();
            rawData.type = undefined;

            const eventController = createEventController();

            const returnedValue = await eventController.processEvent(rawData);

            expect(returnedValue.isLeft()).toBe(true);
            expect(returnedValue.isRight()).toBe(false);
            expect(returnedValue.value)
                .toEqual('Received Comment Event with unknown payload type: undefined');
        });

        it('should return error value when comment parent type unknown', async () => {
            expect.assertions(3);

            const rawData = testData.getRawNewComment();
            rawData.payload.parent_type = undefined;

            const eventController = createEventController();

            const returnedValue = await eventController.processEvent(rawData);

            expect(returnedValue.isLeft()).toBe(true);
            expect(returnedValue.isRight()).toBe(false);
            expect(returnedValue.value)
                .toEqual('Received Comment Event with unknown parent type: undefined');
        });

        it('should return error value when finding project returns error', async () => {
            expect.assertions(3);

            const mockActiveCollabApi: Partial<IActiveCollabAPI> = {
                findProjectForTask: jest.fn(() => Promise.reject(new Error('Dummy Error')))
            };

            const eventController = 
                createEventController(<IActiveCollabAPI>mockActiveCollabApi);

            const returnedValue = await eventController.processEvent(testData.getRawNewComment());

            expect(returnedValue.isLeft()).toBe(true);
            expect(returnedValue.isRight()).toBe(false);
            expect(returnedValue.value)
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

            const returnedValue = await eventController.processEvent(rawData);

            expect(returnedValue.isLeft()).toBe(true);
            expect(returnedValue.isRight()).toBe(false);
            expect(returnedValue.value)
                .toEqual(`Project ID not found for Comment with parent: ${rawData.payload.parent_id}`);
        });

        it('should return error value when getting task name returns error', async () => {
            expect.assertions(3);

            const rawData = testData.getRawNewComment();
            const errorValue = 'error';

            const mockActiveCollabApi: Partial<IActiveCollabAPI> = {
                findProjectForTask: jest.fn(() => Promise.resolve(some(1))),
                taskIdToName: jest.fn(() => Promise.reject('error'))
            };

            const eventController = 
                createEventController(
                    <IActiveCollabAPI>mockActiveCollabApi
                );

            const returnedValue = await eventController.processEvent(rawData);

            expect(returnedValue.isLeft()).toBe(true);
            expect(returnedValue.isRight()).toBe(false);
            expect(returnedValue.value)
                .toEqual(`Unable to process Comment Event: ${errorValue}`);
        });

        it('should return error whengetting user ID fails', async () => {
            expect.assertions(3);
   
            const mockMappingController: Partial<IMappingController> = {
                getDiscordUser: jest.fn(() => { throw new Error(); })
            };
            
            const eventController = createEventController(
                undefined,
                <IMappingController>mockMappingController
            );

            const returnedValue = 
                await eventController.processEvent(testData.getRawNewComment());

            expect(returnedValue.isLeft()).toBe(true);
            expect(returnedValue.isRight()).toBe(false);
            expect(returnedValue.value)
                .toEqual('Unable to process Comment Event: Error');
        });
    });
});

function createEventController(
    activeCollabApi: Partial<IActiveCollabAPI> = { 
        findProjectForTask: jest.fn(() => Promise.resolve(some(1))) ,
        getTaskListNameById: jest.fn().mockReturnValue('status')
    },
    mappingController: Partial<IMappingController> = { 
        getDiscordUser: jest.fn().mockReturnValue('author') 
    },
    discordController: Partial<IDiscordController> = { 
        getUserId: jest.fn().mockReturnValue('author') 
    },
    baseUrl: string = 'https://app.activecollab.com/157544/'
) {
    return event.createEventController(
        <IActiveCollabAPI>activeCollabApi,
        <IMappingController>mappingController,
        <IDiscordController>discordController,
        baseUrl
    );
}