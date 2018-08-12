export interface HelpConfig {
    commands: CommandConfig[];
}

export interface CommandConfig {
    name: string;
    nick_names: string[];
    help_info: string[];
}
