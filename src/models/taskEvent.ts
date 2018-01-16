// TODO: figure out what properties we care about and remove the rest
import { Event } from './event';

export interface Task extends Event  {
    payload: {
        class: string,
        name: string,
        project_id: number,
        [key: string]: any;
    };
}
