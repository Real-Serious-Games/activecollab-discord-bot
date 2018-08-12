import { IConfigController } from '../../src/controllers/configController';

export class ConfigControllerMockBuilder {

    private saveConfig = jest.fn();
    private getConfig = jest.fn(() => Promise.resolve());

    public withSaveConfig(mock: jest.Mock) {
        this.saveConfig = mock;
        return this;
    }

    public withGetConfig(mock: jest.Mock<Promise<void>>) {
        this.getConfig = mock;
        return this;
    }

    public build(): IConfigController {
        return {
            saveConfig: this.saveConfig,
            getConfig: this.getConfig
        };
    }
}
