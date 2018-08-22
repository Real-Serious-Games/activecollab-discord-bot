import { Logger } from 'structured-log';

import { IActiveCollabAPI } from '../../src/controllers/activecollab-api';
import { IMappingController } from '../../src/controllers/mapping';
import { ActiveCollabApiMockBuilder } from './activeCollabApiMockBuilder';
import { createCommandController } from '../../src/controllers/command';
import { MappingControllerMockBuilder } from './mappingControllerMockBuilder';
import { DatabaseControllerMockBuilder } from './databaseControllerMockBuilder';
import { IDatabaseController } from '../../src/controllers/database';

export class CommandControllerBuilder {
    private activeCollabApi: Partial<IActiveCollabAPI> =
        new ActiveCollabApiMockBuilder().build();

    private mappingController: Partial<IMappingController> =
        new MappingControllerMockBuilder().build();

    private databaseController: Partial<IDatabaseController> =
        new DatabaseControllerMockBuilder().build();

    private logger: Partial<Logger> = {
        warn: jest.fn()
    };

    public withLogger(logger: Logger): CommandControllerBuilder {
        this.logger = logger;
        return this;
    }

    public withActiveCollabApi(activeCollabApi: Partial<IActiveCollabAPI>): CommandControllerBuilder {
        this.activeCollabApi = activeCollabApi;
        return this;
    }

    withMappingController(mappingController: IMappingController): CommandControllerBuilder {
        this.mappingController = mappingController;
        return this;
    }

    public build() {
        return createCommandController(
            this.activeCollabApi as IActiveCollabAPI,
            this.mappingController as IMappingController,
            this.databaseController as IDatabaseController,
            this.logger
        );
    }
}