import { Payload } from './payload';

// TODO: ensure this interface matches all events coming in

export interface Event<T extends Payload> {
    payload: T;
    timestamp: number;
    type: string;
}
