import { IHelpController } from '../../src/controllers/helpController';
import { RichEmbed } from 'discord.js';

export class HelpControllerMockBuilder {
    private fullHelp = jest.fn(() => new RichEmbed());

    public withFullHelp(mock: jest.Mock<RichEmbed>) {
        this.fullHelp = mock;
        return this;
    }

    public build(): IHelpController {
        return {
            fullHelp: this.fullHelp
        };
    }
}
