import { Client } from 'discord.js';
import { Logger } from 'structured-log';

import { DiscordController } from '../../src/controllers/discord';
import { DiscordClientMockBuilder } from './discordClientMockBuilder';
import { IMappingController } from '../../src/controllers/mapping';
import { MappingControllerMockBuilder } from './mappingControllerMockBuilder';
import { ICommandController } from '../../src/controllers/command';
import { CommandControllerMockBuilder } from './commandControllerMockBuilder';
import { HelpControllerMockBuilder } from './helpControllerMockBuilder';
import { LoggerMockBuilder } from './loggerMockBuilder';
import { IHelpController } from '../../src/controllers/helpController';

export class DiscordControllerBuilder {

    private token: string = 'token';

    private client: Partial<Client> =
        new DiscordClientMockBuilder().build();

    private mappingController: IMappingController =
        new MappingControllerMockBuilder().build();

    private commandController: ICommandController =
        new CommandControllerMockBuilder().build();

    private helpController: IHelpController =
        new HelpControllerMockBuilder().build();

    private logger: Partial<Logger> =
        new LoggerMockBuilder().build();

    private commandPrefix: string = '!';

    private guildNames: Array<string> = ['Guild 1', 'Guild 2'];

    public withToken(token: string) {
        this.token = token;
        return this;
    }

    public withClient(client: Partial<Client>) {
        this.client = client;
        return this;
    }

    public withMappingController(mappingController: IMappingController) {
        this.mappingController = mappingController;
        return this;
    }

    public withGuildNames(guildNames: Array<string>) {
        this.guildNames = guildNames;
        return this;
    }

    public withLogger(logger: Partial<Logger>) {
        this.logger = logger;
        return this;
    }

    public withCommandController(commandController: Partial<ICommandController>) {
        this.commandController = commandController as ICommandController;
        return this;
    }

    public withHelpController(helpController: Partial<IHelpController>) {
        this.helpController = helpController as IHelpController;
        return this;
    }

    public build() {
        return new DiscordController(
            this.token,
            this.client as Client,
            this.mappingController,
            this.commandController,
            this.helpController,
            this.logger,
            this.commandPrefix,
            this.guildNames
        );
    }
}
