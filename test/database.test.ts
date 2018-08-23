import { UserSchema, ChannelSchema, ImageSchema } from '../src/models/dbSchemas';
import { DatabaseControllerBuilder } from './builders/databaseControllerBuilder';
import * as mongoose from 'mongoose';
import * as moment from 'moment';
import * as fs from 'fs';

describe('DatabaseController', async () => {
    beforeEach(async () => {
        await mongoose.connect('mongodb://localhost:27017/testDatabase');
    });
    afterEach(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });
    afterAll(() => {
        if (fs.existsSync('./Images/temp/')) {
            const dirContents = fs.readdirSync('./Images/temp/');
            dirContents.forEach(file => {
                fs.unlinkSync('./Images/temp/' + file);
            });
        }
    });
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
            
            jest.mock('../src/models/dbSchemas');

            const mockType = 'test';
            const mockUrl = 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Blank.png';

            const result = await databaseController.addImage(mockType, mockUrl);

            expect(result.fields).toBeTruthy();
            expect(result.fields.length).toBe(1);
            expect(result.fields[0].name).toBe('Image upload complete');
            const splitReturnValue = result.fields[0].value.split(' ');
            expect(splitReturnValue[0] + ' ' + splitReturnValue[1]).toBe('Image ID');
        });
    });
    describe('getImage', () => {
        const imageSaveLocation = './Images/';
        const filename = moment().format('YYYY-MM-DD') + '_test.jpg';

        afterEach(() => {
            if (fs.existsSync(imageSaveLocation)) {
                const dirContents = fs.readdirSync(imageSaveLocation);
                dirContents.forEach(file => {
                    if (file === filename) {
                        fs.unlinkSync(imageSaveLocation + file);
                    }
                });
            }
        });
        it('should throw error if type is invalid', async () => {
            const databaseController = new DatabaseControllerBuilder().build();
            const mockError = new Error('Error when saving Image to file: ' 
            + 'No images found for specified type!');

            try {
                await databaseController.getImage('invalidType');
            }
            catch (error) {
                expect(error.message)
                .toBe(mockError.message);
            }
        });
        it('should return path to image', async () => {
            const databaseController = new DatabaseControllerBuilder().build();

            await seedDatabase('image');
            const response = await databaseController.getImage('test');
            expect(response).toBe(imageSaveLocation + filename);
        });
        it('should return path to image if provided ID', async () => {
            const databaseController = new DatabaseControllerBuilder().build();

            const mockId = await seedDatabase('image');
            const response = await databaseController.getImage('test', mockId);

            expect(response).toBe(imageSaveLocation + filename);

            await mongoose.connection.db.dropCollection('imageschemas');
        });
        it('should return existing image if one exists', async () => {
            const databaseController = new DatabaseControllerBuilder().build();

            await seedDatabase('image');

            
            // Creating a local image
            await databaseController.getImage('test');
            
            // Recording the time modified
            let modifiedTime;
            if (fs.existsSync(imageSaveLocation + filename)) {
                modifiedTime = fs.statSync(imageSaveLocation + filename).mtime.toTimeString();
            }

            // Getting the same image
            await databaseController.getImage('test');

            expect(fs.existsSync(imageSaveLocation + filename)).toBe(true);
            if (fs.existsSync(imageSaveLocation + filename)) {
                expect(modifiedTime).toBe(fs.statSync(imageSaveLocation + filename).mtime.toTimeString());
            }

            await mongoose.connection.db.dropCollection('imageschemas');
        });
    });

    describe('getAllImages', () => {
        const imageSaveLocation = './Images/temp/';

        afterEach(() => {
            if (fs.existsSync(imageSaveLocation)) {
                const dirContents = fs.readdirSync(imageSaveLocation);
                dirContents.forEach(file => {
                    fs.unlinkSync(imageSaveLocation + file);
                });
            }
        });
        it('should throw error if type is invalid', async () => {
            const databaseController = new DatabaseControllerBuilder().build();
            const mockError = new Error('Error when saving Image to file: ' 
            + 'No images found for specified type!');

            try {
                await databaseController.getAllImages('invalidType');
            }
            catch (error) {
                expect(error.message)
                .toBe(mockError.message);
            }
        });
        it('should return array of all images of that type as embeds', async () => {
            const databaseController = new DatabaseControllerBuilder().build();

            const numMocks = 9;

            const mockIdArray = [];
            for (let i = 0; i < numMocks; i++) {
                const mockId = await seedDatabase('image');
                mockIdArray.push(mockId);
            }

            const response = await databaseController.getAllImages('test');

            const resultIdArray = [];
            expect(response.length).toBe(numMocks);

            response.forEach(img => {
                expect(img.fields.length).toBe(1);
                resultIdArray.push(img.fields[0].value);
            });
            
            expect(mockIdArray.toString()).toBe(resultIdArray.toString());

            await mongoose.connection.db.dropCollection('imageschemas');
        });
    });

    describe('removeImage', () => {
        it('should return embed with error message if id is invalid', async () => {
            const databaseController = new DatabaseControllerBuilder().build();

            const mockId = 'invalidId';

            const result = await databaseController.removeImage(mockId);

            expect(result.fields).toBeTruthy();
            expect(result.fields.length).toBe(1);
            expect(result.fields[0].name).toBe('Error occurred while removing image');
            expect(result.fields[0].value).toBe('Please check that the id provided is valid');
        });
        it('should return embed with error message if id doesn\'t exist', async () => {
            const databaseController = new DatabaseControllerBuilder().build();

            const mockId = '5b7cdad0a5232e1e3c4dcc19';

            const result = await databaseController.removeImage(mockId);

            expect(result.fields).toBeTruthy();
            expect(result.fields.length).toBe(1);
            expect(result.fields[0].name).toBe('Failed to Remove Image');
            expect(result.fields[0].value).toBe('Please check that the id provided is valid');
        });
        it('should return embed with image when removal complete', async () => {
            const databaseController = new DatabaseControllerBuilder().build();

            const mockId = await seedDatabase('image');

            const result = await databaseController.removeImage(mockId);

            expect(result.fields).toBeTruthy();
            expect(result.fields.length).toBe(1);
            expect(result.fields[0].name).toBe('Removal from database');
            expect(result.fields[0].value).toBe('Complete');
            expect(result.title).toBe(`Successfully Removed Image: ${mockId}`);
            expect(result.file).toBeTruthy();

            await mongoose.connection.db.dropCollection('imageschemas');
        });
    });
    describe('addUser', () => {
        it('should throw NotYetImplemented', () => {
            const databaseController = new DatabaseControllerBuilder().build();

            const expectedError = new Error('Not yet implemented');

            expect(databaseController.addUser)
            .toThrowError(expectedError.message);
        });
    });
    describe('updateUser', () => {
        it('should throw NotYetImplemented', () => {
            const databaseController = new DatabaseControllerBuilder().build();

            const expectedError = new Error('Not yet implemented');

            expect(databaseController.updateUser)
            .toThrowError(expectedError.message);
        });
    });
});

async function seedDatabase (type: string) {
switch (type) {
    case 'image':
    const imageModel = new ImageSchema().getModelForClass(ImageSchema);
    const imageData = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigD//2Q==';
    const img = new imageModel({ type: 'test', fileName: 'Blank.jpg', data: imageData});
    const response = await img.save();
    return response._id;

    case 'user':
    const userModel = new UserSchema().getModelForClass(UserSchema);
    break;

    case 'channel':
    const channelModel = new ChannelSchema().getModelForClass(ChannelSchema);
    break;
}
}