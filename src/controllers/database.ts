import { UserSchema, ChannelSchema, ImageSchema } from '../models/dbSchemas';
import * as https from 'https';
import * as fs from 'fs';
import * as moment from 'moment';
import { RichEmbed } from 'discord.js';

export interface IDatabaseController {
    AddImage: (type: string, imageUrl: string) => Promise<RichEmbed>;
    GetImage: (type: string, id?: string) => Promise<string>;
    GetAllImages: (type: string) => Promise<Array<RichEmbed>>;
    RemoveImage: (id: string) => void;
    AddUser: () => void;
    UpdateUser: () => void;
}

const userModel = new UserSchema().getModelForClass(UserSchema);
const channelModel = new ChannelSchema().getModelForClass(ChannelSchema);
const imageModel = new ImageSchema().getModelForClass(ImageSchema);

const imageSaveLocation = './Images/';

async function DownloadImage (url: string) {
    return new Promise<Buffer>((resolve, reject) => {
        const data: Buffer[] = [];   
    
        https.request(url, function(response) {                                        
      
            response.on('data', function(chunk) {  
                data.push(Buffer.from(chunk));                                                         
            });                                                                         
      
            response.on('end', function() {                                             
               resolve(Buffer.concat(data)); 
            });                                                                         
        }).end();
    });
}

async function AddImage(type: string, imageUrl: string) {
    const embed = new RichEmbed();

    try {
        const imageData = await DownloadImage(imageUrl);
        if (imageData.length > 0) {
            const img = new imageModel({ type: type, fileName: imageUrl.split('/').pop(), data: imageData.toString('base64')});
            
            const saved = await img.save();
            return embed.addField('Image upload complete', `Image ID is ${saved._id}`);
        }
    }   
    catch (error) {
        console.log('Image upload failed, error: ' + error);
        return embed.addField('Image upload failed', '');
    }

    return embed.addField('Image upload failed', 'Failed to download image from Discord');
}

/**
 * Takes an image type and returns a random image (as url) of that type.
 * @param type The type of the image
 * @param id Optional id parameter forces the return of a certain image (not random)
 */
async function GetImage(type: string, id?: string) {
    const filename = moment().format('YYYY-MM-DD') + '_' + type;
    
    try {
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

        let results;
        if (id) {
            results = await imageModel.find({ type: type, id: id });
        }
        else {
            results = await imageModel.find({ type: type });
        }

        if (results.length === 0) {
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
        throw new Error('Error when saving Image to file: ' + error);
    }
}

async function GetAllImages (type: string) {
    const tempFolderPath = 'temp/';
    try {
        if (!fs.existsSync(imageSaveLocation + tempFolderPath)) {
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

        if (results.length === 0) {
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
        throw new Error('Error when getting all images of specified type: ' + type + ', error: ' + error);
    }
}

function RemoveImage(id: string) {
    // Require manual removal of images until permissions are set up

}

function AddUser() {

}

function UpdateUser() {

}

export function createDatabaseController() {
    return {
        AddImage: (type: string, imageUrl: string) => AddImage(type, imageUrl),
        GetImage: (type: string, id?: string) => GetImage(type, id),
        GetAllImages: (type: string) => GetAllImages(type),
        RemoveImage: (id: string) => RemoveImage(id),
        AddUser: () => AddUser(),
        UpdateUser: () => UpdateUser()
    };
}