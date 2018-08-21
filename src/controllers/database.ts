import { UserSchema, ChannelSchema, ImageSchema } from '../models/dbSchemas';
import * as https from 'https';

export interface IDatabaseController {
    AddImage: (type: string, filename: string, imageUrl: string) => void;
    GetImage: (type: string) => Promise<string>;
    RemoveImage: (id: string) => void;
    AddUser: () => void;
    UpdateUser: () => void;
}

const userModel = new UserSchema().getModelForClass(UserSchema);
const channelModel = new ChannelSchema().getModelForClass(ChannelSchema);
const imageModel = new ImageSchema().getModelForClass(ImageSchema);

async function DownloadImage (url: string, filename: string) {
    return new Promise<Buffer>((resolve, reject) => {
        const data: Buffer[] = [];   
    
        https.request(url, function(response) {                                        
      
            response.on('data', function(chunk) {  
                console.log('chunk: ' + chunk);
                console.log('chunk: ' + (chunk as Buffer).toString());
                data.push(chunk as Buffer);                                                         
            });                                                                         
      
            response.on('end', function() {                                             
               resolve(Buffer.concat(data)); 
            });                                                                         
        }).end();
    });
}

async function AddImage(type: string, filename: string, imageUrl: string) {
    const imageData = await DownloadImage(imageUrl, filename);
    console.log(imageData);
    console.log(imageData.toString());

    if (imageData.length > 0) {
        const img = new imageModel({ type: type, fileName: filename, data: imageData.toString()});
        
        await img.save();
        const image = await imageModel.findOne();
        console.log(image);
    }
}

async function GetImage(type: string, id?: string) {
    imageModel.find( { type: type }, 'fileName data')
    .then(results => {
        const randomNum = Math.round(Math.random() * (results.length - 1));
        console.log(results[randomNum]);
    });
    console.log('Not yet implemented');
    return 'not implemented';
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
        AddImage: (type: string, filename: string, imageUrl: string) => AddImage(type, filename, imageUrl),
        GetImage: (type: string) => GetImage(type),
        RemoveImage: (id: string) => RemoveImage(id),
        AddUser: () => AddUser(),
        UpdateUser: () => UpdateUser()
    };
}