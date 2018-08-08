import { Logger } from 'structured-log';
import * as dataForge from 'data-forge';

export const writeToCsv = async (
    columnNames: string[],
    rows: string[][],
    filename: string,
    logger: Logger
) => {
    try {
        const df = new dataForge.DataFrame({
            columnNames: columnNames,
            rows: rows
        });

        await df.asCSV().writeFile(filename);
    } catch (error) {
        logger.error(error);
    }
};
