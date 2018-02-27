import { none, some } from 'fp-ts/lib/Option';

import { RestClientMockBuilder } from './builders/restClientMockBuilder';
import { createActiveCollabAPI } from '../src/controllers/activecollab-api';
import { IActiveCollabRestClient, QueryParams } from '../src/controllers/activecollab-rest';
import { getEmptyReport } from './testData';

describe('ActiveCollab API', () => {
    describe('addTask', () => {
        it('posts task to specified project', async () => {
            expect.assertions(2);
            
            const projectId = 123;
            const taskName = 'name';
    
            const restClientMock = new RestClientMockBuilder()
                .withPost(jest.fn(async () => { return {'name': taskName}; }))
                .build(); 
            const activeCollabApi = createActiveCollabAPI(restClientMock);

            await expect(activeCollabApi.addTask(projectId, taskName)).resolves.toBe();

            expect(restClientMock.post)
                .toBeCalledWith(
                    `/projects/${projectId}/tasks`,
                    {
                        'name': taskName
                    }
                );
        });

        it('throws error when invalid response received', () => {
            expect.assertions(1);
            
            const projectId = 123;
            const taskName = 'name';
    
            const restClientMock = new RestClientMockBuilder()
                .withPost(jest.fn().mockReturnValue(Promise.resolve({})))
                .build();
            const activeCollabApi = createActiveCollabAPI(restClientMock);

            expect(activeCollabApi.addTask(projectId, taskName))
                .rejects
                .toMatchObject(
                    new Error(
                        `Invalid response received trying to POST /projects/${projectId}/tasks: {}`
                    )
                );
        });
    });

    describe('taskIdToName', () => {
        it('requests specified project', async () => {
            expect.assertions(1);
            const projectId = 123;
            const taskId = 0;

            const mockGet = jest.fn().mockReturnValue(Promise.resolve({ 
                'tasks': [{
                    id: taskId,
                    name: 'Test task',
                    project_id: projectId
                }]
            }));

            const restClientMock = new RestClientMockBuilder()
                .withGet(mockGet)
                .build();

            const api = createActiveCollabAPI(restClientMock);

            await api.taskIdToName(projectId, taskId);

            expect(mockGet).toBeCalledWith(`/projects/${projectId}/tasks`);
        });

        it('returns name of task with specified id', async () => {
            expect.assertions(1);
            const projectId = 123;
            const taskId = 3445;
            const expectedName = 'Test task';

            const mockGet = jest.fn().mockReturnValue(Promise.resolve({ 
                'tasks': [{
                    id: taskId,
                    name: expectedName,
                    project_id: projectId
                }]
            }));

            const restClientMock = new RestClientMockBuilder()
                .withGet(mockGet)
                .build();

            const api = createActiveCollabAPI(restClientMock);

            const taskName = await api.taskIdToName(projectId, taskId);

            expect(taskName).toEqual(expectedName);
        });

        it('throws error when no task with specified id exists', async () => {
            expect.assertions(1);

            const taskId = 111;
            const projectId = 123;

            const restClientMock = new RestClientMockBuilder()
                .withGet(jest.fn().mockReturnValue(Promise.resolve({'tasks': []})))
                .build();

            const api = createActiveCollabAPI(restClientMock);

            await expect(api.taskIdToName(projectId, taskId))
                .rejects.toMatchObject(new Error(`Could not find task ID ${taskId} in project ${projectId}`));
        });

        it('throws error on invalid response', async () => {
            expect.assertions(1);

            const restClientMock = new RestClientMockBuilder()
                .withGet(jest.fn().mockReturnValue(Promise.resolve({})))
                .build();

            const api = createActiveCollabAPI(restClientMock);

            await expect(api.taskIdToName(1, 1))
                .rejects.toMatchObject(new Error('Invalid response received trying to GET /projects/1/tasks: {}'));
        });
    });

    describe('getTaskListNameById', () => {
        it('requests specified project', async () => {
            expect.assertions(1);
            const projectId = 123;
            const taskListId = 1;

            const mockGet = jest.fn().mockReturnValue(Promise.resolve([{
                id: taskListId,
                name: 'Test task list',
                project_id: projectId
            }]));

            const restClientMock = new RestClientMockBuilder()
                .withGet(mockGet)
                .build();

            const api = createActiveCollabAPI(restClientMock);

            await api.getTaskListNameById(projectId, taskListId);

            expect(mockGet).toBeCalledWith(`/projects/${projectId}/task-lists`);
        });

        it('returns name of task list with specified id', async () => {
            expect.assertions(1);
            const projectId = 123;
            const taskListId = 3445;
            const expectedName = 'Test task';

            const mockGet = jest.fn().mockReturnValue(Promise.resolve([{
                id: taskListId,
                name: expectedName,
                project_id: projectId
            }]));

            const restClientMock = new RestClientMockBuilder()
                .withGet(mockGet)
                .build();

            const api = createActiveCollabAPI(restClientMock);

            const taskName = await api.getTaskListNameById(projectId, taskListId);

            expect(taskName).toEqual(expectedName);
        });

        it('throws error when no task list with specified id exists', async () => {
            expect.assertions(1);

            const taskListId = 111;
            const projectId = 123;

            const restClientMock = new RestClientMockBuilder()
                .withGet(jest.fn().mockReturnValue(Promise.resolve([])))
                .build();

            const api = createActiveCollabAPI(restClientMock);

            await expect(api.getTaskListNameById(projectId, taskListId))
                .rejects.toMatchObject(new Error(`Could not find task list ID ${taskListId} in project ${projectId}`));
        });

        it('throws error on invalid response', async () => {
            expect.assertions(1);

            const restClientMock = new RestClientMockBuilder()
                .withGet(jest.fn().mockReturnValue(Promise.resolve({})))
                .build();

            const api = createActiveCollabAPI(restClientMock);

            await expect(api.getTaskListNameById(1, 1))
                .rejects.toMatchObject(new Error('Invalid response received trying to GET /projects/1/tasks-lists: {}'));
        });
    });

    describe('getProjectById', () => {
        it('requests list of projects', async () => {
            expect.assertions(1);

            const mockGet = jest.fn().mockReturnValue([{
                id: 1,
                name: 'Test project'
            }]);

            const restClientMock = new RestClientMockBuilder()
                .withGet(mockGet)
                .build();

            const api = createActiveCollabAPI(restClientMock);

            await api.getProjectById(1);

            expect(mockGet).toBeCalledWith(`/projects`);
        });

        it('throws error if data from API is invalid', async () => {
            expect.assertions(1);

            const restClientMock = new RestClientMockBuilder()
                .withGet(jest.fn().mockReturnValue(Promise.resolve({})))
                .build();

            const api = createActiveCollabAPI(restClientMock);
            const expectedError =
                new Error('Invalid response received trying to get projects: {}');

            await expect(api.getProjectById(1))
                .rejects.toMatchObject(expectedError);
        });

        it('throws error if no project with the specified ID exists', async () => {
            expect.assertions(1);

            const mockGet = jest.fn().mockReturnValue([{
                id: 1,
                name: 'Test project'
            }]);

            const restClientMock = new RestClientMockBuilder()
                .withGet(mockGet)
                .build();

            const api = createActiveCollabAPI(restClientMock);
            const expectedError = new Error('Could not find project with ID: 2');

            await expect(api.getProjectById(2))
                .rejects.toMatchObject(expectedError);
        });

        it('returns project matching specified id', async () => {
            expect.assertions(1);

            const expectedId = 10;
            const expected = {
                id: expectedId,
                name: 'Test project'
            };

            const restClientMock = new RestClientMockBuilder()
                .withGet(jest.fn().mockReturnValue([expected]))
                .build();

            const api = createActiveCollabAPI(restClientMock);

            const actual = await api.getProjectById(expectedId);
            expect(actual).toMatchObject(expected);
        });
    });

    describe('getAllProjects', () => {
        it('requests list of projects', async () => {
            expect.assertions(2);

            const projectToGet = [{
                id: 1,
                name: 'Test project'
            }];

            const restClientMock = new RestClientMockBuilder()
                .withGet(jest.fn().mockReturnValue(projectToGet))
                .build();

            const api = createActiveCollabAPI(restClientMock);

            expect(await api.getAllProjects()).toEqual(projectToGet);
            expect(restClientMock.get).toBeCalledWith(`/projects`);
        });

        it('throws error if data from API is invalid', async () => {
            expect.assertions(1);

            const restClientMock = new RestClientMockBuilder()
                .withGet(jest.fn().mockReturnValue(Promise.resolve({})))
                .build();

            const api = createActiveCollabAPI(restClientMock);
            const expectedError =
                new Error('Invalid response received trying to get projects: {}');

            await expect(api.getAllProjects())
                .rejects.toMatchObject(expectedError);
        });
    });

    describe('getAssignmentTasksByUserId', () => {
        it('requests AssignmentFilter report', async () => {
            expect.assertions(1);

            const restClientMock = new RestClientMockBuilder()
                .withGet(jest.fn().mockReturnValue(getEmptyReport()))
                .build();

            const api = createActiveCollabAPI(restClientMock);

            await api.getAssignmentTasksByUserId(1);

            const expectedQuery: QueryParams = {
                type: 'AssignmentFilter',
                include_subtasks: false
            };

            expect(restClientMock.get).toBeCalledWith('/reports/run', expectedQuery);
        });

        it('throws error if response invalid', async () => {
            expect.assertions(1);

            const restClientMock = new RestClientMockBuilder()
                .withGet(jest.fn().mockReturnValue({}))
                .build();

            const api = createActiveCollabAPI(restClientMock);

            const expectedError = new Error('Invalid response trying to get tasks: {}');
            await expect(api.getAssignmentTasksByUserId(1)).rejects.toMatchObject(expectedError);
        });

        it('returns only tasks from api where user ID matches', async () => {
            expect.assertions(2);

            const userId = 1;

            const testTask = {
                id: 2,
                type: 'Task',
                project_id: 20,
                name: 'Test task',
                assignee_id: userId
            };

            const testTaskWithWrongUser = {
                id: 2,
                type: 'Task',
                project_id: 20,
                name: 'Test task',
                assignee_id: 2
            };

            const mockGet = jest.fn().mockReturnValue({
                all: {
                    label: 'All Assignments',
                    assignments: {
                        1: {
                            id: 1,
                            type: 'Note',
                            project_id: 20,
                            name: 'this is not a task'
                        },
                        2: testTask,
                        3: testTaskWithWrongUser
                    }
                }
            });

            const restClientMock = new RestClientMockBuilder()
                .withGet(mockGet)
                .build();

            const api = createActiveCollabAPI(restClientMock);

            const tasks = await api.getAssignmentTasksByUserId(userId);

            expect(tasks).toContain(testTask);
            expect(tasks).toHaveLength(1);
        });
    });

    describe('getAllAssignmentTasks', () => {
        it('requests AssignmentFilter report', async () => {
            expect.assertions(1);

            const restClientMock = new RestClientMockBuilder()
                .withGet(jest.fn().mockReturnValue(getEmptyReport()))
                .build();

            const api = createActiveCollabAPI(restClientMock);

            await api.getAllAssignmentTasks();

            const expectedQuery: QueryParams = {
                type: 'AssignmentFilter',
                include_subtasks: false
            };

            expect(restClientMock.get).toBeCalledWith('/reports/run', expectedQuery);
        });

        it('throws error if response invalid', async () => {
            expect.assertions(1);

            const restClientMock = new RestClientMockBuilder()
                .withGet(jest.fn().mockReturnValue({}))
                .build();

            const api = createActiveCollabAPI(restClientMock);

            const expectedError = new Error('Invalid response trying to get report: {}');
            await expect(api.getAllAssignmentTasks()).rejects.toMatchObject(expectedError);
        });

        it('returns only tasks from api', async () => {
            expect.assertions(2);

            const testTask = {
                id: 2,
                type: 'Task',
                project_id: 20,
                name: 'Test task'
            };

            const mockGet = jest.fn().mockReturnValue({
                all: {
                    label: 'All Assignments',
                    assignments: {
                        1: {
                            id: 1,
                            type: 'Note',
                            project_id: 20,
                            name: 'this is not a task'
                        },
                        2: testTask
                    }
                }
            });

            const restClientMock = new RestClientMockBuilder()
                .withGet(mockGet)
                .build();

            const api = createActiveCollabAPI(restClientMock);

            const tasks = await api.getAllAssignmentTasks();

            expect(tasks).toContain(testTask);
            expect(tasks).toHaveLength(1);
        });
    });

    describe('findProjectForTask', () => {
        it('finds id of project containing the specified task', async () => {
            expect.assertions(1);

            const taskId = 2;
            const expectedProjectId = 22;
            const mockGet = jest.fn().mockReturnValue({
                all: {
                    label: 'All Assignments',
                    assignments: {
                        [taskId]: {
                            id: taskId,
                            type: 'Task',
                            project_id: expectedProjectId,
                            name: 'test task'
                        }
                    }
                }
            });

            const restClientMock = new RestClientMockBuilder()
                .withGet(mockGet)
                .build();

            const api = createActiveCollabAPI(restClientMock);

            const projectId = await api.findProjectForTask(taskId);

            expect(projectId).toEqual(some(expectedProjectId));
        });

        it('returns none for non-existant task', async () => {
            expect.assertions(1);

            const restClientMock = new RestClientMockBuilder()
                .withGet(jest.fn().mockReturnValue(getEmptyReport()))
                .build();

            const api = createActiveCollabAPI(restClientMock);

            const projectId = await api.findProjectForTask(0);

            expect(projectId).toEqual(none);
        });
    });
});