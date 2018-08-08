import { Logger } from 'structured-log';
import * as dataForge from 'data-forge';
import * as fs from 'fs';
import * as path from 'path';

const ensurePathExists = (dir: string) => {
    if (!fs.existsSync(dir)) {
        ensurePathExists(path.dirname(dir));
        fs.mkdirSync(dir);
    }
};

export const writeToCsv = async (
    columnNames: string[],
    rows: string[][],
    filePath: string,
    logger: Logger
) => {
    try {
        ensurePathExists(path.dirname(filePath));

        const df = new dataForge.DataFrame({
            columnNames: columnNames,
            rows: rows
        });

        await df.asCSV().writeFile(filePath);
    } catch (error) {
        logger.error(error);
    }
};
