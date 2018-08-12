import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import { Logger } from 'structured-log';

export interface IConfigController {
    saveConfig: (config: any) => void;
    getConfig: <T>() => Promise<T | undefined>;
}

export class ConfigController implements IConfigController {
    private readonly logger: Logger;
    private readonly configFile: string;

    public constructor(
        configFile: string,
        logger: Logger
    ) {
        this.configFile = configFile;
        this.logger = logger;
    }

    public async saveConfig(config: any) {
        try {
            // Check for config folder
            const folder = path.dirname(this.configFile);
            if (!fs.existsSync(folder)) {
                console.log('No folder found: ' + folder);
                fs.mkdirSync(folder);
                console.log('Folder Created');
            }
            // Convert to json
            const json = JSON.stringify(config, undefined, 4);
            // Write to file
            await util.promisify(fs.writeFile)(this.configFile, json, 'utf8');
        } catch (error) {
            throw new Error('Error when saving config: ' + error);
        }
    }

    public async getConfig<T>(): Promise<T | undefined> {
        try {
            // If no config file exists
            if (!fs.existsSync(this.configFile)) {
                console.log('No file found: ' + this.configFile);

                // Create empty config
                const newConf = {} as T;
                this.saveConfig(newConf);
                // Return config
                return newConf;
            }

            // Read config file for raw json
            const fileData = await util.promisify(fs.readFile)(this.configFile);
            // Parse json for config file and return it
            return JSON.parse(
                fileData.toString('utf8')
            ) as T;
        } catch (error) {
            throw new Error('Error when getting config: ' + error);
        }
    }
}
