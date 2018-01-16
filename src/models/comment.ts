import { Event } from './event';

export interface Comment extends Event {
    payload: {
        class: string,
        parent_type: string,
        parent_id: number,
        body: string,
        [key: string]: any;
    };
}