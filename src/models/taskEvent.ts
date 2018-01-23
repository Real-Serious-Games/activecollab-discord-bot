import { Payload } from './payload';

// TODO: figure out what properties we care about and remove the rest
import { Event } from './event';

export interface Task extends Payload {
    id: number;
    name: string;
    project_id: number;
    assignee_id: number;
    is_completed: boolean;
    url_path: string;
    [key: string]: any;
}
