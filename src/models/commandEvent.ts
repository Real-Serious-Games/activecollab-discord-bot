/**
 * Interface for Command events
 */
export interface CommandEvent {
    command: string;
    addressType: string;
    address: string;
    parameters: string[];
}
