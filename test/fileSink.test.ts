import * as fileSink from '../src/controllers/FileSink';

describe('getDateInTimezone', () => {
    it('should return the current time offset by timezone', () => {
        const date = new Date(0);
        const mockDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
        const mockTimezone = 10;

        const testDate = fileSink.getDateInTimezone(mockDate, mockTimezone);

        console.log(date);
        console.log(mockDate);
        console.log(testDate);

        // TODO: mock timezone to properly test timezone calculation
        // or change to using moment
        expect(true).toBe(false);
    });
});

describe('getDate', () => {
    it('should return the current date', () => {
        const mockDate = new Date('1221-12-21T12:34:56');

        const testDate = fileSink.getDate(mockDate);

        expect(testDate).toEqual('21-12-1221');
    });
    it('should return the current date with a preceding zero', () => {
        const mockDate = new Date('2000-01-02T12:34:56');

        const testDate = fileSink.getDate(mockDate);

        expect(testDate).toEqual('02-01-2000');
    });
});

describe('getTime', () => {
    it('should return the current date', () => {
        const mockDate = new Date('1221-12-21T12:34:56');

        const testDate = fileSink.getTime(mockDate);

        expect(testDate).toEqual('12:34:56');
    });
    it('should return the current date with a preceding zero', () => {
        const mockDate = new Date('2000-01-02T01:02:03');

        const testDate = fileSink.getTime(mockDate);

        expect(testDate).toEqual('01:02:03');
    });
});
