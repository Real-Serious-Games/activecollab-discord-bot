import { DatabaseControllerMockBuilder } from './databaseControllerMockBuilder';
import { IDatabaseController, createDatabaseController } from '../../src/controllers/database';

export class DatabaseControllerBuilder {
    public build() {
        return createDatabaseController();
    }
}