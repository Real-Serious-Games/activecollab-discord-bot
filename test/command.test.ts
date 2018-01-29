import { Message, RichEmbed, User } from 'discord.js';
import { Logger } from 'structured-log';

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

describe('listTasksForUser', () => {
    it('should return task list when user valid and when tasks exist ', async () => {
        expect.assertions(1);
        
        const project1 = {
            id: 0,
            name: 'Project 1',
            task1: 'Task 1 Name',
            task1Url: '\/projects\/2\/tasks\/288',
            task2: 'Task 2 Name',
            task2Url: '\/projects\/2\/tasks\/2838'
        };
        const project2 = {
            id: 1,
            name: 'Project 2',
            task1: 'Task A Name',
            task1Url: '\/projects\/2\/tasks\/2848',
            task2: 'Task B Name',
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

        const tasksToReturn: Array<Assignment> = [{
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
                name: project1.task1,
                assignee_id: 0,
                permalink: project1.task1Url
            },
            {
                id: 3,
                type: 'Task',
                project_id: project2.id,
                name: project1.task2,
                assignee_id: 0,
                permalink: project1.task2Url
            }
        ];
        
        const expectedReturn = new RichEmbed()
            .setTitle(`Tasks for <@${discordUser.id}>`)
            .setColor(eventColor)
            .addField(project1.name,
                `• [${project1.task1}](${project1.task1Url})\n` + 
                `• [${project1.task2}](${project1.task2Url})`)
            .addField(project2.name, 
                `• [${project2.task1}](${project2.task1Url})\n` +
                `• [${project2.task2}](${project2.task2Url})`);

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
            .setTitle(`A project needs to exist to get tasks <@${discordUser.id}>`)
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
            .setTitle(`A project needs to exist to get tasks`)
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
    getAllProjects?
) {
    const tasksToReturn: Array<Assignment> = [{
        id: 0,
        type: 'Task',
        project_id: 0,
        name: 'Task 1',
        assignee_id: 0,
        permalink: 'url'
    },
    {
        id: 1,
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

    if (getTasksByUserId == undefined) {
        getTasksByUserId = jest.fn(() => Promise.resolve(this.tasksToReturn));
    }

    if (getAllProjects == undefined) {
        getAllProjects = jest.fn(() => Promise.resolve(this.projectsToReturn));
    }

    return  {
        getTasksByUserId: getTasksByUserId,
        getAllProjects: getAllProjects
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