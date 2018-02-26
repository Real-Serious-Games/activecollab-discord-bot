import { IDiscordController } from '../../src/controllers/discord';

export class DiscordControllerMockBuilder {

    private sendMessageToChannel = jest.fn();
    private getUserId = jest.fn().mockReturnValue(1);
    private determineChannels = jest.fn().mockReturnValue([
        {
            name: 'channel'
        },
        {
            name: 'channel 2'
        }
    ]);

    public withDetermineChannels(func: jest.Mock) {
        this.determineChannels = func;
        return this;
    }

    public build(): IDiscordController {
        return {
            sendMessageToChannel: this.sendMessageToChannel,
            determineChannels: this.determineChannels,
            getUserId: this.getUserId
        };
    }
}