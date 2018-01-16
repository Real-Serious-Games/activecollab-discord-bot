import { Event } from './event';

export interface Project extends Event {
    payload: {
        id: number,
        class: string,
        url_path: string,
        name: string,
        created_on: number,
        created_by_id: number,
        members: Array<number>,
        company_id: number,
        [key: string]: any;
    };
}