import * as Log from 'structured-log';
import { FileSink } from './FileSink';

/**
 * Creates the logger and sets it up to write to the console sink.
 */
export function createLogger(): Log.Logger {
    return Log.configure()
        .writeTo(new Log.ConsoleSink())     /* Log to console */
        .writeTo(new FileSink())            /* Log to File */
        .create();
}