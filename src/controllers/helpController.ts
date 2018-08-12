import * as discord from 'discord.js';
import { Logger } from 'structured-log';
import { IConfigController } from './configController';

export interface IHelpController {
    fullHelp: () => discord.RichEmbed;
}

export class HelpController implements IHelpController {
    private readonly configController: IConfigController;
    private readonly logger: Logger;

    public constructor(
        configController: IConfigController,
        logger: Logger
    ) {
        this.configController = configController;
        this.logger = logger;
    }

    public fullHelp(): discord.RichEmbed {
        const embed = new discord.RichEmbed()
            .setTitle('Help');

        return embed;
    }

    private getCommandHelp(command: string): string {
        const helpString = '';

        return helpString;
    }
}
