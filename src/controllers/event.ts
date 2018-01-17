import { Task } from '../models/taskEvent';
import { Comment } from '../models/comment';
import { Event } from '../models/event';
import { Project } from '../models/project';
import { Payload } from '../models/payload';
import { assert } from 'console';
import { Either, left, right } from 'fp-ts/lib/Either';
import { IActiveCollabAPI } from '../controllers/activecollab-api';

export interface IEventController {
    processEvent: (event: Event<Payload>) => Promise<Either<string, IProcessedEvent>>;
}

export interface IProcessedEvent {
    projectId: number;
    body: string;
}

class ProcessedEvent implements IProcessedEvent {
    public readonly projectId: number;
    public readonly body: string;

    public constructor(
        projectId: number,
        body: string
    ) {
        this.projectId = projectId;
        this.body = body;
    }
}

async function processEvent(
    activeCollabApi: IActiveCollabAPI,
    event: Event<Payload>
): Promise<Either<string, IProcessedEvent>> {
    if (!event || !event.payload) {
        return left(`Received invalid event: ${JSON.stringify(event, undefined, 2)}`);
    }

    switch (event.payload.class) {
        case 'Task': {
            const task: Task = <Task>event.payload;
            switch (event.type) {
                case 'TaskCreated':
                    return right(
                        new ProcessedEvent(task.project_id, processNewTask(task))
                    );

                case 'TaskUpdated':
                    return right(
                        new ProcessedEvent(task.project_id, processUpdatedTask(task))
                    );

                default:
                    return left(
                        `Received Task Event with unknown payload type: ${event.type}`                       
                    );
            }
        }
        case 'Comment': {
            const comment: Comment = <Comment>event.payload;
            switch (event.type) {
                case 'CommentCreated':
                    try {
                        const projectId = await activeCollabApi.getProjectIdForComment(comment);
                       
                        return right(
                            new ProcessedEvent(
                                projectId,
                                processNewComment(comment))
                            ); 
                    } catch (e) {
                        return left(`Error processing comment: ${e}`);
                    }

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
                    return right(new ProcessedEvent(project.id, processNewProject(project)));

                default:
                    return left(
                        `Received Project Event with unknown payload type: ${event.type}`
                    );
            }
        }
        default:
            return left(`Received Event of unknown type: ${event.payload.class}`);
    }
}

export function createEventController(
    activeCollabApi: IActiveCollabAPI
) {
    return {
        processEvent: processEvent.bind(undefined, activeCollabApi)
    };
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

function processNewProject(project: Project): string {
    return  '*A new project has been created.*\n' +
            `**Project:** \`${project.name}\`\n` +
            `**Company:** ${project.company_id}\n` +
            `**Author:** ${project.created_by_id}\n`;
}
