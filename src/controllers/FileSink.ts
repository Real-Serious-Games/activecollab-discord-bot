import { LogEventLevel } from 'structured-log';
import { LogEvent } from 'structured-log/logEvent';
import { Sink } from 'structured-log/sink';
import * as fs from 'fs';
import * as moment from 'moment';

export class FileSink implements Sink {
    private appendFileSync: (filename: string, contents: string) => void;
    constructor(
        appendFileSync: (filename: string, contents: string)
            => void = fs.appendFileSync
    ) {
        // Create Logs/ folder if it doesn't exist
        if (!fs.existsSync('Logs/')) {
            fs.mkdirSync('Logs/');
        }
        this.appendFileSync = appendFileSync;
    }

    /**
     * Save 'events' to file
     * @param events Array of events to be saved to file
     */
    public emit(events: LogEvent[]) {
        for (let i = 0; i < events.length; ++i) {
            const e = events[i];

            // Call WriteToFile based on event type
            switch (e.level) {
                case LogEventLevel.fatal:
                    this.writeToFile('Fatal', e);
                    break;

                case LogEventLevel.error:
                    this.writeToFile('Error', e);
                    break;

                case LogEventLevel.warning:
                    this.writeToFile('Warning', e);
                    break;

                case LogEventLevel.information:
                    this.writeToFile('Information', e);
                    break;

                case LogEventLevel.debug:
                    this.writeToFile('Debug', e);
                    break;

                case LogEventLevel.verbose:
                    this.writeToFile('Verbose', e);
                    break;

                default:
                    this.writeToFile('Log', e);
                    break;
            }
        }
    }

    public flush() {
        // TODO: call flush and run appendFile here instead of every time an event is recieved

        // Return resolved promise
        return Promise.resolve();
    }

    private writeToFile(prefix: string, e: LogEvent) {
        // output = time [prefix] | message to write to file
        const output = `${getTime()} [${prefix}] | ${e.messageTemplate.render(e.properties)}`;

        // filename = Logs/<current-date>.txt
        const filename: string = 'Logs/' + getDate() + '.txt';
        // Write lines to file
        this.appendFileSync(filename, '\n' + output);
    }
}

/**
 * Return a new date in the given timezone
 * @param timezone UTC Timezone eg: brisbane: UTC+10 = '+10:00'
 */
export const getDateInTimezone = (date: Date, timezone: string): moment.Moment => {
    return moment(date).utcOffset(timezone);
};

/**
 * Get the current date for logfile name
 */
export const getDate = (
    localDate: Date = new Date(),
    timezone: string = '+10:00'
) => {
    return getDateInTimezone(localDate, timezone).format('DD-MM-YYYY');
};
/**
 * Get the current time for the events in the log file
 */
export const getTime = (
    localDate: Date = new Date(),
    timezone: string = '+10:00'
) => {
    return getDateInTimezone(localDate, timezone).format('HH:mm:ss');
};
