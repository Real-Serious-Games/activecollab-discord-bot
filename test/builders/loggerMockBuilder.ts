import { Logger } from 'structured-log';

export class LoggerMockBuilder {

    private info = jest.fn();
    private warn = jest.fn();
    private error = jest.fn();

    public withInfo(info: jest.Mock<{}>) {
        this.info = info;
        return this;
    }

    public withWarn(warn: jest.Mock<{}>) {
        this.warn = warn;
        return this;
    }

    public withError(error: jest.Mock<{}>) {
        this.error = error;
        return this;
    }

    public build(): Partial<Logger> {
        return {
            info: this.info,
            warn: this.warn,
            error: this.error
        };
    }
}