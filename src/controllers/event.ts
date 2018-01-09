'use strict';

import { Task } from '../models/taskEvent';
import { Event } from '../models/event';
import { assert } from 'console';
import { Either, left, right } from 'fp-ts/lib/Either';

export function processEvent(event: Event): Either<string, string> {
    assert(event.payload, 'Cannot process event with no payload.');
    assert(
        event.payload.class,
        'Cannot process event that does not specify its payload class.'
    );

    switch (event.payload.class) {
        case 'Task': {
            const taskPayload: Task = <Task>event;
            switch (taskPayload.type) {
                case 'TaskCreated':
                    return right(processNewTask(taskPayload));

                case 'TaskUpdated':
                    return right(processUpdatedTask(taskPayload));

                default:
                    return left(
                        'Received Task event with unknown payload type ' +
                        taskPayload.type
                    );
            }
        }
        default:
            return left(`Received event of unknown type ${event.payload.class}`);
    }
}

export function processNewTask(task: Task): string {
    return  'A new task has been created.\n' +
            `Task Name: ${task.payload.name}\n` +
            `Project Name: ${task.payload.project_id}`;
}

export function processUpdatedTask(task: Task): string {
    return  'A task has been updated.\n' +
            `Task Name: ${task.payload.name}\n` +
            `Project Name: ${task.payload.project_id}`;
}
