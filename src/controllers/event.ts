import { assert } from 'console';
import { RichEmbed } from 'discord.js';
import { map } from 'fp-ts/lib/Option';
import { disconnect } from 'cluster';
import { Either, left, right } from 'fp-ts/lib/Either';

import { Task } from '../models/taskEvent';
import { Comment } from '../models/comment';
import { Event } from '../models/event';
import { Project } from '../models/project';
import { Payload } from '../models/payload';
import { IActiveCollabAPI } from '../controllers/activecollab-api';
import { IMappingController } from '../controllers/mapping';
import { IDiscordController } from '../controllers/discord';

export interface IEventController {
    processEvent: (event: Event<Payload>) => 
    Promise<Either<string, IProcessedEvent>>;
}

export interface IProcessedEvent {
    projectId: number;
    body: RichEmbed;
}

const eventColor = '#449DF5';

enum TaskType {
    TaskCreated,
    TaskUpdated,
    TaskCompleted,
    TaskListChanged
}

class ProcessedEvent implements IProcessedEvent {
    public readonly projectId: number;
    public readonly body: RichEmbed;
    
    public constructor(
        projectId: number,
        body: RichEmbed
    ) {
        this.projectId = projectId;
        this.body = body;
    }
}

export function createEventController(
    activeCollabApi: IActiveCollabAPI,
    mappingController: IMappingController,
    discordController: IDiscordController,
    baseUrl: string
) {
    async function processEvent(
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
                        return (await processTask(
                            task,
                            TaskType.TaskCreated,
                            baseUrl
                        )).map(p => new ProcessedEvent(task.project_id, p));
                    
                    case 'TaskUpdated':
                        return (await processTask(
                            task,
                            TaskType.TaskUpdated,
                            baseUrl
                        )).map(p => new ProcessedEvent(task.project_id, p));

                    case 'TaskCompleted':
                        return (await processTask(
                            task,
                            TaskType.TaskCompleted,
                            baseUrl
                        )).map(p => new ProcessedEvent(task.project_id, p));

                    case 'TaskListChanged':
                        return (await processTask(
                            task,
                            TaskType.TaskListChanged,
                            baseUrl
                        )).map(p => new ProcessedEvent(task.project_id, p));
                        
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
                                projectId,
                                baseUrl,
                            )).map(p => new ProcessedEvent(projectId, p));
                        }
                        
                        return left(`Project ID not found for Comment with parent: `
                            + `${comment.parent_id}`);
                        
                    } catch (e) {
                        return left(`Error processing Comment: ${e}`);
                    }
                    
                    default:
                    return left(
                        'Received Comment Event with unknown payload type: ' 
                            + event.type
                    );
                }
            }
            default:
            return left(`Received Event of unknown type: ${event.payload.class}`);
        }
    }
    
    async function processTask(
        task: Task,
        taskType: TaskType,
        baseUrl: string
    ): Promise<Either<string, RichEmbed>> {
        // An assignee ID of 0 means that no one has been assigned to the task
        const assigneeValue = task.assignee_id === 0 
            ? right('Not Assigned')
            : getUserId(task.assignee_id).map(id => `<@${id}>`);

        if (assigneeValue.isLeft()) {
            return left('Unable to process Task Event: ' + assigneeValue.value); 
        }

        let status: string;

        try {
            status = await activeCollabApi.getTaskListNameById(
                task.project_id, task.task_list_id
            );
        } catch (e) {
            return left('Unable to process Task Event: ' + e); 
        }
        
        let title = task.name;
        
        switch (taskType) {
            case TaskType.TaskCreated:
                title = `*Task Created:* ${task.name}`;
                break;

            case TaskType.TaskCompleted: 
                title = `*Task Completed:* ${task.name}`;
                break;

            case TaskType.TaskUpdated: 
            case TaskType.TaskListChanged: 
                title = `*Task Updated:* ${task.name}`;
                break;
        }
        
        const embed =  new RichEmbed()
            .setTitle(title)
            .setColor(eventColor)
            .setURL(baseUrl + task.url_path)
            .addField(
                'Assignee',
                assigneeValue.value,
                true
            )
            .addField(
                'Status', 
                status,
                true
            );
        
        return right(embed);
    }
    
    async function processNewComment(
        comment: Comment,
        projectId: number,
        baseUrl: string
    ): Promise<Either<string, RichEmbed>> {
        const userId = getUserId(comment.created_by_id);
        
        if (userId.isLeft()) {
            return left(`Unable to process Comment Event: ${userId.value}`); 
        }

        // When comments on more than just tasks are supported add switch to 
        // determine correct parent URL from parent type
        const url = `${baseUrl}/projects/${projectId}/tasks/${comment.parent_id}`;
        
        try {
            const taskName = await activeCollabApi.taskIdToName(projectId, comment.parent_id);
            
            const embed =  new RichEmbed()
                .setTitle(`*Comment Added to Task:* ${taskName}`)
                .setDescription(comment.body)
                .setColor(eventColor)
                .setURL(url)
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
    ): Either<string, string> {
        assert(assigneeId != undefined);

        try {
            return right(
                discordController.getUserId(
                    mappingController.getDiscordUser(assigneeId)
                )
            );
        } catch (e) {
            return left(e);
        }
    }
        
    return { processEvent: processEvent };
}
    