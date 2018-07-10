import { LogEventLevel } from 'structured-log';
import { LogEvent } from 'structured-log/logEvent';
import { Sink } from 'structured-log/sink';
import fs = require('fs');

export class FileSink implements Sink {
    constructor() {
        // Create Logs/ folder if it doesn't exist
        if (!fs.existsSync('Logs/')) {
            fs.mkdirSync('Logs/');
        }
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
        fs.appendFileSync(filename, '\n' + output);
    }
}

/**
 * Get the current date for logfile name
 */
const getDate = () => {
    const date = new Date();

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const smonth = (month < 10 ? '0' : '') + month;
    const day = date.getDate();
    const sday = (day < 10 ? '0' : '') + day;

    return sday + '-' + smonth + '-' + year;
};
/**
 * Get the current time for the events in the log file
 */
const getTime = () => {
    const date = new Date();

    const hour = date.getHours();
    const shour = (hour < 10 ? '0' : '') + hour;
    const min = date.getMinutes();
    const smin = (min < 10 ? '0' : '') + min;
    const sec = date.getSeconds();
    const ssec = (sec < 10 ? '0' : '') + sec;

    return shour + ':' + smin + ':' + ssec;
};
