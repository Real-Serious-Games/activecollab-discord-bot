import { Report, Assignment, ReportData } from '../models/report';
import * as _ from 'lodash';
import { Option, some, none } from 'fp-ts/lib/Option';

import { TaskList } from '../models/taskList';
import { IActiveCollabRestClient } from './activecollab-rest';
import { Task } from '../models/taskEvent';
import { Project } from '../models/project';
import * as ProjectTasks from '../models/projectTasks';

interface TaskResponse {
    tasks: Array<Task>;
}

interface CreateTaskResponse {
    single: {
        name: string;
    };
}

export interface IActiveCollabAPI {
    /**
     * Get the name of a specified task from its ID and project ID.
     */
    taskIdToName: (projectId: number, taskId: number) => Promise<string>;

    /**
     * Get the name of a specified task list from it's ID and project ID.
     */
    getTaskListNameById: (projectId: number, taskId: number) => Promise<string>;

    /**
     * Get a specified project from its ID.
     */
    getProjectById: (projectId: number) => Promise<Project>;

    /**
     * Get tasks by user ID.
     */
    getAssignmentTasksByUserId: (userId: number) => Promise<Assignment[]>;

    /**
     * Get all tasks across all projects
     */
    getAllAssignmentTasks: () => Promise<Assignment[]>;

    /**
     * Get all projects
     */
    getAllProjects: () => Promise<Project[]>;

    /**
     * Get the id of the project the specified task belongs to.
     */
    findProjectForTask: (taskId: number) => Promise<Option<number>>;

    /**
     * Add a task to a project.
     */
    createTask: (projectId: number, name: string) => Promise<void>;

    getAssignmentTasksByProject: (project: string) => Promise<ProjectTasks.Task[]>;
}

/**
 * Add task with name to project with ID
 */
async function createTask(
    restClient: IActiveCollabRestClient,
    projectId: number,
    name: string
): Promise<void> {
    const url = `/projects/${projectId}/tasks`;

    const response = await restClient
        .post(url, { 'name': name }) as CreateTaskResponse;

    if (!response.single || !response.single.name) {
        throw new Error(`Invalid response received trying to POST ${url}: `
            + JSON.stringify(response, undefined, 4));
    }
}

/**
 * Get the name of a specified task from its ID and project ID.
 */
async function taskIdToName(
    restClient: IActiveCollabRestClient,
    projectId: number,
    taskId: number
): Promise<string> {
    const url = `/projects/${projectId}/tasks`;
    const response = await restClient.get(url) as TaskResponse;

    if (!response.tasks || !Array.isArray(response.tasks)) {
        throw new Error(`Invalid response received trying to GET ${url}: `
            + JSON.stringify(response, undefined, 4));
    }

    const tasks = response.tasks;
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        return task.name;
    }

    throw new Error(`Could not find task ID ${taskId} in project ${projectId}`);
}

/**
 * Get task name from ID.
 */
async function getTaskListNameById(
    restClient: IActiveCollabRestClient,
    projectId: number,
    taskListId: number
): Promise<string> {
    const response = await restClient.get(`/projects/${projectId}/task-lists`);

    if (!Array.isArray(response)) {
        throw new Error('Invalid response received trying to GET /projects/1/tasks-lists: '
            + JSON.stringify(response, undefined, 4));
    }

    const tasksLists = response as TaskList[];
    const taskList = tasksLists.find(t => t.id === taskListId);

    if (taskList) {
        return taskList.name;
    }

    throw new Error(`Could not find task list ID ${taskListId} in project ${projectId}`);
}

/**
 * Get a specified project from its ID.
 */
async function getProjectById(
    restClient: IActiveCollabRestClient,
    id: number
): Promise<Project> {
    const projects = await getAllProjectsLazy(restClient);

    const project = projects.find(p => p.id === id);
    if (project) {
        return project;
    }

    throw new Error(`Could not find project with ID: ${id}`);
}

/**
 * Get tasks from user ID.
 */
async function getAssignmentTasksByUserId(
    restClient: IActiveCollabRestClient,
    id: number
): Promise<Assignment[]> {
    try {
        return (await getAllAssignmentTasksLazy(restClient))
            .filter(a => a.assignee_id === id)
            .value();

    } catch (e) {
        throw new Error('Invalid response trying to get tasks: '
            + JSON.stringify(e, undefined, 4));
    }
}

/**
 * Get all tasks across all projects
 */
async function getAllAssignmentTasksLazy(
    restClient: IActiveCollabRestClient
): Promise<_.LoDashImplicitWrapper<Assignment[]>> {
    const res = await restClient.get('/reports/run', {
        type: 'AssignmentFilter',
        include_subtasks: false
    }) as Report;

    if (!res.all || !res.all.assignments) {
        throw new Error('Invalid response trying to get report: '
            + JSON.stringify(res, undefined, 4));
    }

    return _(res.all.assignments)
        .values()
        .filter(a => a.type === 'Task');
}

/**
 * Get all tasks across all projects
 */
async function getAllProjectsLazy(
    restClient: IActiveCollabRestClient
): Promise<_.LoDashImplicitWrapper<Project[]>> {
    const response = await restClient.get('/projects');

    if (!Array.isArray(response)) {
        throw new Error('Invalid response received trying to get projects: '
            + JSON.stringify(response, undefined, 4));
    }

    return _(response)
        .values();
}

/**
 * Get the id of the project the specified task belongs to.
 */
async function findProjectForTaskId(
    restClient: IActiveCollabRestClient,
    taskId: number
): Promise<Option<number>> {
    const tasks = await getAllAssignmentTasksLazy(restClient);
    const task = tasks.find(t => t.id === taskId);

    return task ? some(task.project_id) : none;
}

/**
 * Get all tasks across all projects
 */
async function getAssignmentTasksByProject(
    projectID: string,
    restClient: IActiveCollabRestClient
): Promise<ProjectTasks.Task[]> {
    const res = await restClient.get('/projects/' + projectID + '/tasks', {
    }) as ProjectTasks.TasksData;

    if (!res.tasks) {
        throw new Error('Invalid response trying to get tasks: '
            + JSON.stringify(res, undefined, 4));
    }

    return res.tasks;
}

export function createActiveCollabAPI(restClient: IActiveCollabRestClient): IActiveCollabAPI {
    return {
        taskIdToName: (projectId, taskId) =>
            taskIdToName(restClient, projectId, taskId),
        getTaskListNameById: (projectId, taskId) =>
            getTaskListNameById(restClient, projectId, taskId),
        getProjectById: projectId =>
            getProjectById(restClient, projectId),
        getAssignmentTasksByUserId: projectId =>
            getAssignmentTasksByUserId(restClient, projectId),
        getAllAssignmentTasks: () =>
            getAllAssignmentTasksLazy(restClient).then(a => a.value()),
        getAllProjects: () =>
            getAllProjectsLazy(restClient).then(a => a.value()),
        findProjectForTask: task =>
            findProjectForTaskId(restClient, task),
        createTask: (projectId, taskName) =>
            createTask(restClient, projectId, taskName),
        getAssignmentTasksByProject: (project: string) =>
            getAssignmentTasksByProject(project, restClient)
    };
}
