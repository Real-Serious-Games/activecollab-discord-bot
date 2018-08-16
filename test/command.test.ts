import { RichEmbed, User } from 'discord.js';
import * as moment from 'moment';
import * as mockDate from 'mockdate';

import { IActiveCollabAPI } from '../src/controllers/activecollab-api';
import { IMappingController } from '../src/controllers/mapping';
import { Assignment } from '../src/models/report';
import { Project } from '../src/models/project';
import { CommandControllerBuilder } from './builders/commandControllerBuilder';
import { ActiveCollabApiMockBuilder } from './builders/activeCollabApiMockBuilder';
import { LoggerMockBuilder } from './builders/loggerMockBuilder';

const eventColor = '#449DF5';
const discordUser: Partial<User> = {
    tag: 'tag',
    username: 'username',
    id: '22020202'
};

describe('createTask', () => {
    it('should call activeCollabApi', async () => {
        expect.assertions(1);

        const projectId = 1;
        const taskName = 'name';

        const activeCollabApiMock = new ActiveCollabApiMockBuilder()
            .build();

        const commandController = new CommandControllerBuilder()
            .withActiveCollabApi(activeCollabApiMock)
            .build();

        await commandController.createTask(projectId, taskName);

        expect(activeCollabApiMock.createTask)
            .toBeCalledWith(projectId, taskName);
    });

    it('should throw error and log error message when error creating task', async () => {
        expect.assertions(1);

        const projectId = 1;
        const taskName = 'name';

        const error = new Error('Error');

        const activeCollabApiMock = new ActiveCollabApiMockBuilder()
            .withCreateTask(jest.fn(() => Promise.reject(error)))
            .build();

        const loggerMock = new LoggerMockBuilder()
            .build();

        const commandController = new CommandControllerBuilder()
            .withActiveCollabApi(activeCollabApiMock)
            .withLogger(loggerMock)
            .build();

        await expect(commandController.createTask(projectId, taskName))
            .rejects
            .toMatchObject(error);
    });
});

describe('tasksInListForProject', () => {
    it('should return tasks for project in list', async () => {
        const projectId = 0;
        const taskList1 = 'List1';
        const taskList2 = 'List2';

        const tasksToReturn: Array<Partial<Assignment>> = [{
            name: 'Task 1',
            project_id: projectId,
            permalink: '\/projects\/2\/tasks\/35',
            task_list: taskList1
        },
        {
            name: 'Task 2',
            project_id: projectId,
            permalink: '\/projects\/2\/tasks\/76',
            task_list: taskList1
        },
        {
            name: 'Task 3',
            project_id: projectId,
            permalink: '\/projects\/2\/tasks\/347',
            task_list: taskList1
        },
        {
            name: 'Task 4',
            project_id: projectId,
            permalink: '\/projects\/2\/tasks\/288',
            task_list: taskList2
        }];

        const expectedReturn = new RichEmbed()
            .setColor(eventColor)
            .addField(`${taskList1} Tasks`,
                `• [${tasksToReturn[0].name}](${tasksToReturn[0].permalink})\n` +
                `• [${tasksToReturn[1].name}](${tasksToReturn[1].permalink})\n` +
                `• [${tasksToReturn[2].name}](${tasksToReturn[2].permalink})\n`);

        const activeCollabApiMock = new ActiveCollabApiMockBuilder()
            .withGetAllAssignmentTasks(jest.fn(() => Promise.resolve(tasksToReturn)))
            .build();

        const commandController = new CommandControllerBuilder()
            .withActiveCollabApi(activeCollabApiMock as IActiveCollabAPI)
            .build();

        expect(await commandController.tasksInListForProject(
            taskList1.toLowerCase(),
            projectId
        ))
            .toEqual(expectedReturn);
    });

    it('should split into multiple fields based on field length', async () => {
        const projectId = 0;
        const taskList = 'Completed';

        const tasksToReturn: Array<Partial<Assignment>> = [{
            name: 'Task 1',
            project_id: projectId,
            permalink: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a',
            task_list: taskList
        },
        {
            name: 'Task 2',
            project_id: projectId,
            permalink: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a',
            task_list: taskList
        },
        {
            name: 'Task 3',
            project_id: projectId,
            permalink: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a',
            task_list: taskList
        }];

        const expectedReturn = new RichEmbed()
            .setColor(eventColor)
            .addField(`${taskList} Tasks`,
                `• [${tasksToReturn[0].name}](${tasksToReturn[0].permalink})\n` +
                `• [${tasksToReturn[1].name}](${tasksToReturn[1].permalink})\n`)
            .addField(`${taskList} Tasks`,
                `• [${tasksToReturn[2].name}](${tasksToReturn[2].permalink})\n`);

        const activeCollabApiMock = new ActiveCollabApiMockBuilder()
            .withGetAllAssignmentTasks(jest.fn(() => Promise.resolve(tasksToReturn)))
            .build();

        const commandController = new CommandControllerBuilder()
            .withActiveCollabApi(activeCollabApiMock as IActiveCollabAPI)
            .build();

        expect((await commandController.tasksInListForProject(taskList, 0)))
            .toEqual(expectedReturn);
    });

    it('should return none found message when no tasks exist', async () => {
        expect.assertions(1);

        const taskList = 'List';

        const activeCollabApiMock = new ActiveCollabApiMockBuilder()
            .withGetAllAssignmentTasks(jest.fn(() => Promise.resolve([])))
            .build();

        const commandController = new CommandControllerBuilder()
            .withActiveCollabApi(activeCollabApiMock as IActiveCollabAPI)
            .build();

        expect((await commandController.tasksInListForProject(taskList, 0)).title)
            .toEqual(`No tasks found for task list: ${taskList}.`);
    });

    it('should return and log error message when unable to get tasks', async () => {
        expect.assertions(2);

        const error = 'error';
        const expectedReturn = `There was an error getting tasks for this project.`;

        const logger = new LoggerMockBuilder().build();

        const activeCollabApiMock = new ActiveCollabApiMockBuilder()
            .withGetAllAssignmentTasks(jest.fn(() => Promise.reject(error)))
            .build();

        const commandController = new CommandControllerBuilder()
            .withLogger(logger)
            .withActiveCollabApi(activeCollabApiMock as IActiveCollabAPI)
            .build();

        expect((await commandController.tasksInListForProject('columnm', 0)).title)
            .toEqual(expectedReturn);
        expect(logger.error).toBeCalledWith(`Error getting tasks: ${error}`);
    });
});

describe('tasksDueThisWeekForProject', () => {
    it('should return tasks for project due this week grouped by column', async () => {
        const projectId = 0;
        const taskList1 = 'List1';
        const taskList2 = 'List2';

        mockDate.set('2017-05-02');

        try {
            const tasksToReturn: Array<Partial<Assignment>> = [{
                name: 'Task 1',
                project_id: projectId,
                permalink: '\/projects\/2\/tasks\/35',
                due_on: moment().add(2, 'days').unix(),
                task_list: taskList1
            },
            {
                name: 'Task 2',
                project_id: projectId,
                permalink: '\/projects\/2\/tasks\/76',
                due_on: moment().add(4, 'days').unix(),
                task_list: taskList1
            },
            {
                name: 'Task 3',
                project_id: projectId,
                permalink: '\/projects\/2\/tasks\/347',
                due_on: moment().add(20, 'days').unix(),
                task_list: taskList1
            },
            {
                name: 'Task 4',
                project_id: projectId,
                permalink: '\/projects\/2\/tasks\/288',
                due_on: moment().add(1, 'days').unix(),
                task_list: taskList2
            },
            {
                name: 'Task 5',
                project_id: projectId,
                assignee_id: 0,
                permalink: '\/projects\/2\/tasks\/288',
                due_on: moment().subtract(10, 'days').unix(),
                task_list: taskList2
            }];

            const expectedReturn = new RichEmbed()
                .setTitle(`Tasks due this week`)
                .setColor(eventColor)
                .addField(taskList1,
                    `• [${tasksToReturn[0].name}](${tasksToReturn[0].permalink})`
                    + ` - ${moment.unix(tasksToReturn[0].due_on).format('ddd Do')}\n` +
                    `• [${tasksToReturn[1].name}](${tasksToReturn[1].permalink})`
                    + ` - ${moment.unix(tasksToReturn[1].due_on).format('ddd Do')}\n`)
                .addField(taskList2,
                    `• [${tasksToReturn[3].name}](${tasksToReturn[3].permalink})`
                    + ` - ${moment.unix(tasksToReturn[3].due_on).format('ddd Do')}\n`);

            const activeCollabApiMock = new ActiveCollabApiMockBuilder()
                .withGetAllAssignmentTasks(jest.fn(() => Promise.resolve(tasksToReturn)))
                .build();

            const commandController = new CommandControllerBuilder()
                .withActiveCollabApi(activeCollabApiMock as IActiveCollabAPI)
                .build();

            expect((await commandController.tasksDueThisWeekForProject(projectId)))
                .toEqual(expectedReturn);
        }
        finally {
            mockDate.reset();
        }
    });

    it('should split tasks into fields when too long', async () => {
        const projectId = 0;
        const taskList = 'Completed';

        mockDate.set('2017-02-05');

        try {
            const tasksToReturn: Array<Partial<Assignment>> = [{
                name: 'Task 1',
                project_id: projectId,
                permalink: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a',
                due_on: moment().add(2, 'days').unix(),
                task_list: taskList
            },
            {
                name: 'Task 2',
                project_id: projectId,
                permalink: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a',
                due_on: moment().add(3, 'days').unix(),
                task_list: taskList
            },
            {
                name: 'Task 3',
                project_id: projectId,
                permalink: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a',
                due_on: moment().add(4, 'days').unix(),
                task_list: taskList
            }];


            const expectedReturn = new RichEmbed()
                .setTitle(`Tasks due this week`)
                .setColor(eventColor)
                .addField(taskList,
                    `• [${tasksToReturn[0].name}](${tasksToReturn[0].permalink})`
                    + ` - ${moment.unix(tasksToReturn[0].due_on).format('ddd Do')}\n` +
                    `• [${tasksToReturn[1].name}](${tasksToReturn[1].permalink})`
                    + ` - ${moment.unix(tasksToReturn[1].due_on).format('ddd Do')}\n`)
                .addField(taskList,
                    `• [${tasksToReturn[2].name}](${tasksToReturn[2].permalink})`
                    + ` - ${moment.unix(tasksToReturn[2].due_on).format('ddd Do')}\n`);

            const activeCollabApiMock = new ActiveCollabApiMockBuilder()
                .withGetAllAssignmentTasks(jest.fn(() => Promise.resolve(tasksToReturn)))
                .build();

            const commandController = new CommandControllerBuilder()
                .withActiveCollabApi(activeCollabApiMock as IActiveCollabAPI)
                .build();

            expect((await commandController.tasksDueThisWeekForProject(0)))
                .toEqual(expectedReturn);
        }
        finally {
            mockDate.reset();
        }
    });

    it('should return none found message when no tasks exist', async () => {
        expect.assertions(1);

        const activeCollabApiMock = new ActiveCollabApiMockBuilder()
            .withGetAllAssignmentTasks(jest.fn(() => Promise.resolve([])))
            .build();

        const commandController = new CommandControllerBuilder()
            .withActiveCollabApi(activeCollabApiMock as IActiveCollabAPI)
            .build();

        expect((await commandController.tasksDueThisWeekForProject(0)).title)
            .toEqual(`No tasks found that are due this week.`);
    });

    it('should return error message and log error when error getting tasks', async () => {
        expect.assertions(2);

        mockDate.set('2017-05-02');

        try {
            const error = 'error';
            const expectedReturn = `There was an error getting tasks.`;

            const logger = new LoggerMockBuilder().build();

            const activeCollabApiMock = new ActiveCollabApiMockBuilder()
                .withGetAllAssignmentTasks(jest.fn(() => Promise.reject(error)))
                .build();

            const commandController = new CommandControllerBuilder()
                .withLogger(logger)
                .withActiveCollabApi(activeCollabApiMock as IActiveCollabAPI)
                .build();

            expect((await commandController.tasksDueThisWeekForProject(0)).title)
                .toEqual(expectedReturn);
            expect(logger.error).toBeCalledWith(`Error getting tasks: ${error}`);
        }
        finally {
            mockDate.reset();
        }
    });
});

describe('tasksForUser', () => {
    it('should return task list when user valid and when tasks exist', async () => {
        expect.assertions(1);

        const project1 = {
            id: 0,
            name: 'Project 1',
            task1: 'Task 1',
            task1Url: '\/projects\/2\/tasks\/288',
            task2: 'Task 2',
            task2Url: '\/projects\/2\/tasks\/2838'
        };
        const project2 = {
            id: 1,
            name: 'Project 2',
            task1: 'Task A',
            task1Url: '\/projects\/2\/tasks\/2848',
            task2: 'Task B',
            task2Url: '\/projects\/2\/tasks\/28238'
        };

        const projectsToReturn: Array<Partial<Project>> = [{
            id: project1.id,
            name: project1.name
        },
        {
            id: project2.id,
            name: project2.name
        }];

        const tasksToReturn: Array<Partial<Assignment>> = [{
            id: 0,
            type: 'Task',
            project_id: project1.id,
            name: project1.task1,
            assignee_id: 0,
            permalink: project1.task1Url
        },
        {
            id: 1,
            type: 'Task',
            project_id: project1.id,
            name: project1.task2,
            assignee_id: 0,
            permalink: project1.task2Url
        },
        {
            id: 2,
            type: 'Task',
            project_id: project2.id,
            name: project2.task1,
            assignee_id: 0,
            permalink: project2.task1Url
        },
        {
            id: 3,
            type: 'Task',
            project_id: project2.id,
            name: project2.task2,
            assignee_id: 0,
            permalink: project2.task2Url
        }
        ];

        const expectedReturn = new RichEmbed()
            .setTitle(`Tasks for ${discordUser.username}`)
            .setColor(eventColor)
            .addField(project1.name,
                `• [${project1.task1}](${project1.task1Url})\n` +
                `• [${project1.task2}](${project1.task2Url})\n`)
            .addField(project2.name,
                `• [${project2.task1}](${project2.task1Url})\n` +
                `• [${project2.task2}](${project2.task2Url})\n`);

        const activeCollabApiMock = new ActiveCollabApiMockBuilder()
            .withGetAssignmentTasksByUserId(jest.fn(() => Promise.resolve(tasksToReturn)))
            .withGetAllProjects(jest.fn(() => Promise.resolve(projectsToReturn)))
            .build();

        const commandController = new CommandControllerBuilder()
            .withActiveCollabApi(activeCollabApiMock as IActiveCollabAPI)
            .build();

        expect((await commandController.tasksForUser(<User>discordUser)))
            .toEqual(expectedReturn);
    });

    it('shouldnt return tasks when project name isnt found', async () => {
        expect.assertions(1);

        const project1 = {
            id: 0,
            name: 'Project 1',
            task1: 'Task 1',
            task1Url: '\/projects\/2\/tasks\/288',
            task2: 'Task 2',
            task2Url: '\/projects\/2\/tasks\/2838'
        };
        const project2 = {
            id: 1,
            name: 'Project 2',
            task1: 'Task A',
            task1Url: '\/projects\/2\/tasks\/2848',
            task2: 'Task B',
            task2Url: '\/projects\/2\/tasks\/28238'
        };

        const projectsToReturn: Array<Partial<Project>> = [{
            id: project1.id,
            name: project1.name
        }];

        const tasksToReturn: Array<Partial<Assignment>> = [{
            id: 0,
            type: 'Task',
            project_id: project1.id,
            name: project1.task1,
            assignee_id: 0,
            permalink: project1.task1Url
        },
        {
            id: 1,
            type: 'Task',
            project_id: project1.id,
            name: project1.task2,
            assignee_id: 0,
            permalink: project1.task2Url
        },
        {
            id: 2,
            type: 'Task',
            project_id: project2.id,
            name: project2.task1,
            assignee_id: 0,
            permalink: project2.task1Url
        }
        ];

        const expectedReturn = new RichEmbed()
            .setTitle(`Tasks for ${discordUser.username}`)
            .setColor(eventColor)
            .addField(project1.name,
                `• [${project1.task1}](${project1.task1Url})\n` +
                `• [${project1.task2}](${project1.task2Url})\n`);

        const activeCollabApiMock = new ActiveCollabApiMockBuilder()
            .withGetAssignmentTasksByUserId(jest.fn(() => Promise.resolve(tasksToReturn)))
            .withGetAllProjects(jest.fn(() => Promise.resolve(projectsToReturn)))
            .build();

        const commandController = new CommandControllerBuilder()
            .withActiveCollabApi(activeCollabApiMock as IActiveCollabAPI)
            .build();

        expect((await commandController.tasksForUser(<User>discordUser)))
            .toEqual(expectedReturn);
    });

    it('should should split into RichEmbeds with fields of at most 1024 characters', async () => {
        expect.assertions(1);

        const project1 = {
            id: 0,
            name: 'Project 1',
            task1: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a',
            task1Url: '\/projects\/2\/tasks\/288',
            task2: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a',
            task2Url: '\/projects\/2\/tasks\/2838',
            task3: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a',
            task3Url: '\/projects\/2\/tasks\/2838'
        };
        const project2 = {
            id: 1,
            name: 'Project 2',
            task1: 'Task A',
            task1Url: '\/projects\/2\/tasks\/2848',
            task2: 'Task B',
            task2Url: '\/projects\/2\/tasks\/28238'
        };

        const projectsToReturn: Array<Partial<Project>> = [{
            id: project1.id,
            name: project1.name
        },
        {
            id: project2.id,
            name: project2.name
        }];

        const tasksToReturn: Array<Partial<Assignment>> = [{
            id: 0,
            type: 'Task',
            project_id: project1.id,
            name: project1.task1,
            assignee_id: 0,
            permalink: project1.task1Url
        },
        {
            id: 1,
            type: 'Task',
            project_id: project1.id,
            name: project1.task2,
            assignee_id: 0,
            permalink: project1.task2Url
        },
        {
            id: 2,
            type: 'Task',
            project_id: project1.id,
            name: project1.task3,
            assignee_id: 0,
            permalink: project1.task2Url
        },
        {
            id: 3,
            type: 'Task',
            project_id: project2.id,
            name: project2.task1,
            assignee_id: 0,
            permalink: project2.task1Url
        }];

        const expectedReturn = new RichEmbed()
            .setTitle(`Tasks for ${discordUser.username}`)
            .setColor(eventColor)
            .addField(project1.name,
                `• [${project1.task1}](${project1.task1Url})\n` +
                `• [${project1.task2}](${project1.task2Url})\n`)
            .addField(project1.name,
                `• [${project1.task3}](${project1.task3Url})\n`)
            .addField(project2.name,
                `• [${project2.task1}](${project2.task1Url})\n`);

        const activeCollabApiMock = new ActiveCollabApiMockBuilder()
            .withGetAssignmentTasksByUserId(jest.fn(() => Promise.resolve(tasksToReturn)))
            .withGetAllProjects(jest.fn(() => Promise.resolve(projectsToReturn)))
            .build();

        const commandController = new CommandControllerBuilder()
            .withActiveCollabApi(activeCollabApiMock as IActiveCollabAPI)
            .build();

        expect((await commandController.tasksForUser(<User>discordUser)))
            .toEqual(expectedReturn);
    });

    it('should return none found message when user valid and when no tasks exist', async () => {
        expect.assertions(1);

        const expectedReturn = new RichEmbed()
            .setTitle(`No tasks for <@${discordUser.id}>`)
            .setColor(eventColor);

        const activeCollabApiMock = new ActiveCollabApiMockBuilder()
            .withGetAssignmentTasksByUserId(jest.fn(() => Promise.resolve([])))
            .build();

        const commandController = new CommandControllerBuilder()
            .withActiveCollabApi(activeCollabApiMock as IActiveCollabAPI)
            .build();

        expect((await commandController.tasksForUser(<User>discordUser)))
            .toEqual(expectedReturn);
    });

    it('should return error message when user valid and when no projects exist', async () => {
        expect.assertions(1);

        const expectedReturn = new RichEmbed()
            .setTitle(`A project needs to exist to get tasks`)
            .setColor(eventColor);

        const activeCollabApiMock = new ActiveCollabApiMockBuilder()
            .withGetAllProjects(jest.fn(() => Promise.resolve([])))
            .build();

        const commandController = new CommandControllerBuilder()
            .withActiveCollabApi(activeCollabApiMock as IActiveCollabAPI)
            .build();

        expect((await commandController.tasksForUser(<User>discordUser)))
            .toEqual(expectedReturn);
    });

    it('should return error message and log error when error getting tasks', async () => {
        expect.assertions(2);

        const expectedReturn = new RichEmbed()
            .setTitle(`There was an error getting tasks for <@${discordUser.id}>`)
            .setColor(eventColor);

        const activeCollabApiMock = new ActiveCollabApiMockBuilder()
            .withGetAssignmentTasksByUserId(jest.fn(() => Promise.reject('error')))
            .build();

        const logger = new LoggerMockBuilder().build();

        const commandController = new CommandControllerBuilder()
            .withActiveCollabApi(activeCollabApiMock as IActiveCollabAPI)
            .withLogger(logger)
            .build();
        expect((await commandController.tasksForUser(<User>discordUser)))
            .toEqual(expectedReturn);
        expect(logger.error).toBeCalled();
    });

    it('should return error message and log error when error getting projects', async () => {
        expect.assertions(2);

        const expectedReturn = new RichEmbed()
            .setTitle(`There was an error getting tasks for <@${discordUser.id}>`)
            .setColor(eventColor);

        const activeCollabApiMock = new ActiveCollabApiMockBuilder()
            .withGetAllProjects(jest.fn(() => Promise.reject('error')))
            .build();

        const logger = new LoggerMockBuilder().build();

        const commandController = new CommandControllerBuilder()
            .withActiveCollabApi(activeCollabApiMock as IActiveCollabAPI)
            .withLogger(logger)
            .build();
        expect((await commandController.tasksForUser(<User>discordUser)))
            .toEqual(expectedReturn);
        expect(logger.error).toBeCalled();
    });

    it('should return error message when ActiveCollab user not found', async () => {
        expect.assertions(1);

        const expectedReturn = new RichEmbed()
            .setTitle(`Unable to find user: <@${discordUser.id}>`)
            .setColor(eventColor);

        const mappingControllerMock: Partial<IMappingController> = {
            getActiveCollabUser: jest.fn(() => { throw 'Error'; })
        };

        const logger = new LoggerMockBuilder().build();

        const commandController = new CommandControllerBuilder()
            .withMappingController(mappingControllerMock as IMappingController)
            .withLogger(logger)
            .build();

        expect((await commandController.tasksForUser(<User>discordUser)))
            .toEqual(expectedReturn);
    });
});

// describe('filteredTasks', () => {
//     it('should return spreadsheet file', async () => {

//         const writeToFileMock = (workbook: Excel.Workbook,
//             filename: string,
//             logger: Logger) => Promise.resolve(() => jest.fn());

//         const tasksToReturn: Array<TimeRecord> = [
//             {
//                 id: 1,
//                 type: 'type',
//                 parent_type: 'parent_type',
//                 parent_id: 1,
//                 group_id: 1,
//                 record_date: 1,
//                 user_id: 1,
//                 user_name: 'user_name',
//                 user_email: 'user_email',
//                 summary: 'summary',
//                 value: 1,
//                 billable_status: 1,
//                 project_id: 1,
//                 project_name: 'project_name',
//                 project_url: 'project_url',
//                 client_id: 1,
//                 client_name: 'client_name',
//                 currency_id: 1,
//                 custom_hourly_rate: 1,
//                 parent_name: 'parent_name',
//                 parent_url: 'parent_url',
//                 group_name: 'group_name',
//                 billable_name: 'billable_name'
//             },
//             {
//                 id: 2,
//                 type: 'type',
//                 parent_type: 'parent_type',
//                 parent_id: 2,
//                 group_id: 2,
//                 record_date: 2,
//                 user_id: 2,
//                 user_name: 'user_name',
//                 user_email: 'user_email',
//                 summary: 'summary',
//                 value: 2,
//                 billable_status: 2,
//                 project_id: 2,
//                 project_name: 'project_name',
//                 project_url: 'project_url',
//                 client_id: 2,
//                 client_name: 'client_name',
//                 currency_id: 2,
//                 custom_hourly_rate: 2,
//                 parent_name: 'parent_name',
//                 parent_url: 'parent_url',
//                 group_name: 'group_name',
//                 billable_name: 'billable_name'
//             }
//         ];

//         const expectedReturn = new RichEmbed()
//             .setTitle('Success')
//             .setColor(eventColor);

//         const activeCollabApiMock = new ActiveCollabApiMockBuilder()
//             .withGetAllAssignmentTasksDateRange(jest.fn(() => Promise.resolve(tasksToReturn)))
//             .build();

//         const commandController = new CommandControllerBuilder()
//             .withActiveCollabApi(activeCollabApiMock as IActiveCollabAPI)
//             .build();

//         expect(await commandController.filteredTasks([], [], '', '')
//             .then(embed => embed.title)
//         )
//             .toEqual(expectedReturn.title);
//     });
// });
