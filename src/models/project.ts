import { Event } from './event';
import { Payload } from './payload';

export interface Project extends Payload {
    id: number;
    name: string;
    created_by_id: number;
    company_id: number;
    id: number;
    [key: string]: any;
}