import * as Log from 'structured-log';

/**
 * Creates the logger and sets it up to write to the console sink.
 */
export function createLogger(): Log.Logger {
    return Log.configure()
        .writeTo(new Log.ConsoleSink())
        .create();
}