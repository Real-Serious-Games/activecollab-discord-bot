import { UserSchema, ChannelSchema, ImageSchema } from '../src/models/dbSchemas';
import { IDatabaseController, createDatabaseController } from '../src/controllers/database';
import { DatabaseControllerMockBuilder } from './builders/databaseControllerMockBuilder';
import { DatabaseControllerBuilder } from './builders/databaseControllerBuilder';

describe('DatabaseController', () => {
    describe('addImage', () => {
        it('should pass url to download function', () => {
            expect.assertions(1);

            const databaseController = new DatabaseControllerBuilder().build();
            
            databaseController.downloadImage = jest.fn();

            const imgUrl = './Images/test.jpg';
            databaseController.addImage('reminder', imgUrl);

            expect(databaseController.downloadImage).toHaveBeenCalledWith(imgUrl);
        });
    });
});