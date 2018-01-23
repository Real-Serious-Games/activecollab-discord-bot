import { assert } from 'console';
import { RichEmbed } from 'discord.js';

import { Task } from '../models/taskEvent';
import { Comment } from '../models/comment';
import { Event } from '../models/event';
import { Project } from '../models/project';
import { Payload } from '../models/payload';
import { Either, left, right } from 'fp-ts/lib/Either';
import { IActiveCollabAPI } from '../controllers/activecollab-api';
import { IMappingController } from '../controllers/mapping';
import { IDiscordController } from '../controllers/discord';
import { map } from 'fp-ts/lib/Option';
import { disconnect } from 'cluster';

export interface IEventController {
    processEvent: (event: Event<Payload>) => 
        Promise<Either<string, IProcessedEvent>>;
}

export interface IProcessedEvent {
    projectId: number;
    body: RichEmbed | string;
}

const eventColor = '#449DF5';

enum TaskType {
    newTask,
    updatedTask
}

class ProcessedEvent implements IProcessedEvent {
    public readonly projectId: number;
    public readonly body: RichEmbed | string;

    public constructor(
        projectId: number,
        body: RichEmbed | string
    ) {
        this.projectId = projectId;
        this.body = body;
    }
}

async function processEvent(
    activeCollabApi: IActiveCollabAPI,
    mappingController: IMappingController,
    discordController: IDiscordController,
    baseUrl: string,
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
                    return processTask(
                            task,
                            TaskType.newTask,
                            mappingController,
                            discordController,
                            baseUrl
                        ).map(p => new ProcessedEvent(task.project_id, p));

                case 'TaskUpdated':
                    return processTask(
                        task,
                        TaskType.updatedTask,
                        mappingController,
                        discordController,
                        baseUrl
                    ).map(p => new ProcessedEvent(task.project_id, p));

                default:
                    return left(
                        `Received Task Event with unknown payload type: ${event.type}`                       
                    );
            }
        }
        case 'Comment': {
            const comment: Comment = <Comment>event.payload;

            if (comment.parent_type !== 'Task') {
                return left(`Received Comment Event with unknown parent type: `
                    + `${comment.parent_type}`);
            }

            switch (event.type) {
                case 'CommentCreated':
                    try {
                        const projectId = 
                            (await activeCollabApi.findProjectForTask(comment.parent_id))
                            .toUndefined();

                        if (projectId !== undefined) {
                            return (await processNewComment(
                                comment,
                                mappingController,
                                discordController,
                                projectId,
                                baseUrl,
                                activeCollabApi
                            )).map(p => new ProcessedEvent(projectId, p));
                        }

                        return left(`Project ID not found for Comment with parent: `
                            + `${comment.parent_id}`);

                    } catch (e) {
                        return left(`Error processing Comment: ${e}`);
                    }

                default:
                    return left(
                        'Received Comment Event with unknown payload type: ' +
                        event.type
                    );
            }
        }
        default:
            return left(`Received Event of unknown type: ${event.payload.class}`);
    }
}

export function createEventController(
    activeCollabApi: IActiveCollabAPI,
    mappingController: IMappingController,
    discordController: IDiscordController,
    baseUrl: string
) {
    return {
        processEvent: (e: Event<Payload>) => processEvent(
            activeCollabApi,
            mappingController,
            discordController, 
            baseUrl,
            e
        )
    };
}

function processTask(
    task: Task,
    taskType: TaskType,
    mappingController: IMappingController,
    discordController: IDiscordController,
    baseUrl: string
): Either<string, RichEmbed> {
    const userId = getUserId(task.assignee_id, mappingController, discordController);

    if (userId.isLeft()) {
        return left('Unable to process Task Event: ' + userId.value); 
    }

    let title = task.name;

    switch (taskType) {
        case TaskType.updatedTask: 
            title = `*Task Updated:* ${task.name}`;
            break;
        case TaskType.newTask:
            title = `*Task Created:* ${task.name}`;
            break;
    }

    const embed =  new RichEmbed()
        .setTitle(title)
        .setColor(eventColor)
        .setURL(baseUrl + task.url_path)
        .addField(
            'Assignee',
            userId.value ? `<@${userId.value}>` : 'Not Assigned',
            true
        )
        .addField(
            'Status', 
            `${task.is_completed ? 'Completed' : 'In Progress'}`,
            true
        );

    return right(embed);
}

async function processNewComment(
    comment: Comment,
    mappingController: IMappingController,
    discordController: IDiscordController,
    projectId: number,
    baseUrl: string,
    activeCollabApi: IActiveCollabAPI
): Promise<Either<string, RichEmbed>> {
    const userId = getUserId(
        comment.created_by_id, 
        mappingController, 
        discordController
    );

    if (userId.isLeft()) {
        return left(`Unable to process Comment Event: ${userId.value}`); 
    }

    try {
        const taskName = await activeCollabApi.taskIdToName(projectId, comment.parent_id);
    
        const embed =  new RichEmbed()
            .setTitle(`*Comment Added to Task:* ${taskName}`)
            .setDescription(comment.body)
            .setColor(eventColor)
            .setURL(baseUrl + comment.url_path)
            .addField(
                'Author',
                `<@${userId.value}>`,
                true
            );

        return right(embed);
    } catch (e) {
        return left(`Unable to process Comment Event: ${e}`);
    }    
}

function getUserId(
    assigneeId: number,
    mappingController: IMappingController,
    discordController: IDiscordController
): Either<string, string> {
    if (assigneeId) {
        try {
            return right(discordController
                .getUserId(mappingController.getDiscordUser(assigneeId)));
        } catch (e) {
            return left(e);
        }
    }

    return right('');
}
