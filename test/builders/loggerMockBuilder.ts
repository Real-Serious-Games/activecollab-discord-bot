import { Logger } from 'structured-log';

export class LoggerMockBuilder {

    private warn = jest.fn();
    private error = jest.fn();

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
            warn: this.warn,
            error: this.error
        };
    }
}