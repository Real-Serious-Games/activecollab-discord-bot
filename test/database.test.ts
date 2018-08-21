import { UserSchema, ChannelSchema, ImageSchema } from '../src/models/dbSchemas';
import { IDatabaseController, createDatabaseController } from '../src/controllers/database';

describe('DatabaseController', () => {
    describe('addImage', () => {
        it('should save the image to the database', () => {
            const database: IDatabaseController = createDatabaseController();

            const img: Buffer = new Buffer('test');
            database.AddImage('reminder', img);


        });
    })
});