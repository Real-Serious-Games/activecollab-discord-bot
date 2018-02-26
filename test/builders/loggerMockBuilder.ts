import { Logger } from 'structured-log';

export class LoggerMockBuilder {

    private warn = jest.fn();

    public withWarn(func: any) {
        this.warn = func;
        return this;
    }

    public build(): Partial<Logger> {
        return {
            warn: this.warn
        };
    }
}