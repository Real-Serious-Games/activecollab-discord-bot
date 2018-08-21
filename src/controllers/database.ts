import { UserSchema, ChannelSchema, ImageSchema } from '../models/dbSchemas';
import { updateLocale } from '../../node_modules/moment';

export interface IDatabaseController {
    AddImage: () => {};
    GetImage: () => {};
    RemoveImage: () => {};
    AddUser: () => {};
    UpdateUser: () => {};
}

const userModel = new UserSchema().getModelForClass(UserSchema);
const channelModel = new ChannelSchema().getModelForClass(ChannelSchema);
const imageModel = new ImageSchema().getModelForClass(ImageSchema);

function AddImage() {

}

function GetImage() {

}

function RemoveImage() {
    // Require manual removal of images until permissions are set up

}

function AddUser() {

}

function UpdateUser() {

}

export function createDatabaseController() {
    return {
        AddImage: () => AddImage(),
        GetImage: () => GetImage(),
        RemoveImage: () => RemoveImage(),
        AddUser: () => AddUser(),
        UpdateUser: () => UpdateUser()
    };
}