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
    project_id: number;
    name: string;
    assignee_id: number;
    permalink: string;
    due_on: number;
    task_list_id: number;
}