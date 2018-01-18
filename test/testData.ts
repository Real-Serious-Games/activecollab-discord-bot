// Disable TSLint because these objects should be exactly how the data is
// expected to be returned from the server.
/* tslint:disable */
// import { Event } from '../src/models/event'
import { Task } from '../src/models/taskEvent';
import { Project } from '../src/models/project';
import { Comment } from '../src/models/comment';
import { Event } from '../src/models/event';
import { Report } from '../src/models/report';

export function getRawNewTask(): Event<Task> {
    const payload:Task = {
        "id": 288,
        "class": "Task",
        "url_path": "\/projects\/2\/tasks\/288",
        "name": "Task to test webhook",
        "assignee_id": 18,
        "delegated_by_id": 18,
        "completed_on": null,
        "completed_by_id": null,
        "is_completed": false,
        "comments_count": 0,
        "attachments": [

        ],
        "labels": [

        ],
        "is_trashed": false,
        "trashed_on": null,
        "trashed_by_id": 0,
        "project_id": 2,
        "is_hidden_from_clients": false,
        "body": "",
        "body_formatted": "",
        "created_on": 1515388565,
        "created_by_id": 18,
        "updated_on": 1515388565,
        "updated_by_id": 18,
        "task_number": 33,
        "task_list_id": 3,
        "position": 18,
        "is_important": false,
        "start_on": null,
        "due_on": null,
        "estimate": 0,
        "job_type_id": 0,
        "total_subtasks": 0,
        "completed_subtasks": 0,
        "open_subtasks": 0,
        "created_from_recurring_task_id": 0
    };

    return {
        "payload": payload,
        "timestamp": 1515388565,
        "type": "TaskCreated"
    };
};

export function getRawUpdatedTask(): Event<Task> {
    const payload:Task = {
        "id": 288,
        "class": "Task",
        "url_path": "\/projects\/2\/tasks\/288",
        "name": "Task to test webhook",
        "assignee_id": 5,
        "delegated_by_id": 18,
        "completed_on": null,
        "completed_by_id": null,
        "is_completed": false,
        "comments_count": 0,
        "attachments": [

        ],
        "labels": [

        ],
        "is_trashed": false,
        "trashed_on": null,
        "trashed_by_id": 0,
        "project_id": 2,
        "is_hidden_from_clients": false,
        "body": "",
        "body_formatted": "",
        "created_on": 1515388565,
        "created_by_id": 18,
        "updated_on": 1515388620,
        "updated_by_id": 18,
        "task_number": 33,
        "task_list_id": 3,
        "position": 18,
        "is_important": false,
        "start_on": null,
        "due_on": null,
        "estimate": 0,
        "job_type_id": 0,
        "total_subtasks": 0,
        "completed_subtasks": 0,
        "open_subtasks": 0,
        "created_from_recurring_task_id": 0
    };

    return {
        "payload": payload,
        "timestamp": 1515388620,
        "type": "TaskUpdated"
    };
};

export function getRawNewComment(): Event<Comment> {
    const payload: Comment = {
        "id": 32,
        "class": "Comment",
        "url_path": "\/comments\/32",
        "attachments": [

        ],
        "is_trashed": false,
        "trashed_on": null,
        "trashed_by_id": 0,
        "parent_type": "Task",
        "parent_id": 311,
        "body": "Add comment",
        "body_formatted": "Add comment",
        "body_plain_text": "Add comment",
        "created_on": 1515648058,
        "created_by_id": 18,
        "updated_on": 1515648058,
        "updated_by_id": 18
    };

    return {
        "payload": payload,
        "timestamp": 1515648058,
        "type": "CommentCreated"
    };
};

export function getRawNewProjectEvent(): Event<Project> {
    const payload:Project = {
        "id": 24,
        "class": "Project",
        "url_path": "\/projects\/24",
        "name": "TestProject",
        "completed_on": null,
        "completed_by_id": null,
        "is_completed": false,
        "members": [
            5,
            18
        ],
        "category_id": 0,
        "label_id": 0,
        "is_trashed": false,
        "trashed_on": null,
        "trashed_by_id": 0,
        "created_on": 1515719736,
        "created_by_id": 18,
        "created_by_name": "Ben Morningstar",
        "created_by_email": "ben.morningstar@realseriousgames.com",
        "updated_on": 1515719737,
        "updated_by_id": 18,
        "body": "",
        "body_formatted": "",
        "company_id": 1,
        "leader_id": 18,
        "currency_id": 10,
        "template_id": 1,
        "based_on_type": null,
        "based_on_id": null,
        "email": "notifications-157544+lppy21hzjm@activecollab.com",
        "is_tracking_enabled": false,
        "is_client_reporting_enabled": false,
        "budget": null,
        "count_tasks": 0,
        "count_discussions": 0,
        "count_files": 0,
        "count_notes": 0,
        "last_activity_on": 1515719737
    };

    return {
        "payload": payload,
        "timestamp": 1515719737,
        "type": "ProjectCreated"
    };
};

export function getEmptyReport(): Report {
    return {
        all: {
            label: 'All Assignments',
            assignments: {}
        }
    };
};