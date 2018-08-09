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
    private runUserCommand = jest.fn().mockReturnValue(200);
    private runChannelCommand = jest.fn().mockReturnValue(200);

    public withDetermineChannels(func: jest.Mock) {
        this.determineChannels = func;
        return this;
    }

    public build(): IDiscordController {
        return {
            sendMessageToChannel: this.sendMessageToChannel,
            determineChannels: this.determineChannels,
            getUserId: this.getUserId,
            runUserCommand: this.runUserCommand,
            runChannelCommand: this.runChannelCommand
        };
    }
}
