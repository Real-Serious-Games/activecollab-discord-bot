import { Event } from './event';

export interface Project extends Event {
    payload: {
        class: string,
        name: string,
        created_by_id: number,
        company_id: number,
        [key: string]: any;
    };
}