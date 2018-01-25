import { Payload } from './payload';

export interface TaskList extends Payload {
    id: number;
    name: string;
    [key: string]: any;
}
