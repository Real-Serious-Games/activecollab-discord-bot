import { Response, Request } from 'express';
import { some, none } from 'fp-ts/lib/Option';
import { RichEmbed, BaseOpus } from 'discord.js';

import * as testData from './testData';
import { Task } from '../src/models/taskEvent';
import * as event from '../src/controllers/event';
import { IActiveCollabAPI } from '../src/controllers/activecollab-api';
import { getRawUpdatedTask } from './testData';
import { IMappingController } from '../src/controllers/mapping';
import { IDiscordController, DiscordController } from '../src/controllers/discord';
import { basename } from 'path';

const eventColor = '#449DF5';

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
        describe('when task event is new task', () => {
            it('should return formatted task when task is valid', async () => {
                expect.assertions(2);
    
                const baseUrl = 'https://app.activecollab.com/157544/';
    
                const assignee = 'Test';
                const isCompleted = true;
    
                const rawData = testData.getRawNewTask();
                rawData.payload.is_completed = isCompleted;
    
                const expectedRichEmbed = new RichEmbed()
                    .setTitle(`*Task Created:* ${rawData.payload.name}`)
                    .setColor(eventColor)
                    .setURL(baseUrl + rawData.payload.url_path)
                    .addField('Assignee', `<@${assignee}>`, true)
                    .addField('Status', `Completed`, true);
    
                const mockMappingController: Partial<IMappingController> = {
                    getDiscordUser: jest.fn().mockReturnValue(assignee)
                };
    
                const mockDiscordController: Partial<IDiscordController> = {
                    getUserId: jest.fn().mockReturnValue(assignee)
                };
    
                const eventController = createEventController(
                    undefined,
                    <IMappingController>mockMappingController,
                    mockDiscordController,
                    baseUrl
                );
    
                const actualValue = (await eventController.processEvent(rawData))
                    .getOrElseValue(undefined);
    
                expect(actualValue.body).toEqual(expectedRichEmbed);
                expect(actualValue.projectId).toEqual(rawData.payload.project_id);
            });
    
            it('should return formatted task with Status of In Progress when completed false', async () => {
                expect.assertions(2);
    
                const assignee = 'Test';
                const completed = false;
                const baseUrl = 'https://app.activecollab.com/157544/';
    
                const rawData = testData.getRawNewTask();
                rawData.payload.is_completed = completed;
    
                const expectedRichEmbed = new RichEmbed()
                    .setTitle(`*Task Created:* ${rawData.payload.name}`)
                    .setColor(eventColor)
                    .setURL(baseUrl + rawData.payload.url_path)
                    .addField('Assignee', `<@${assignee}>`, true)
                    .addField('Status', `In Progress`, true);
    
                const mockMappingController: Partial<IMappingController> = {
                    getDiscordUser: jest.fn().mockReturnValue(assignee)
                };
    
                const mockDiscordController: Partial<IDiscordController> = {
                    getUserId: jest.fn().mockReturnValue(assignee)
                };
                
                const eventController = createEventController(
                    undefined,
                    <IMappingController>mockMappingController,
                    mockDiscordController,
                    baseUrl
                );
                const actualValue = (await eventController.processEvent(rawData))
                    .getOrElseValue(undefined);
    
                expect(actualValue.body).toEqual(expectedRichEmbed);
                expect(actualValue.projectId).toEqual(rawData.payload.project_id);
            });
    
            it('should return formatted task with Not Assigned when not assigned', async () => {
                expect.assertions(2);
    
                const assignee = 'Test';
                const baseUrl = 'https://app.activecollab.com/157544/';
    
                const rawData = testData.getRawNewTask();
                rawData.payload.assignee_id = undefined;
                
                const expectedRichEmbed = new RichEmbed()
                    .setTitle(`*Task Created:* ${rawData.payload.name}`)
                    .setColor(eventColor)
                    .setURL(baseUrl + rawData.payload.url_path)
                    .addField('Assignee', `Not Assigned`, true)
                    .addField('Status', `In Progress`, true);
    
                const eventController = createEventController(
                    undefined,
                    undefined,
                    undefined,
                    baseUrl
                );
    
                const actualValue = (await eventController.processEvent(rawData))
                    .getOrElseValue(undefined);
    
                expect(actualValue.body).toEqual(expectedRichEmbed);
                expect(actualValue.projectId).toEqual(rawData.payload.project_id);
            });
        });

        describe('when task event is updated task', () => {
            it('should return formatted task when task is valid', async () => {
                expect.assertions(2);
    
                const baseUrl = 'https://app.activecollab.com/157544/';
    
                const assignee = 'Test';
                const isCompleted = true;
    
                const rawData = testData.getRawUpdatedTask();
                rawData.payload.is_completed = isCompleted;
    
                const expectedRichEmbed = new RichEmbed()
                    .setTitle(`*Task Updated:* ${rawData.payload.name}`)
                    .setColor(eventColor)
                    .setURL(baseUrl + rawData.payload.url_path)
                    .addField('Assignee', `<@${assignee}>`, true)
                    .addField('Status', `Completed`, true);
    
                const mockMappingController: Partial<IMappingController> = {
                    getDiscordUser: jest.fn().mockReturnValue(assignee)
                };
    
                const mockDiscordController: Partial<IDiscordController> = {
                    getUserId: jest.fn().mockReturnValue(assignee)
                };
    
                const eventController = createEventController(
                    undefined,
                    <IMappingController>mockMappingController,
                    mockDiscordController,
                    baseUrl
                );
    
                const actualValue = (await eventController.processEvent(rawData))
                    .getOrElseValue(undefined);
    
                expect(actualValue.body).toEqual(expectedRichEmbed);
                expect(actualValue.projectId).toEqual(rawData.payload.project_id);
            });
    
            it('should return formatted task with Status of In Progress when completed false', async () => {
                expect.assertions(2);
    
                const assignee = 'Test';
                const completed = false;
                const baseUrl = 'https://app.activecollab.com/157544/';
    
                const rawData = testData.getRawUpdatedTask();
                rawData.payload.is_completed = completed;
    
                const expectedRichEmbed = new RichEmbed()
                    .setTitle(`*Task Updated:* ${rawData.payload.name}`)
                    .setColor(eventColor)
                    .setURL(baseUrl + rawData.payload.url_path)
                    .addField('Assignee', `<@${assignee}>`, true)
                    .addField('Status', `In Progress`, true);
    
                const mockMappingController: Partial<IMappingController> = {
                    getDiscordUser: jest.fn().mockReturnValue(assignee)
                };
    
                const mockDiscordController: Partial<IDiscordController> = {
                    getUserId: jest.fn().mockReturnValue(assignee)
                };
                
                const eventController = createEventController(
                    undefined,
                    <IMappingController>mockMappingController,
                    mockDiscordController,
                    baseUrl
                );
                const actualValue = (await eventController.processEvent(rawData))
                    .getOrElseValue(undefined);
    
                expect(actualValue.body).toEqual(expectedRichEmbed);
                expect(actualValue.projectId).toEqual(rawData.payload.project_id);
            });
    
            it('should return formatted task with Not Assigned when not assigned', async () => {
                expect.assertions(2);
    
                const assignee = 'Test';
                const baseUrl = 'https://app.activecollab.com/157544/';
    
                const rawData = testData.getRawUpdatedTask();
                rawData.payload.assignee_id = undefined;
                
                const expectedRichEmbed = new RichEmbed()
                    .setTitle(`*Task Updated:* ${rawData.payload.name}`)
                    .setColor(eventColor)
                    .setURL(baseUrl + rawData.payload.url_path)
                    .addField('Assignee', `Not Assigned`, true)
                    .addField('Status', `In Progress`, true);
    
                const eventController = createEventController(
                    undefined,
                    undefined,
                    undefined,
                    baseUrl
                );
    
                const actualValue = (await eventController.processEvent(rawData))
                    .getOrElseValue(undefined);
    
                expect(actualValue.body).toEqual(expectedRichEmbed);
                expect(actualValue.projectId).toEqual(rawData.payload.project_id);
            });

            it('should return error when processing task fails', async () => {
                expect.assertions(3);
    
                const assignee = 'Test';
                const completed = false;
                const baseUrl = 'https://app.activecollab.com/157544/';
    
                const rawData = testData.getRawUpdatedTask();
                rawData.payload.is_completed = completed;
       
                const mockMappingController: Partial<IMappingController> = {
                    getDiscordUser: jest.fn(() => { throw new Error(); })
                };
    
                const mockDiscordController: Partial<IDiscordController> = {
                    getUserId: jest.fn().mockReturnValue(undefined)
                };
                
                const eventController = createEventController(
                    undefined,
                    <IMappingController>mockMappingController,
                    undefined,
                    baseUrl
                );
                const actualValue = await eventController.processEvent(rawData);
    
                expect(actualValue.isLeft()).toBe(true);
                expect(actualValue.isRight()).toBe(false);
                expect(actualValue.value)
                    .toEqual('Unable to process Task Event: Error');
            });
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
        it('should return formatted comment when comment type is new comment and parent is task', async () => {
            expect.assertions(2);
    
            const baseUrl = 'https://app.activecollab.com/157544/';

            const assignee = 'Test';
            const projectId = 1;
            const taskName = 'Task';

            const rawData = testData.getRawNewComment();

            const expectedRichEmbed = new RichEmbed()
                .setTitle(`*Comment Added to Task:* ${taskName}`)
                .setDescription(rawData.payload.body)
                .setColor(eventColor)
                .setURL(baseUrl + rawData.payload.url_path)
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

            const actualValue = await eventController.processEvent(rawData);

            expect(actualValue.isLeft()).toBe(true);
            expect(actualValue.isRight()).toBe(false);
            expect(actualValue.value)
                .toEqual(`Unable to process Comment Event: ${errorValue}`);
        });

        it('should return error whengetting user ID fails', async () => {
            expect.assertions(3);

            const assignee = 'Test';
            const completed = false;
            const baseUrl = 'https://app.activecollab.com/157544/';

            const rawData = testData.getRawNewComment();
            rawData.payload.is_completed = completed;
   
            const mockMappingController: Partial<IMappingController> = {
                getDiscordUser: jest.fn(() => { throw new Error(); })
            };

            const mockDiscordController: Partial<IDiscordController> = {
                getUserId: jest.fn().mockReturnValue(undefined)
            };
            
            const eventController = createEventController(
                undefined,
                <IMappingController>mockMappingController,
                undefined,
                baseUrl
            );
            const actualValue = await eventController.processEvent(rawData);

            expect(actualValue.isLeft()).toBe(true);
            expect(actualValue.isRight()).toBe(false);
            expect(actualValue.value)
                .toEqual('Unable to process Comment Event: Error');
        });
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
    activeCollabApi: Partial<IActiveCollabAPI> = { 
        findProjectForTask: jest.fn(() => Promise.resolve(some(1))) 
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