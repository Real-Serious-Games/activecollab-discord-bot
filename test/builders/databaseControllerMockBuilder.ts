import { IDatabaseController } from '../../src/controllers/database';
import { RichEmbed } from 'discord.js';

export class DatabaseControllerMockBuilder {

    private addImage = jest.fn(() => Promise.resolve(new RichEmbed()));
    private getImage = jest.fn(() => Promise.resolve(''));
    private getAllImages = jest.fn(() => Promise.resolve([]));
    private removeImage: jest.Mock<Promise<void>> = jest.fn(() => Promise.resolve());
    private addUser: jest.Mock<Promise<void>> = jest.fn(() => Promise.resolve());
    private updateUser: jest.Mock<Promise<void>> = jest.fn(() => Promise.resolve());
  
    public withAddImage(mock: jest.Mock<Promise<RichEmbed>>) {
        this.addImage = mock;
        return this;
    }

    public withGetImage(mock: jest.Mock<Promise<string>>) {
        this.getImage = mock;
        return this;
    }

    public withGetAllImages(mock: jest.Mock<Promise<Array<RichEmbed>>>) {
        this.getAllImages = mock;
        return this;
    }

    public withRemoveImage(mock: jest.Mock<Promise<void>>) {
        this.removeImage = mock;
        return this;
    }

    public withAddUser(mock: jest.Mock<Promise<void>>) {
        this.addUser = mock;
        return this;
    }

    public withUpdateUser(mock: jest.Mock<Promise<void>>) {
        this.updateUser = mock;
        return this;
    }

    public build(): IDatabaseController {
        return {
            addImage: this.addImage,
            getImage: this.getImage,
            getAllImages: this.getAllImages,
            removeImage: this.removeImage,
            addUser: this.addUser,
            updateUser: this.updateUser
        };
    }
}
