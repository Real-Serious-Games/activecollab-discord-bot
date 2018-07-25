import { Payload } from './payload';

export interface Report {
    [id: string]: ReportData;
}

export interface ReportData {
    label: string;
    assignments: {
        [id: number]: Assignment
    };
}

export interface Assignment {
    id: number;
    type: string;

    name: string;
    task_number: number;
    due_on: number;
    completed_on?: number;
    task_list: string;

    client_name: string;

    project: string;
    project_id: number;

    assignee: string;
    assignee_id: number;
    position: number;

    permalink: string;

    tracked_time: number;
}
