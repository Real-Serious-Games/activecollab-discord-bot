import { Task } from '../models/taskEvent';
import { Comment } from '../models/comment';
import { Event } from '../models/event';
import { Project } from '../models/project';
import { Payload } from '../models/payload';
import { assert } from 'console';
import { Either, left, right } from 'fp-ts/lib/Either';

export function processEvent(event: Event<Payload>): Either<string, string> {
    if (!event || !event.payload || !event.payload.class) {
        return left(`Received invalid event: ${event}`);
    }

    switch (event.payload.class) {
        case 'Task': {
            const task: Task = <Task>event.payload;
            switch (event.type) {
                case 'TaskCreated':
                    return right(processNewTask(task));

                case 'TaskUpdated':
                    return right(processUpdatedTask(task));

                default:
                    return left(
                        'Received Task event with unknown payload type ' +
                        event.type
                    );
            }
        }
        case 'Comment': {
            const comment: Comment = <Comment>event.payload;
            switch (event.type) {
                case 'CommentCreated':
                    return right(processNewComment(comment));

                default:
                    return left(
                        'Received Comment Event with unknown payload type: ' +
                        event.type
                    );
            }
        }
        case 'Project': {
            const project: Project = <Project>event.payload;
            switch (event.type) {
                case 'ProjectCreated':
                    return right(processNewProjct(project));

                default:
                    return left(
                        'Received Project Event with unknown payload type: ' +
                        event.type
                    );
            }
        }
        default:
            return left(`Received Event of unknown type ${event.payload.class}`);
    }
}

function processNewTask(task: Task): string {
    return  'A new task has been created.\n' +
            `Task Name: ${task.name}\n` +
            `Project Name: ${task.project_id}`;
}

function processUpdatedTask(task: Task): string {
    return  'A task has been updated.\n' +
            `Task Name: ${task.name}\n` +
            `Project Name: ${task.project_id}`;
}

function processNewComment(comment: Comment): string {
    return  '*A new comment has been added.*\n' +
            `**Comment:** \`${comment.body}\`\n` +
            `**${comment.parent_type}:** ${comment.parent_id}\n` +
            `**Author:** ${comment.created_by_id}\n`;
}

function processNewProjct(project: Project): string {
    return  '*A new project has been created.*\n' +
            `**Project:** \`${project.name}\`\n` +
            `**Company:** ${project.company_id}\n` +
            `**Author:** ${project.created_by_id}\n`;
}
