import { createActiveCollabAPI } from '../src/controllers/activecollab';
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

            expect(mockGet.mock.calls[0][0]).toBe(`/projects/${projectId}/tasks`);
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