import { Task } from './taskEvent';

/**
 * Object returned by the ActiveCollab API when requesting /projects/<id>/tasks
 * https://developers.activecollab.com/api-documentation/v1/projects/elements/tasks/tasks.html
 *
 * Will add more properties as necessary.
 */
export interface TaskCollection {
    tasks: Task[];
}