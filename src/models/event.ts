// TODO: ensure this interface matches all events coming in

export interface Event {
    payload: {
        class: string
    };
    timestamp: number;
    type: string;
}
