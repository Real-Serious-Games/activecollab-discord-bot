import * as fileSink from '../src/controllers/FileSink';
import * as moment from 'moment';

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
