import { Event } from './event';
import { Payload } from './payload';

export interface Project extends Payload {
    class: string;
    name: string;
    created_by_id: number;
    company_id: number;
    [key: string]: any;
}