export interface TasksData {
    [id: string]: Task[];
}

export interface Task {
    id: number;
    class: string;
    url_path: string;
    name: string;
    assignee_id: number;
    delegated_by_id: number;
    completed_on?: number;
    completed_by_id?: number;
    is_completed: boolean;
    comments_count: number;
    // attachments: [];
    // labels: [];
    is_trashed: boolean;
    trashed_on?: number;
    trashed_by_id: number;
    project_id: number;
    is_hidden_from_clients: boolean;
    body: string;
    body_formatted: string;
    created_on: number;
    created_by_id: number;
    created_by_name: string;
    created_by_email: string;
    updated_on: number;
    updated_by_id: number;
    task_number: number;
    task_list_id: number;
    position: number;
    is_important: boolean;
    start_on?: number;
    due_on?: number;
    estimate: number;
    job_type_id: number;
    fake_assignee_name?: number;
    fake_assignee_email?: number;
    total_subtasks: number;
    completed_subtasks: number;
    open_subtasks: number;
    created_from_recurring_task_id: number;
}
