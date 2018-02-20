import { Client } from 'discord.js';
import { Logger } from 'structured-log';

import { DiscordController } from '../../src/controllers/discord';
import { DiscordClientMockBuilder } from './discordClientMockBuilder';
import { IMappingController } from '../../src/controllers/mapping';
import { MappingControllerMockBuilder } from './mappingControllerMockBuilder';
import { ICommandController } from '../../src/controllers/command';
import { CommandControllerMockBuilder } from './commandControllerMockBuilder';
import { LoggerMockBuilder } from './loggerMockBuilder';

export class DiscordControllerBuilder {

    private token: string = 'token';

    private client: Partial<Client> = 
        new DiscordClientMockBuilder().build();

    private mappingController: IMappingController = 
        new MappingControllerMockBuilder().build();

    private commandController: ICommandController = 
        new CommandControllerMockBuilder().build();

    private logger: Partial<Logger> = 
        new LoggerMockBuilder().build();

    private commandPrefix: string = '!';

    private guildNames: Array<string> = ['Guild 1', 'Guild 2'];
    
    public build() {
        return new DiscordController(
            this.token,
            this.client as Client,
            this.mappingController,
            this.commandController,
            this.logger,
            this.commandPrefix,
            this.guildNames
        );
    }
}