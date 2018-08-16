export interface BulkTimeRecord {
    [id: string]: RecordData;
}

export interface RecordData {
    label: string;
    records: {
        [id: number]: TimeRecord
    };
}

export interface TimeRecord {
    id: number;                 // ID of time record
    type: string;               // Type of record (usually time_record)

    project_id: number;         // ID of project belonging to time record
    project_name: string;       // Name of project
    project_url: string;        // Link to project

    parent_id: number;          // ID of parent (parent is either a task or project)
    parent_type: string;        // Type of parent (task|project)
    parent_name: string;        // Name of parent (task name, project name etc)
    parent_url: string;         // Link to parent

    user_id: number;            // ID of user that logged the time record
    user_name: string;          // Name of user
    user_email: string;         // Email of user

    client_id: number;          // ID of client associated with time record task
    client_name: string;        // Name of client

    group_id: number;           // ID of group (group is job type ie: developer)
    group_name: string;         // Name of group

    value: number;              // Hours logged
    billable_name: string;      // Name of billable type (usually billable)
    billable_status: number;    // If billable (0|1)
    summary: string;            // Description of time record inputted by user
    record_date: number;        // Date recorded
    currency_id: number;        // ID of currency used
    custom_hourly_rate: number; // Hourly rate charged (usually 100%)
}
