import { Payload } from './payload';

// TODO: ensure this interface matches all events coming in

export interface Event {
    payload: Payload;
    timestamp: number;
    type: string;
}
