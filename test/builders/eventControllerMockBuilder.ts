import { right } from 'fp-ts/lib/Either';

import { IEventController } from '../../src/controllers/event';

export class EventControllerMockBuilder {

    private processEvent = 
        jest.fn().mockReturnValue(right({ projectId: 1, body: { }}));

    public withProcessEvent(mock: jest.Mock) {
        this.processEvent = mock;
        return this;
    }

    public build(): IEventController {
        return {
            processEvent: this.processEvent
        };
    }
}