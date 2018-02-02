import { Message, RichEmbed, User } from 'discord.js';
import { Logger } from 'structured-log';
import * as moment from 'moment';
import * as mockDate from 'mockdate';

import { createCommandController } from '../src/controllers/command';
import { IActiveCollabAPI } from '../src/controllers/activecollab-api';
import { IMappingController } from '../src/controllers/mapping';
import { Assignment } from '../src/models/report';
import { Project } from '../src/models/project';
import { IApiController } from '../src/controllers/api';
import { access } from 'fs';
import { map } from 'fp-ts/lib/Option';
import { disconnect } from 'cluster';

const eventColor = '#449DF5';
const discordUser: Partial<User> = {
    tag: 'tag',
    username: 'username',
    id: '22020202'
};

describe('tasksDueThisWeekForProject', () => {
    it('should return tasks for project due this week grouped by column', async () => {
        const projectId = 0;

        mockDate.set('2017-05-02');
        
        const tasksToReturn: Array<Partial<Assignment>> = [{
            name: 'Task 1',
            project_id: projectId, 
            permalink: '\/projects\/2\/tasks\/35',
            due_on: moment().add(2, 'days').valueOf(),
            task_list_id: 1
        },
        {
            name: 'Task 2',
            project_id: projectId,
            permalink: '\/projects\/2\/tasks\/76',
            due_on: moment().add(4, 'days').valueOf(),
            task_list_id: 1
        },
        {
            name: 'Task 3',
            project_id: projectId,
            permalink: '\/projects\/2\/tasks\/347',
            due_on: moment().add(20, 'days').valueOf(),
            task_list_id: 1
        },
        {
            name: 'Task 4',
            project_id: projectId,
            permalink: '\/projects\/2\/tasks\/288',
            due_on: moment().add(1, 'days').valueOf(),
            task_list_id: 2
        },
        {
            name: 'Task 5',
            project_id: projectId,
            assignee_id: 0,
            permalink: '\/projects\/2\/tasks\/288',
            due_on: moment().subtract(10, 'days').valueOf(),
            task_list_id: 2
        }];

        const taskLists = {
            1: 'Completed',
            2: 'Blocked'
        };
    
        const expectedReturn = new RichEmbed()
            .setTitle(`Tasks due this week`)
            .setColor(eventColor)
            .addField(taskLists[tasksToReturn[0].task_list_id],
                `• [${tasksToReturn[0].name}](${tasksToReturn[0].permalink}` 
                    + ` - ${moment(tasksToReturn[0].due_on).format('ddd Do')}\n` + 
                `• [${tasksToReturn[1].name}](${tasksToReturn[1].permalink}` 
                    + ` - ${moment(tasksToReturn[1].due_on).format('ddd Do')}\n`)
            .addField(taskLists[tasksToReturn[3].task_list_id], 
                `• [${tasksToReturn[3].name}](${tasksToReturn[3].permalink}` 
                    + ` - ${moment(tasksToReturn[3].due_on).format('ddd Do')}\n`);

        const getTaskListNameById = jest.fn().mockImplementation(
            (projectId: number, taskId: number) => {
                return taskLists[taskId];
            });

        const activeCollabApiMock = createActiveCollabApiMock(
            undefined,
            undefined,
            getTaskListNameById,
            jest.fn(() => Promise.resolve(tasksToReturn))
        );

        const commandController = new CommandControllerBuilder()
            .withActiveCollabApi(activeCollabApiMock as IActiveCollabAPI)
            .Build();

        expect((await commandController.tasksDueThisWeekForProject(projectId)))
            .toEqual(expectedReturn);    
            
        mockDate.reset();
    });

    it('should split tasks into fields when too long', async () => {
        const projectId = 0;
        
        mockDate.set('2017-02-05');

        const tasksToReturn: Array<Partial<Assignment>> = [{
            name: 'Task 1',
            project_id: projectId,
            permalink: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a',
            due_on: moment().add(2, 'days').valueOf(),
            task_list_id: 1
        },
        {
            name: 'Task 2',
            project_id: projectId,
            permalink: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a',
            due_on: moment().add(3, 'days').valueOf(),
            task_list_id: 1
        },
        {
            name: 'Task 3',
            project_id: projectId,
            permalink: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a',
            due_on: moment().add(4, 'days').valueOf(),
            task_list_id: 1
        }];

        const taskList = 'Completed';
    
        const expectedReturn = new RichEmbed()
            .setTitle(`Tasks due this week`)
            .setColor(eventColor)
            .addField(taskList,
                `• [${tasksToReturn[0].name}](${tasksToReturn[0].permalink}` 
                    + ` - ${moment(tasksToReturn[0].due_on).format('ddd Do')}\n` + 
                `• [${tasksToReturn[1].name}](${tasksToReturn[1].permalink}` 
                    + ` - ${moment(tasksToReturn[1].due_on).format('ddd Do')}\n`)
            .addField(taskList, 
                `• [${tasksToReturn[2].name}](${tasksToReturn[2].permalink}` 
                    + ` - ${moment(tasksToReturn[2].due_on).format('ddd Do')}\n`);

        const getTaskListNameById = jest.fn().mockReturnValue(taskList);

        const activeCollabApiMock = createActiveCollabApiMock(
            undefined,
            undefined,
            getTaskListNameById,
            jest.fn(() => Promise.resolve(tasksToReturn))
        );

        const commandController = new CommandControllerBuilder()
            .withActiveCollabApi(activeCollabApiMock as IActiveCollabAPI)
            .Build();

        expect((await commandController.tasksDueThisWeekForProject(0)))
            .toEqual(expectedReturn);        

        mockDate.reset();
    });

    it('should return none found message when no tasks exist', async () => {
        expect.assertions(1);
        
        const expectedReturn = `No tasks found that are due this week.`;

        const activeCollabApiMock = createActiveCollabApiMock(
            undefined,
            undefined,
            undefined,
            jest.fn(() => Promise.resolve([]))
        );

        const commandController = new CommandControllerBuilder()
            .withActiveCollabApi(activeCollabApiMock as IActiveCollabAPI)
            .Build();
            
        expect((await commandController.tasksDueThisWeekForProject(0)).title)
            .toEqual(`No tasks found that are due this week.`);
    });

    it('should return error message and log error when error getting task list name', async () => {
        expect.assertions(2);

        mockDate.set('2017-05-02');

        const error = 'error';
        
        const projectId = 0;
        const taskListId = 1;
        
        const tasksToReturn: Array<Partial<Assignment>> = [{
            name: 'Task 1',
            project_id: projectId, 
            permalink: '\/projects\/2\/tasks\/35',
            due_on: moment().add(2, 'days').valueOf(),
            task_list_id: taskListId
        }];

        const expectedReturn = new RichEmbed()
            .addField('Warning', `There was a problem getting `
                + ` the task list name for tasks in the same list as ` 
                + `${tasksToReturn[0].name}`);

        const logger = createMockLogger();

        const activeCollabApiMock = createActiveCollabApiMock(
            undefined,
            undefined,
            jest.fn(() => Promise.reject(error)),
            jest.fn(() => Promise.resolve(tasksToReturn))
        );

        const commandController = new CommandControllerBuilder()
            .withLogger(logger)
            .withActiveCollabApi(activeCollabApiMock as IActiveCollabAPI)
            .Build();
            
        expect((await commandController.tasksDueThisWeekForProject(0)).fields)
            .toContainEqual(expectedReturn.fields[0]);
        expect(logger.warn).toBeCalledWith(`Error getting task list name for id ${taskListId}: ${error}`);
    });

    it('should return error message and log error when error getting tasks', async () => {
        expect.assertions(2);

        mockDate.set('2017-05-02');

        const error = 'error';
        
        const projectId = 0;
        const taskListId = 1;
        
        const tasksToReturn: Array<Partial<Assignment>> = [{
            name: 'Task 1',
            project_id: projectId, 
            permalink: '\/projects\/2\/tasks\/35',
            due_on: moment().add(2, 'days').valueOf(),
            task_list_id: taskListId
        }];

        const expectedReturn = `There was an error getting tasks.`;

        const logger = createMockLogger();

        const activeCollabApiMock = createActiveCollabApiMock(
            undefined,
            undefined,
            undefined,
            jest.fn(() => Promise.reject(error))
        );

        const commandController = new CommandControllerBuilder()
            .withLogger(logger)
            .withActiveCollabApi(activeCollabApiMock as IActiveCollabAPI)
            .Build();
            
        expect((await commandController.tasksDueThisWeekForProject(0)).title)
            .toEqual(expectedReturn);
        expect(logger.warn).toBeCalledWith(`Error getting tasks: ${error}`);
    });
});

describe('listTasksForUser', () => {
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

        const activeCollabApiMock = createActiveCollabApiMock(
            jest.fn(() => Promise.resolve(tasksToReturn)),
            jest.fn(() => Promise.resolve(projectsToReturn))
        );

        const commandController = new CommandControllerBuilder()
            .withActiveCollabApi(activeCollabApiMock as IActiveCollabAPI)
            .Build();

        expect((await commandController.listTasksForUser(<User>discordUser)))
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

        const activeCollabApiMock = createActiveCollabApiMock(
            jest.fn(() => Promise.resolve(tasksToReturn)),
            jest.fn(() => Promise.resolve(projectsToReturn))
        );

        const commandController = new CommandControllerBuilder()
            .withActiveCollabApi(activeCollabApiMock as IActiveCollabAPI)
            .Build();

        expect((await commandController.listTasksForUser(<User>discordUser)))
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
        }
    ];
        
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

        const activeCollabApiMock = createActiveCollabApiMock(
            jest.fn(() => Promise.resolve(tasksToReturn)),
            jest.fn(() => Promise.resolve(projectsToReturn))
        );

        const commandController = new CommandControllerBuilder()
            .withActiveCollabApi(activeCollabApiMock as IActiveCollabAPI)
            .Build();

        expect((await commandController.listTasksForUser(<User>discordUser)))
            .toEqual(expectedReturn);
    });

    it('should return none found message when user valid and when no tasks exist', async () => {
        expect.assertions(1);
        
        const expectedReturn = new RichEmbed()
            .setTitle(`No tasks for <@${discordUser.id}>`)
            .setColor(eventColor);

        const activeCollabApiMock = createActiveCollabApiMock(
            jest.fn(() => Promise.resolve([]))
        );

        const commandController = new CommandControllerBuilder()
            .withActiveCollabApi(activeCollabApiMock as IActiveCollabAPI)
            .Build();
            
        expect((await commandController.listTasksForUser(<User>discordUser)))
            .toEqual(expectedReturn);
    });

    it('should return error message when user valid and when no projects exist', async () => {
        expect.assertions(1);

        const expectedReturn = new RichEmbed()
            .setTitle(`A project needs to exist to get tasks`)
            .setColor(eventColor);

        const activeCollabApiMock = createActiveCollabApiMock(
            undefined,
            jest.fn(() => Promise.resolve([]))
        );

        const commandController = new CommandControllerBuilder()
            .withActiveCollabApi(activeCollabApiMock as IActiveCollabAPI)
            .Build();
            
        expect((await commandController.listTasksForUser(<User>discordUser)))
            .toEqual(expectedReturn);
    });

    it('should return error message and log error when error getting tasks', async () => {
        expect.assertions(2);
        
        const expectedReturn = new RichEmbed()
            .setTitle(`There was an error getting tasks for <@${discordUser.id}>`)
            .setColor(eventColor);

        const activeCollabApiMock = createActiveCollabApiMock(
            jest.fn(() => Promise.reject('error'))
        );

        const logger = createMockLogger();

        const commandController = new CommandControllerBuilder()
            .withActiveCollabApi(activeCollabApiMock as IActiveCollabAPI)
            .withLogger(logger)
            .Build();
        expect((await commandController.listTasksForUser(<User>discordUser)))
            .toEqual(expectedReturn);
        expect(logger.warn).toBeCalled();
    });

    it('should return error message and log error when error getting projects', async () => {
        expect.assertions(2);

        const expectedReturn = new RichEmbed()
            .setTitle(`There was an error getting tasks for <@${discordUser.id}>`)
            .setColor(eventColor);

        const activeCollabApiMock = createActiveCollabApiMock(
            undefined,
            jest.fn(() => Promise.reject('error'))
        );

        const logger = createMockLogger();

        const commandController = new CommandControllerBuilder()
            .withActiveCollabApi(activeCollabApiMock as IActiveCollabAPI)
            .withLogger(logger)
            .Build();
        expect((await commandController.listTasksForUser(<User>discordUser)))
            .toEqual(expectedReturn);
        expect(logger.warn).toBeCalled();
    });

    it('should return error message when ActiveCollab user not found', async () => {
        expect.assertions(1);

        const expectedReturn = new RichEmbed()
            .setTitle(`Unable to find user: <@${discordUser.id}>`)
            .setColor(eventColor);

        const mappingControllerMock: Partial<IMappingController> = {
            getActiveCollabUser: jest.fn(() => { throw 'Error'; })
        };

        const logger = createMockLogger();

        const commandController = new CommandControllerBuilder()
            .withMappingController(mappingControllerMock as IMappingController)
            .Build();

        expect((await commandController.listTasksForUser(<User>discordUser)))
            .toEqual(expectedReturn);
    });
});

function createMockLogger(): Partial<Logger> {
    return {
        warn: jest.fn()
    };
}

function createActiveCollabApiMock(
    getTasksByUserId?,
    getAllProjects?,
    getTaskListNameById?,
    getAllAssignmentTasks?
) {
    const tasksToReturn: Array<Partial<Assignment>> = [{
        type: 'Task',
        project_id: 0,
        name: 'Task 1',
        assignee_id: 0,
        permalink: 'url'
    },
    {
        type: 'Task',
        project_id: 1,
        name: 'Task 2',
        assignee_id: 0,
        permalink: 'url'
    }];

    const projectsToReturn: Array<Partial<Project>> = [{
        id: 0,
        name: 'Project 0'
    },
    {
        id: 1,
        name: 'Project 1'
    }];

    if (getTasksByUserId === undefined) {
        getTasksByUserId = jest.fn(() => Promise.resolve(tasksToReturn));
    }

    if (getAllProjects === undefined) {
        getAllProjects = jest.fn(() => Promise.resolve(projectsToReturn));
    }

    if (getTaskListNameById === undefined) {
        getTaskListNameById = jest.fn().mockReturnValue('Completed');
    }

    if (getAllAssignmentTasks === undefined) {
        getAllAssignmentTasks = jest.fn().mockReturnValue(tasksToReturn);
    }

    return  {
        getAssignmentTasksByUserId: getTasksByUserId,
        getAllProjects: getAllProjects,
        getTaskListNameById: getTaskListNameById,
        getAllAssignmentTasks: getAllAssignmentTasks
    } as Partial<IActiveCollabAPI>;
}

class CommandControllerBuilder {
    private activeCollabApi: Partial<IActiveCollabAPI> = createActiveCollabApiMock();

    private mappingController: Partial<IMappingController> = {
        getActiveCollabUser: jest.fn().mockReturnValue('user')
    };

    private logger: Partial<Logger> = createMockLogger();

    public withLogger(logger: Logger): CommandControllerBuilder {
        this.logger = logger;
        return this;
    }

    public withActiveCollabApi(activeCollabApi: IActiveCollabAPI): CommandControllerBuilder {
        this.activeCollabApi = activeCollabApi;
        return this;
    }

    withMappingController(mappingController: IMappingController): CommandControllerBuilder {
        this.mappingController = mappingController;
        return this;
    }

    public Build() {
        return createCommandController(
            this.activeCollabApi as IActiveCollabAPI,
            this.mappingController as IMappingController,
            this.logger
        );
    }
}