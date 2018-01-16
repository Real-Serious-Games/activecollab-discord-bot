import { Payload } from './payload';

export interface Comment extends Payload {
    parent_type: string;
    parent_id: number;
    body: string;
    [key: string]: any;
    created_by_id: number;
}