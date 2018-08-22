import { UserSchema, ChannelSchema, ImageSchema } from '../src/models/dbSchemas';
import { IDatabaseController, createDatabaseController } from '../src/controllers/database';
import { DatabaseControllerMockBuilder } from './builders/databaseControllerMockBuilder';

describe('DatabaseController', () => {
    describe('addImage', () => {
        it('should save the image to the database', () => {
            const databaseController: Partial<IDatabaseController> =
            new DatabaseControllerMockBuilder().build();

            const imgUrl = './Images/test.jpg';
            databaseController.addImage('reminder', imgUrl);
            
            expect(databaseController).toHaveBeenCalledWith(imgUrl);
        });
    });
});