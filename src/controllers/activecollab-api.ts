import { IActiveCollabRestClient } from './activecollab-rest';
import { Task } from '../models/taskEvent';


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

export interface IActiveCollabAPI {
    taskIdToName: (projectId: number, taskId: number) => Promise<string>;
}

export function createActiveCollabAPI(restClient: IActiveCollabRestClient): IActiveCollabAPI {
    return {
        taskIdToName: taskIdToName.bind(undefined, restClient)
    };
}