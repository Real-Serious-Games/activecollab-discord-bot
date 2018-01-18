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
}