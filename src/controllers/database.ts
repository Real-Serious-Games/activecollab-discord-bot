import { UserSchema, ChannelSchema, ImageSchema } from '../models/dbSchemas';
import * as https from 'https';
import * as fs from 'fs';
import * as moment from 'moment';
import { RichEmbed } from 'discord.js';
import * as mongoose from 'mongoose';

export interface IDatabaseController {
    addImage: (type: string, imageUrl: string) => Promise<RichEmbed>;
    getImage: (type: string, id?: string) => Promise<string>;
    getAllImages: (type: string) => Promise<Array<RichEmbed>>;
    removeImage: (id: string) => Promise<RichEmbed>;
    addUser: () => void;
    updateUser: () => void;
}

const userModel = new UserSchema().getModelForClass(UserSchema);
const channelModel = new ChannelSchema().getModelForClass(ChannelSchema);
const imageModel = new ImageSchema().getModelForClass(ImageSchema);

const imageSaveLocation = './Images/';
const validImageTypes = [
    'reminder',
    'positive',
    'negative',
    'test'
];

async function downloadImage (url: string) {
    return new Promise<Buffer>((resolve, reject) => {
        const data: Buffer[] = [];   
    
        https.request(url, function(response) {                                        
            
            response.on('error', (error) => {
                throw new Error(error.message);

            });
            
            if (response.statusCode != 200) {
                throw new Error('Received invalid HTTP status: ' + response.statusCode);
            }

            response.on('data', (chunk) => {  
                data.push(Buffer.from(chunk));                                                         
            });                                                                         
            
            response.on('end', () => {                                             
               resolve(Buffer.concat(data)); 
            });                                                                         
        }).end();
    });
}

async function addImage(type: string, imageUrl: string) {
    const embed = new RichEmbed();

    if (!mongoose.connection.readyState) {
        return embed.addField('Image upload failed', 
        'Database not found ' + 
        'or the server is still starting.');
    }

    if (!validImageTypes.find(validType => type === validType)) {
        return embed.addField('Image upload failed', 
        'Parameter \'type\' is invalid or not supported\n' + 
        'Use !help for the list of supported types.');
    }

    try {
        const imageData = await downloadImage(imageUrl);
        if (imageData.length > 0) {
            const img = new imageModel({ type: type, fileName: imageUrl.split('/').pop(), data: imageData.toString('base64')});
            
            const saved = await img.save();
            return embed.addField('Image upload complete', `Image ID is ${saved._id}`);
        }
    }   
    catch (error) {
        console.log('Image upload failed, error: ' + error);
        return embed.addField('Image upload failed', error);
    }

    return embed.addField('Image upload failed', 'Failed to download image from Discord');
}

/**
 * Takes an image type and returns a random image (as url) of that type.
 * @param type The type of the image
 * @param id Optional id parameter forces the return of a certain image (not random)
 */
async function getImage(type: string, id?: string) {

    const filename = moment().format('YYYY-MM-DD') + '_' + type;
    
    try {
        
        let results;
        if (id) {
            if (!fs.existsSync(imageSaveLocation)) {
                fs.mkdirSync(imageSaveLocation);
                console.log('Image directory didn\'t exist\nCreated Image directory');
            }

            if (!mongoose.connection.readyState) {
                throw new Error('Database not found ' + 
                'or the server is still starting.');
            }

            results = await imageModel.find({ type: type, _id: id });
        }
        else {
            if (!fs.existsSync(imageSaveLocation)) {
                fs.mkdirSync(imageSaveLocation);
                console.log('Image directory didn\'t exist\nCreated Image directory');
            }
            else {
                const dirContents = fs.readdirSync(imageSaveLocation);
                let existingFileName = '';
                dirContents.forEach(file => {
                    if (file.split('.')[0] === filename) {
                        existingFileName = file;
                    }
                });
                
                if (existingFileName.length > 0) {
                    return imageSaveLocation + existingFileName;
                }
            }

            if (!mongoose.connection.readyState) {
                throw new Error('Database not found ' + 
                'or the server is still starting.');
            }

            results = await imageModel.find({ type: type });
        }

        if (!results || results.length === 0) {
            console.warn('No images found for specified type!');
            throw new Error('No images found for specified type!');
        }

        const randomNum = Math.round(Math.random() * (results.length - 1));
        const result = (results[randomNum]);

        const fileExtension = '.' + result.fileName.split('.').pop();
        
        fs.writeFileSync(imageSaveLocation + filename + fileExtension, result.data, { encoding: 'base64' });
        console.log('Image didn\'t exist\nRetrieved from database and created Image');

        return imageSaveLocation + filename + fileExtension;
    }
    catch (error) {
        throw new Error('Error when saving Image to file: ' + error.message);
    }
}

async function getAllImages (type: string) {
    const tempFolderPath = 'temp/';
    try {
        if (!mongoose.connection.readyState) {
            return [new RichEmbed().addField('Error getting all images:', 
            'Database not found ' + 
            'or the server is still starting.')];
        }

        if (!fs.existsSync(imageSaveLocation + tempFolderPath)) {
            if (!fs.existsSync(imageSaveLocation)) {
                fs.mkdirSync(imageSaveLocation);
                console.log('Image directory didn\'t exist\nCreated Image directory');
            }
            fs.mkdirSync(imageSaveLocation + tempFolderPath);
            console.log('Temp Image directory didn\'t exist\nCreated temp directory');
        }
        else {
            const dirContents = fs.readdirSync(imageSaveLocation + tempFolderPath);
            dirContents.forEach(file => {
                fs.unlinkSync(imageSaveLocation + tempFolderPath + file);
            });
            console.log('Emptied image temp folder.');
        }

        const results = await imageModel.find({ type: type });

        if (!results || results.length === 0) {
            console.warn('No images found for specified type!');
            throw new Error('No images found for specified type!');
        }

        const response: RichEmbed[] = [];

        results.forEach(result => {
            const fileExtension = '.' + result.fileName.split('.').pop();
            fs.writeFileSync(imageSaveLocation + tempFolderPath + result._id + fileExtension, result.data, { encoding: 'base64' });
            response.push(new RichEmbed().addField('id', result._id).attachFile(imageSaveLocation + tempFolderPath + result._id + fileExtension));
        });

        if (response.length > 0) {
            console.log(`Sending all images of type: ${ type }, total of: ${ response.length }`);
            return response;
        }
        else {
            response.push(new RichEmbed().addField('No images found', 'No images found for specified type'));
            return response;
        }
    }
    catch (error) {
        throw new Error('Error when getting all images of specified type: ' + type + '. ' + error);
    }
}

async function removeImage(id: string) {
    const tempFolderPath = 'temp/';
    const embed = new RichEmbed();

    try {
        if (!mongoose.connection.readyState) {
            return new RichEmbed().addField('Error removing image:', 
            'Database not found ' + 
            'or the server is still starting.');
        }

        const imageRemoved = await imageModel.findOneAndRemove({ _id: id });
        if (!imageRemoved) {
            return embed.addField('Failed to Remove Image', 'Please check that the id provided is valid');
        }
        else {
            embed.addField('Removal from database', 'Complete');
        }

        if (!fs.existsSync(imageSaveLocation + tempFolderPath)) {
            fs.mkdirSync(imageSaveLocation + tempFolderPath);
            console.log('Temp Image directory didn\'t exist\nCreated temp directory');
        }

        const fileExtension = '.' + imageRemoved.fileName.split('.').pop();
        fs.writeFileSync(imageSaveLocation + tempFolderPath + imageRemoved._id + fileExtension, imageRemoved.data, { encoding: 'base64' });

        return embed.setTitle(`Successfully Removed Image: ${id}`).attachFile(imageSaveLocation + tempFolderPath + imageRemoved._id + fileExtension);
    }
    catch (error) {
        return embed.addField('Error occurred while removing image', 'Please check that the id provided is valid');
    }
}

function addUser() {
throw new Error('Not yet implemented');
}

function updateUser() {
    throw new Error('Not yet implemented');
}

export function createDatabaseController() {
    return {
        addImage: (type: string, imageUrl: string) => addImage(type, imageUrl),
        getImage: (type: string, id?: string) => getImage(type, id),
        getAllImages: (type: string) => getAllImages(type),
        removeImage: (id: string) => removeImage(id),
        addUser: () => addUser(),
        updateUser: () => updateUser()
    };
}