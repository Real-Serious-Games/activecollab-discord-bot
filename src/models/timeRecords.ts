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
    id: number;
    type: string;
    parent_type: string;
    parent_id: number;
    group_id: number;
    record_date: number;
    user_id: number;
    user_name: string;
    user_email: string;
    summary: string;
    value: number;
    billable_status: number;
    project_id: number;
    project_name: string;
    project_url: string;
    client_id: number;
    client_name: string;
    currency_id: number;
    custom_hourly_rate: number;
    parent_name: string;
    parent_url: string;
    group_name: string;
    billable_name: string;
}
