export interface Config {
    Users: User[];
}

export interface User {
    discord_id: string;
    active_collab_id: number;
    active_collab_name: string;

    daily_report_subs: string[];
}
