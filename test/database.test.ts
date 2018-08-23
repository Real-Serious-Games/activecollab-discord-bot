import { UserSchema, ChannelSchema, ImageSchema } from '../src/models/dbSchemas';
import { IDatabaseController, createDatabaseController } from '../src/controllers/database';
import { DatabaseControllerMockBuilder } from './builders/databaseControllerMockBuilder';
import { DatabaseControllerBuilder } from './builders/databaseControllerBuilder';

describe('DatabaseController', () => {
    describe('addImage', () => {
        it('should return embed with error message if type not supported', async () => {
            const databaseController = new DatabaseControllerBuilder().build();
            
            const mockType = 'invalidType';

            const mockUrl = './Images/test.jpg';
            const result = await databaseController.addImage(mockType, mockUrl);

            expect(result.fields).toBeTruthy();
            expect(result.fields.length).toBe(1);
            expect(result.fields[0].name).toBe('Image upload failed');
        });

        it('should return embed with error message if download function not passed a url', async () => {
            const databaseController = new DatabaseControllerBuilder().build();
            
            const mockType = 'reminder';
            const mockUrl = 'notARealUrl';

            const result = await databaseController.addImage(mockType, mockUrl);

            expect(result.fields).toBeTruthy();
            expect(result.fields.length).toBe(1);
            expect(result.fields[0].name).toBe('Image upload failed');
            expect(result.fields[0].value).toBe('Error: Unable to determine the domain name');
        });
        it('should return embed with error message if url passed is http', async () => {
            const databaseController = new DatabaseControllerBuilder().build();
            
            const mockType = 'reminder';
            const mockUrl = 'http://www.realseriousgames.com/wp-content/uploads/2016/03/';

            const result = await databaseController.addImage(mockType, mockUrl);

            expect(result.fields).toBeTruthy();
            expect(result.fields.length).toBe(1);
            expect(result.fields[0].name).toBe('Image upload failed');
            expect(result.fields[0].value).toBe('Error: Protocol \"http:\" not supported. Expected \"https:\"');
        });
        it('should return embed with error message if url passed isn\'t image', async () => {
            const databaseController = new DatabaseControllerBuilder().build();
            
            const mockType = 'reminder';
            const mockUrl = 'https://discordapp.com/';

            const result = await databaseController.addImage(mockType, mockUrl);

            expect(result.fields).toBeTruthy();
            expect(result.fields.length).toBe(1);
            expect(result.fields[0].name).toBe('Image upload failed');
            expect(result.fields[0].value).toBe('ValidationError: fileName: Path `fileName` is required.');
        });
        it('should return embed with success message if saved correctly', async () => {
            const databaseController = new DatabaseControllerBuilder().build();
            
            // jest.mock('../src/models/dbSchemas');

            // const mockType = 'test';
            // const mockUrl = 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Blank.png';

            // const result = await databaseController.addImage(mockType, mockUrl);

            // expect(result.fields).toBeTruthy();
            // expect(result.fields.length).toBe(1);
            // expect(result.fields[0].name).toBe('Image upload failed');
            // expect(result.fields[0].value).toBe('ValidationError: fileName: Path `fileName` is required.');
        });
    });
    describe('getImage', () => {
        it('should throw error if type is invalid', async () => {
            const databaseController = new DatabaseControllerBuilder().build();

            const expectedError = new Error('No images found for specified type!');

            // expect(await databaseController.getImage('invalidType'))
            // .rejects
            // .toMatchObject(expectedError);
        });
    });
});