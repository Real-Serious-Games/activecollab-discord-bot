import { Payload } from './payload';

// TODO: figure out what properties we care about and remove the rest

export interface Task extends Payload {
    id: number;
    class: string;
    url_path: string;
    name: string;
    assignee_id: number;
    delegated_by_id: number;
    completed_on?: number;
    completed_by_id?: number;
    is_completed: boolean;
    labels: Array<string>;
    is_trashed: boolean;
    trashed_on?: number;
    trashed_by_id: number;
    project_id: number;
    is_hidden_from_clients: boolean;
    body: string;
    body_formatted: string;
    created_on: number;
    created_by_id: number;
    updated_on: number;
    updated_by_id: number;
    task_number: number;
    task_list_id: number;
    position: number;
    is_important: boolean;
    estimate: number;
    job_type_id: number;
}
