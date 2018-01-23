import { Payload } from './payload';

export interface Comment extends Payload {
    parent_type: string;
    parent_id: number;
    body: string;
    created_by_id: number;
    url_path: string;
    [key: string]: any;
}