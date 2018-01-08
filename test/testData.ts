import { Task } from '../src/models/taskPayload';

export const rawNewTask : Task = {
    "payload": {
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
    },
    "timestamp": 1515388565,
    "type": "TaskCreated"
};

export const rawUpdatedTask : Task = {
  "payload": {
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
  },
  "timestamp": 1515388620,
  "type": "TaskUpdated"
}
