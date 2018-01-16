import { Task } from '../models/taskEvent';
import { Comment } from '../models/comment';
import { Event } from '../models/event';
import { Project } from '../models/project';
import { assert } from 'console';
import { Either, left, right } from 'fp-ts/lib/Either';

export function processEvent(event: Event): Either<string, string> {
    if (!event || !event.payload || !event.payload.class) {
        return left(`Received invalid event: ${event}`);
    }

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
                        'Received Task Event with unknown payload type: ' +
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
                        'Received Comment Event with unknown payload type: ' +
                        commentEvent.type
                    );
            }
        }
        case 'Project': {
            const projectEvent: Project = <Project>event;
            switch (projectEvent.type) {
                case 'ProjectCreated':
                    return right(processNewProjct(projectEvent));

                default:
                    return left(
                        'Received Project Event with unknown payload type: ' +
                        projectEvent.type
                    );
            }
        }
        default:
            return left(`Received Event of unknown type ${event.payload.class}`);
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

function processNewComment(comment: Comment): string {
    return  '*A new comment has been added.*\n' +
            `**Comment:** \`${comment.payload.body}\`\n` +
            `**${comment.payload.parent_type}:** ${comment.payload.parent_id}\n` +
            `**Author:** ${comment.payload.created_by_id}\n`;
}

function processNewProjct(project: Project): string {
    return  '*A new project has been created.*\n' +
            `**Project:** \`${project.payload.name}\`\n` +
            `**Company:** ${project.payload.company_id}\n` +
            `**Author:** ${project.payload.created_by_id}\n`;
}
