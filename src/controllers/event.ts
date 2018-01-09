'use strict';

import { Task } from '../models/taskPayload';

export function processEvent(event: any) : string {
    switch(event.payload.class) {
        case ('Task') : {
            let taskPayload : Task = event;
            switch(taskPayload.type) {
                case ('TaskCreated') : {
                    return processNewTask(taskPayload);
                }
                case ('TaskUpdated') : {
                    return processUpdatedTask(taskPayload);
                }
            }
        }
    }
}

export function processNewTask(task: Task) : string {
    return  'A new task has been created.\n' +
            `Task Name: ${task.payload.name}\n` +
            `Project Name: ${task.payload.project_id}`;
}

export function processUpdatedTask(task: Task) : string {
    return  'A task has been updated.\n' +
            `Task Name: ${task.payload.name}\n` +
            `Project Name: ${task.payload.project_id}`;
}
