import { IActiveCollabRestClient } from './activecollab-rest';
import { Task } from '../models/taskEvent';
import { Project } from '../models/project';
import { Report, Assignment } from '../models/report';
import * as _ from 'lodash';

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

/**
 * Get all tasks across all projects
 */
async function getAllTasksLazy(
    restClient: IActiveCollabRestClient
): Promise<_.LoDashImplicitWrapper<Assignment[]>> {
    const res = await restClient.get('/reports/run', {
        type: 'AssignmentFilter',
        include_subtasks: false
    }) as Report;

    if (!res.all || !res.all.assignments) {
        throw new Error('Invalid response trying to get report');
    }

    return _(res.all.assignments)
        .values()
        .filter(a => a.type === 'Task');
}

export interface IActiveCollabAPI {
    /**
     * Get the name of a specified task from its ID and project ID.
     */
    taskIdToName: (projectId: number, taskId: number) => Promise<string>;

    /**
     * Get a specified project from its ID.
     */
    getProjectById: (projectId: number) => Promise<Project>;

    /**
     * Get all tasks across all projects
     */
    getAllTasks: () => Promise<Assignment[]>;
}

export function createActiveCollabAPI(restClient: IActiveCollabRestClient): IActiveCollabAPI {
    return {
        taskIdToName: (p, t) => taskIdToName(restClient, p, t),
        getProjectById: p => getProjectById(restClient, p),
        getAllTasks: () => getAllTasksLazy(restClient).then(a => a.value()),
    };
}