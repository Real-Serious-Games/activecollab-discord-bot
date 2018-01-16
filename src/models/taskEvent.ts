import { Payload } from './payload';

// TODO: figure out what properties we care about and remove the rest

export interface Task extends Payload {
    id: number;
    name: string;
    project_id: number;
}
