import { UserSchema, ChannelSchema, ImageSchema } from '../src/models/dbSchemas';
import { IDatabaseController, createDatabaseController } from '../src/controllers/database';
import { DatabaseControllerMockBuilder } from './builders/databaseControllerMockBuilder';
import { DatabaseControllerBuilder } from './builders/databaseControllerBuilder';

describe('DatabaseController', () => {
    describe('addImage', () => {
        it('should pass url to download function', async () => {
            expect.assertions(2);

            const databaseController = new DatabaseControllerBuilder().build();
            
            const imgUrl = './Images/test.jpg';
            await databaseController.addImage('reminder', imgUrl);

            // expect(databaseController).toHaveBeenCalledWith(imgUrl);
        });
    });
});