'use strict';

import { Task } from '../models/taskEvent';
import { Comment } from '../models/comment';
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
            const taskEvent: Task = <Task>event;
            switch (taskEvent.type) {
                case 'TaskCreated':
                    return right(processNewTask(taskEvent));

                case 'TaskUpdated':
                    return right(processUpdatedTask(taskEvent));

                default:
                    return left(
                        'Received Task event with unknown payload type: ' +
                        taskEvent.type
                    );
            }
        }
        case 'Comment': {
            const commentEvent: Comment = <Comment>event;
            switch (commentEvent.type) {
                case 'CommentCreated':
                    return right(processNewComment(commentEvent));

                default:
                    return left(
                        'Received Comment event with unknown payload type: ' +
                        commentEvent.type
                    );
            }
        }
        default:
            return left(`Received event of unknown type ${event.payload.class}`);
    }
}

function processNewTask(task: Task): string {
    return  'A new task has been created.\n' +
            `Task Name: ${task.payload.name}\n` +
            `Project Name: ${task.payload.project_id}`;
}

function processUpdatedTask(task: Task): string {
    return  'A task has been updated.\n' +
            `Task Name: ${task.payload.name}\n` +
            `Project Name: ${task.payload.project_id}`;
}

function processNewComment(task: Comment): string {
    return  '*A new comment has been added.*\n' +
            `**Comment:** \`${task.payload.body}\`\n` +
            `**${task.payload.parent_type}:** ${task.payload.parent_id}\n` +
            `**Author:** ${task.payload.created_by_id}\n`;
}
