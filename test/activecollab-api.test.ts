import { createActiveCollabAPI } from '../src/controllers/activecollab-api';
import { IActiveCollabRestClient } from '../src/controllers/activecollab-rest';

describe('ActiveCollab API', () => {
    describe('taskIdToName', () => {
        it('requests specified project', async () => {
            expect.assertions(1);
            const projectId = 123;
            const taskId = 0;

            const mockGet = jest.fn();
            mockGet.mockReturnValue(Promise.resolve([{
                id: taskId,
                name: 'Test task',
                project_id: projectId
            }]));

            const api = createActiveCollabAPI(setupMockRestClient(mockGet));

            await api.taskIdToName(projectId, taskId);

            expect(mockGet).toBeCalledWith(`/projects/${projectId}/tasks`);
        });

        it('returns name of task with specified id', async () => {
            expect.assertions(1);
            const projectId = 123;
            const taskId = 3445;
            const expectedName = 'Test task';

            const mockGet = jest.fn();
            mockGet.mockReturnValue(Promise.resolve([{
                id: taskId,
                name: expectedName,
                project_id: projectId
            }]));

            const api = createActiveCollabAPI(setupMockRestClient(mockGet));

            const taskName = await api.taskIdToName(projectId, taskId);

            expect(taskName).toEqual(expectedName);
        });

        it('throws error when no task with specified id exists', async () => {
            expect.assertions(1);

            const taskId = 111;
            const projectId = 123;

            const mockGet = jest.fn();
            mockGet.mockReturnValue(Promise.resolve([]));

            const api = createActiveCollabAPI(setupMockRestClient(mockGet));

            await expect(api.taskIdToName(projectId, taskId))
                .rejects.toMatchObject(new Error(`Could not find task ID ${taskId} in project ${projectId}`));
        });

        it('throws error on invalid response', async () => {
            expect.assertions(1);

            const mockGet = jest.fn();
            mockGet.mockReturnValue(Promise.resolve({}));

            const api = createActiveCollabAPI(setupMockRestClient(mockGet));

            await expect(api.taskIdToName(1, 1))
                .rejects.toMatchObject(new Error('Invalid response received trying to GET /projects/1/tasks.'));
        });
    });

    describe('getProjectById', () => {
        it('requests list of projects', async () => {
            expect.assertions(1);

            const mockGet = jest.fn().mockReturnValue([{
                id: 1,
                name: 'Test project'
            }]);

            const api = createActiveCollabAPI(setupMockRestClient(mockGet));

            await api.getProjectById(1);

            expect(mockGet).toBeCalledWith(`/projects`);
        });

        it('throws error if data from API is invalid', async () => {
            expect.assertions(1);

            const mockGet = jest.fn().mockReturnValue(Promise.resolve({}));

            const api = createActiveCollabAPI(setupMockRestClient(mockGet));
            const expectedError =
                new Error('Invalid response received trying to get projects');

            await expect(api.getProjectById(1))
                .rejects.toMatchObject(expectedError);
        });

        it('returns project matching specified id', async () => {
            expect.assertions(1);

            const expectedId = 10;
            const expected = {
                id: expectedId,
                name: 'Test project'
            };
            const mockGet = jest.fn().mockReturnValue([expected]);

            const api = createActiveCollabAPI(setupMockRestClient(mockGet));

            const actual = await api.getProjectById(expectedId);
            expect(actual).toMatchObject(expected);
        });

        it('throws error if no project with specified ID exists', async () => {
            expect.assertions(1);

            const mockGet = jest.fn().mockReturnValue([]);

            const api = createActiveCollabAPI(setupMockRestClient(mockGet));

            const testId = 22;
            const expectedError = new Error(`Could not find project with ID ${testId}`);

            await expect(api.getProjectById(testId))
                .rejects.toMatchObject(expectedError);
        });
    });

    /**
     * Set up a mock IActiveCollabRestClient
     */
    function setupMockRestClient(mockGet): IActiveCollabRestClient {
        return {
            get: <(url: string) => Promise<Object>> mockGet,
            post: undefined
        };
    }
});