import { IActiveCollabRestClient } from './activecollab-rest';
import { Task } from '../models/taskEvent';
import { Project } from '../models/project';

/**
 * Get the name of a specified task from its ID and project ID.
 */
async function taskIdToName(
    restClient: IActiveCollabRestClient,
    projectId: number,
    taskId: number
): Promise<string> {
    const url = `/projects/${projectId}/tasks`;
    const response = await restClient.get(url);

    if (!Array.isArray(response)) {
        throw new Error(`Invalid response received trying to GET ${url}.`);
    }

    const tasks = <Task[]>response;
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        return task.name;
    }

    throw new Error(`Could not find task ID ${taskId} in project ${projectId}`);
}

/**
 * Get a specified project from its ID.
 */
async function getProjectById(
    restClient: IActiveCollabRestClient,
    id: number
): Promise<Project> {
    const response = await restClient.get('/projects');

    if (!Array.isArray(response)) {
        throw new Error('Invalid response received trying to get projects');
    }
    const projects = <Project[]>response;
    const project = projects.find(p => p.id === id);
    if (project) {
        return project;
    }

    throw new Error(`Could not find project with ID ${id}`);
}

export interface IActiveCollabAPI {
    /**
     * Get the name of a specified task from its ID and project ID.
     */
    taskIdToName: (projectId: number, taskId: number) => Promise<string>;

    /**
     * Get the name of a specified project from its ID.
     */
    getProjectById: (projectId: number) => Promise<Project>;
}

export function createActiveCollabAPI(restClient: IActiveCollabRestClient): IActiveCollabAPI {
    return {
        taskIdToName: taskIdToName.bind(undefined, restClient),
        getProjectById: getProjectById.bind(undefined, restClient)
    };
}