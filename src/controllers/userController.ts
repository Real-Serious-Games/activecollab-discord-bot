import * as fs from 'fs';
import * as path from 'path';
import * as UserConfig from '../models/userConfig';
import * as util from 'util';
import { Logger } from 'structured-log';
import * as discord from 'discord.js';

const configPath = 'Config/UserConfig.json';

const saveConfig = async (config: UserConfig.Config) => {
    try {
        // Check for config folder
        const folder = path.dirname(configPath);
        if (!fs.existsSync(folder)) {
            console.log('No folder found: ' + folder);
            fs.mkdirSync(folder);
            console.log('Folder Created');
        }
        // Convert to json
        const json = JSON.stringify(config, undefined, 4);
        // Write to file
        await util.promisify(fs.writeFile)(configPath, json, 'utf8');
    } catch (error) {
        throw new Error('Error when saving config: ' + error);
    }
};

const getConfig = async (): Promise<UserConfig.Config> => {
    try {
        // If no config file exists
        if (!fs.existsSync(configPath)) {
            console.log('No file found: ' + configPath);

            // Create empty config
            const newConf: UserConfig.Config = {
                Users: []
            };
            saveConfig(newConf);
            // Return config
            return newConf;
        }

        // Read config file for raw json
        const fileData = await util.promisify(fs.readFile)(configPath);
        // Parse json for config file and return it
        return JSON.parse(
            fileData.toString('utf8')
        ) as UserConfig.Config;
    } catch (error) {
        throw new Error('Error when getting config: ' + error);
    }
};

export const getUser = async (
    discordUser: discord.User
) => {
    try {
        const config = await getConfig();
        const matchingUser = config.Users.find(
            u => u.discord_id == discordUser.tag
        );
        if (matchingUser) {
            return matchingUser;
        } else {
            const user: UserConfig.User = {
                discord_id: discordUser.tag,
                active_collab_id: -1,
                active_collab_name: '',
                daily_report_subs: []
            };
            config.Users.push(user);
            saveConfig(config);
            return user;
        }
    } catch (error) {
        throw new Error('Error when setting user: ' + error);
    }
};

export const setUser = async (user: UserConfig.User) => {
    try {
        const config = await getConfig();
        const matchingUser = config.Users.find(
            u => u.discord_id == user.discord_id
        );
        if (matchingUser) {
            const newUsers = config.Users.map(u => {
                if (u.discord_id === user.discord_id) {
                    return user;
                } else {
                    return u;
                }
            });
            const newConfig: UserConfig.Config = {
                Users: newUsers
            };
            saveConfig(newConfig);
            return;
        } else {
            config.Users.push(user);
            saveConfig(config);
        }
    } catch (error) {
        throw new Error('Error when setting user: ' + error);
    }
};

export const getSubscriptions = async (
    discordUser: discord.User
) => {
    try {
        const user = await getUser(discordUser);
        return user.daily_report_subs;
    } catch (error) {
        throw new Error('Error when setting user: ' + error);
    }
};

export const addSubscription = async (
    discordUser: discord.User,
    projectID: string
) => {
    try {
        const user = await getUser(discordUser);
        if (user.daily_report_subs.filter(i => i === projectID).length === 0) {
            user.daily_report_subs.push(projectID);
        }
        const config = await getConfig();
        const newUsers = config.Users.map(u => {
            if (u.discord_id === user.discord_id) {
                return user;
            } else {
                return u;
            }
        });
        const newConfig: UserConfig.Config = {
            Users: newUsers
        };
        saveConfig(newConfig);
        return;
    } catch (error) {
        throw new Error('Error when subscribing to project: ' + error);
    }
};

export const rmSubscription = async (
    discordUser: discord.User,
    projectID: string
) => {
    try {
        const user = await getUser(discordUser);
        user.daily_report_subs = user.daily_report_subs
            .filter(i => i !== projectID);
        const config = await getConfig();
        const newUsers = config.Users.map(u => {
            if (u.discord_id === user.discord_id) {
                return user;
            } else {
                return u;
            }
        });
        const newConfig: UserConfig.Config = {
            Users: newUsers
        };
        saveConfig(newConfig);
        return;
    } catch (error) {
        throw new Error('Error when unsubscribing from project: ' + error);
    }
};

export const addUserCommand = async (
    discordUser: discord.User,
    activeCollabId: number,
    logger: Logger,
    message: discord.Message
): Promise<void> => {
    message.channel.startTyping();
    message.channel.send(`Adding user: ` + discordUser.tag);
    try {
        await setUser({
            discord_id: discordUser.tag,
            active_collab_id: activeCollabId,
            active_collab_name: '',
            daily_report_subs: []
        });
    } catch (e) {
        message
            .channel
            .send('There was an error getting the users config');
        logger.error(`Error getting users config ` + e);
    }
    message.channel.stopTyping();
};

export const userConfigParseCommand = (
    args: string[],
    logger: Logger,
    message: discord.Message
) => {
    if (args.length > 0) {
        if (args[0].toLowerCase() === 'add') {
            if (message.mentions.users.size > 0) {
                const discordUser = message.mentions.users.first();
                const acID = parseInt(args[2]);
                if (!discordUser || !acID) {
                    message.channel.send('Wrong syntax');
                } else {
                    addUserCommand(discordUser, acID, logger, message);
                }
            } else {
                const acID = parseInt(args[1]);
                if (!acID) {
                    message.channel.send('Wrong syntax');
                } else {
                    addUserCommand(message.author, acID, logger, message);
                }
            }
        }
    }
};
