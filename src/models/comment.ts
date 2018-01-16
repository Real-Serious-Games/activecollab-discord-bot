import { Payload } from './payload';

export interface Comment extends Payload {
    class: string;
    parent_type: string;
    parent_id: number;
    body: string;
    [key: string]: any;
}