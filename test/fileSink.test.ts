import * as moment from 'moment';

import * as fileSink from '../src/controllers/FileSink';

enum LogEventLevel {
    off = 0,
    fatal = 1,
    error = 3,
    warning = 7,
    information = 15,
    debug = 31,
    verbose = 63,
}

describe('FileSink', () => {
    describe('constructor', () => {
        it('should create a new logs folder if it doesnt exist', () => {
            const appendFileMock = jest.fn();
            const dateMock = jest.fn();
            const timeMock = jest.fn();

            const existsMock = jest.fn(() => false);
            const mkDirMock = jest.fn();

            const testSink = new fileSink.FileSink(
                appendFileMock,
                dateMock,
                timeMock,
                existsMock,
                mkDirMock
            );

            expect(existsMock).toHaveBeenCalledTimes(1);
            expect(mkDirMock).toHaveBeenCalledTimes(1);
        });
    });
    describe('emit', () => {
        it('should write fatal to the log file', () => {
            const appendFileMock = jest.fn();
            const dateMock = jest.fn(() => 'date');
            const timeMock = jest.fn(() => 'time');
            const testSink = new fileSink
                .FileSink(appendFileMock, dateMock, timeMock);
            const renderOutput = '';
            const testEvent = {
                level: LogEventLevel.fatal,
                messageTemplate: {
                    render: jest.fn(() => renderOutput)
                }
            };

            testSink.emit([testEvent]);

            expect(appendFileMock).toBeCalledWith(
                'Logs/' + dateMock() + '.txt',
                '\n' + timeMock() + ' [Fatal] | ' + renderOutput
            );
        });
        it('should write error to the log file', () => {
            const appendFileMock = jest.fn();
            const dateMock = jest.fn(() => 'date');
            const timeMock = jest.fn(() => 'time');
            const testSink = new fileSink
                .FileSink(appendFileMock, dateMock, timeMock);
            const renderOutput = '';
            const testEvent = {
                level: LogEventLevel.error,
                messageTemplate: {
                    render: jest.fn(() => renderOutput)
                }
            };

            testSink.emit([testEvent]);

            expect(appendFileMock).toBeCalledWith(
                'Logs/' + dateMock() + '.txt',
                '\n' + timeMock() + ' [Error] | ' + renderOutput
            );
        });
        it('should write warning to the log file', () => {
            const appendFileMock = jest.fn();
            const dateMock = jest.fn(() => 'date');
            const timeMock = jest.fn(() => 'time');
            const testSink = new fileSink
                .FileSink(appendFileMock, dateMock, timeMock);
            const renderOutput = '';
            const testEvent = {
                level: LogEventLevel.warning,
                messageTemplate: {
                    render: jest.fn(() => renderOutput)
                }
            };

            testSink.emit([testEvent]);

            expect(appendFileMock).toBeCalledWith(
                'Logs/' + dateMock() + '.txt',
                '\n' + timeMock() + ' [Warning] | ' + renderOutput
            );
        });
        it('should write information to the log file', () => {
            const appendFileMock = jest.fn();
            const dateMock = jest.fn(() => 'date');
            const timeMock = jest.fn(() => 'time');
            const testSink = new fileSink
                .FileSink(appendFileMock, dateMock, timeMock);
            const renderOutput = '';
            const testEvent = {
                level: LogEventLevel.information,
                messageTemplate: {
                    render: jest.fn(() => renderOutput)
                }
            };

            testSink.emit([testEvent]);

            expect(appendFileMock).toBeCalledWith(
                'Logs/' + dateMock() + '.txt',
                '\n' + timeMock() + ' [Information] | ' + renderOutput
            );
        });
        it('should write debug to the log file', () => {
            const appendFileMock = jest.fn();
            const dateMock = jest.fn(() => 'date');
            const timeMock = jest.fn(() => 'time');
            const testSink = new fileSink
                .FileSink(appendFileMock, dateMock, timeMock);
            const renderOutput = '';
            const testEvent = {
                level: LogEventLevel.debug,
                messageTemplate: {
                    render: jest.fn(() => renderOutput)
                }
            };

            testSink.emit([testEvent]);

            expect(appendFileMock).toBeCalledWith(
                'Logs/' + dateMock() + '.txt',
                '\n' + timeMock() + ' [Debug] | ' + renderOutput
            );
        });
        it('should write verbose to the log file', () => {
            const appendFileMock = jest.fn();
            const dateMock = jest.fn(() => 'date');
            const timeMock = jest.fn(() => 'time');
            const testSink = new fileSink
                .FileSink(appendFileMock, dateMock, timeMock);
            const renderOutput = '';
            const testEvent = {
                level: LogEventLevel.verbose,
                messageTemplate: {
                    render: jest.fn(() => renderOutput)
                }
            };

            testSink.emit([testEvent]);

            expect(appendFileMock).toBeCalledWith(
                'Logs/' + dateMock() + '.txt',
                '\n' + timeMock() + ' [Verbose] | ' + renderOutput
            );
        });
        it('should write log to the log file', () => {
            const appendFileMock = jest.fn();
            const dateMock = jest.fn(() => 'date');
            const timeMock = jest.fn(() => 'time');
            const testSink = new fileSink
                .FileSink(appendFileMock, dateMock, timeMock);
            const renderOutput = '';
            const testEvent = {
                level: undefined,
                messageTemplate: {
                    render: jest.fn(() => renderOutput)
                }
            };

            testSink.emit([testEvent]);

            expect(appendFileMock).toBeCalledWith(
                'Logs/' + dateMock() + '.txt',
                '\n' + timeMock() + ' [Log] | ' + renderOutput
            );
        });
    });
    describe('flush', () => {
        it('should resolve promise', async () => {
            expect.assertions(1);

            const testSink = new fileSink.FileSink();

            return expect(testSink.flush()).resolves.toEqual(undefined);
        });
    });
});

describe('getDateInTimezone', () => {
    it('should return the current time offset by timezone', () => {
        const date = new Date(0);
        const mockTimezone = '+07:00';

        const testDate = fileSink.getDateInTimezone(date, mockTimezone);

        expect(testDate.hours())
            .toEqual(moment(date).utcOffset(mockTimezone).hours());
    });
});

describe('getDate', () => {
    it('should return the current date', () => {
        const mockDate = new Date('1221-12-21T12:34:56');

        const testDate = fileSink.getDate(mockDate, '0');

        expect(testDate).toEqual('21-12-1221');
    });
    it('should return the current date with a preceding zero', () => {
        const mockDate = new Date('2000-01-02T12:34:56');

        const testDate = fileSink.getDate(mockDate, '0');

        expect(testDate).toEqual('02-01-2000');
    });
});

describe('getTime', () => {
    it('should return the current date', () => {
        const mockDate = new Date('1221-12-21T12:34:56');

        const testDate = fileSink.getTime(mockDate, '0');

        expect(testDate).toEqual('12:34:56');
    });
    it('should return the current date with a preceding zero', () => {
        const mockDate = new Date('2000-01-02T01:02:03');

        const testDate = fileSink.getTime(mockDate, '0');

        expect(testDate).toEqual('01:02:03');
    });
});
