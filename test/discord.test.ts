import { TextChannel, Client, RichEmbed } from 'discord.js';
import * as discord from 'discord.js';
import { Logger } from 'structured-log';

import { DiscordController, IDiscordController } from '../src/controllers/discord';
import { createClient } from 'http';
import { AssertionError } from 'assert';
import { IMappingController } from '../src/controllers/mapping';
import { ICommandController } from '../src/controllers/command';

describe('calling sendMessageToChannel', () => {
    it('should send message to channel when channel is valid', () => {
        const message: discord.RichEmbed = new RichEmbed();

        const channelStub = jest.fn(() => Promise.resolve());

        const channel: Partial<TextChannel> = {
            send: channelStub
        };

        const discordController = setupDiscordController();

        discordController.sendMessageToChannel(message, <TextChannel>channel);
        expect(channelStub).toBeCalledWith(message);
    }),

    it('should error when channel is invalid', () => {
        const discordController = setupDiscordController();

        expect(() => discordController.sendMessageToChannel(undefined, undefined))
            .toThrow('Cannot send without a channel: undefined');
    });
});

describe('calling determineChannel', () => {
    it('should return channel when given valid project ID', () => {
        const framework = setupTestFramework();

        const projectId = 1;
        const expectedChannel = framework.allChannels.first();

        expect(framework.discordController.determineChannel(projectId))
            .toEqual(framework.allChannels.first());
        expect(framework.mappingController.getChannel)
            .toHaveBeenCalled();
    });

    it('should return ID not found error when project ID not found', () => {
        const cantFindValue = true;

        const framework = setupTestFramework(undefined, cantFindValue);

        const projectId = 1;

        expect(() => framework.discordController.determineChannel(projectId))
            .toThrow(`Project ID not found: ${projectId}`);
        expect(framework.mappingController.getChannel)
            .toHaveBeenCalled();
    });

    it('should return invalid ID error when project ID not valid', () => {
        const framework = setupTestFramework();

        const invalidProjectId = undefined;

        expect(() => framework.discordController.determineChannel(invalidProjectId))
            .toThrow(`Project ID not valid: undefined`);
        expect(framework.mappingController.getChannel)
            .toHaveBeenCalledTimes(0);
    });

    it('should return channel not found error when channel not found', () => {
        const nonExistantChannel = 'channel-that-doesnt-exist';
        
        const frameWork = setupTestFramework(nonExistantChannel);

        const projectId = 1;
        
        expect(() => frameWork.discordController.determineChannel(1))
            .toThrow(`Channel does not exist on Discord: ${nonExistantChannel}`);
        expect(frameWork.mappingController.getChannel)
            .toHaveBeenCalled;
    });
});

describe('calling getUserId', () => {
    it('should return user ID when input valid', () => {
        const username = 'username';
        const expectedId = 1;

        const members: Partial<discord.Collection<string, discord.GuildMember>> = {
            find: jest.fn().mockReturnValue({ 
                    user: { username: username },
                    id: expectedId
                }
            )
        };

        const guild: Partial<discord.Guild> = {
            members: members as discord.Collection<string, discord.GuildMember>
        };

        const guilds: Partial<discord.Collection<string, discord.Guild>> = {
            find: jest.fn().mockReturnValue(guild)
        };

        const client = setupMockDiscordClient(
            undefined, 
            undefined,
            undefined,
            guilds
        );

        const discordController = setupDiscordController(
            undefined,
            client as Client
        );

        expect(discordController.getUserId(username)).toEqual(expectedId);
    });

    it('should throw error when username invalid', () => {
        const invalidUsername = undefined;

        const discordController = setupDiscordController();

        expect(() => discordController.getUserId(invalidUsername))
            .toThrow(`Username not valid: ${invalidUsername}`);
    });

    it('should throw error when username not found in guild', () => {
        const username = 'username';
        const expectedId = 1;

        const members: Partial<discord.Collection<string, discord.GuildMember>> = {
            find: jest.fn().mockReturnValue(undefined)
        };

        const guild: Partial<discord.Guild> = {
            members: members as discord.Collection<string, discord.GuildMember>
        };

        const guilds: Partial<discord.Collection<string, discord.Guild>> = {
            find: jest.fn().mockReturnValue(guild)
        };

        const client = setupMockDiscordClient(
            undefined, 
            undefined,
            undefined,
            guilds
        );

        const discordController = setupDiscordController(
            undefined,
            client as Client
        );

        expect(() => discordController.getUserId(username))
            .toThrow(`User not found in guild: ${username}`);
    });
});

describe('when client receives messages', () => {
    it('should call commandController.listTasksForUser when command is "!TASKS LIST"', () => {
        const client = new Client();

        client.login = jest.fn(() => Promise.resolve());

        const commandControllerMock: Partial<ICommandController> = {
            listTasksForUser: jest.fn(() => Promise.resolve(new RichEmbed()))
        };

        const discordController = setupDiscordController(
            undefined,
            client,
            undefined,
            commandControllerMock
        );

        const message = {
            content: '!TASKS LIST',
            author: 'author',
            channel: {
                send: jest.fn(() => Promise.resolve())
            }
        };

        client.emit('message', message);

        expect(commandControllerMock.listTasksForUser).toHaveBeenCalledWith(message.author);
    });
    it('should call commandController.tasksDueThisWeekForProject when command is ' 
        + ' "!tasks due" and command sent from project channel', (done) => {
        expect.assertions(1);

        const client = new Client();

        client.login = jest.fn(() => Promise.resolve());

        const projectId = 0;

        const commandControllerMock: Partial<ICommandController> = {
            tasksDueThisWeekForProject: jest.fn(() => {
                done();
                return Promise.resolve();
            })
        };

        const mappingControllerMock = {
            getProjectId: jest.fn().mockReturnValue(projectId)
        };

        const discordController = setupDiscordController(
            undefined,
            client,
            mappingControllerMock,
            commandControllerMock
        );

        const sentMessage = {
            edit: jest.fn(() => Promise.resolve())
        };

        const message = {
            content: '!tasks due',
            author: 'author',
            channel: {
                send: jest.fn(() => Promise.resolve(sentMessage)),
                startTyping: jest.fn(() => Promise.resolve()),
                stopTyping: jest.fn(() => Promise.resolve()),
                name: 'channel',
                type: 'text'
            }
        };

        client.emit('message', message);

        expect(message.channel.send)
            .toHaveBeenCalledWith('Getting tasks due this week...');
    });

    it('should not call commandController.tasksDueThisWeekForProject and send warning message'
        + ' when command is  "!tasks due" and channel type is not text', () => {
        const client = new Client();

        client.login = jest.fn(() => Promise.resolve());

        const commandControllerMock: Partial<ICommandController> = {
            tasksDueThisWeekForProject: jest.fn(() => Promise.resolve(new RichEmbed()))
        };

        const discordController = setupDiscordController(
            undefined,
            client,
            undefined,
            commandControllerMock
        );

        const message = {
            content: '!tasks due',
            author: 'author',
            channel: {
                send: jest.fn(() => Promise.resolve()),
                name: 'channel',
                type: 'voice'
            }
        };

        client.emit('message', message);

        expect(commandControllerMock.tasksDueThisWeekForProject)
            .toHaveBeenCalledTimes(0);
        expect(message.channel.send)
            .toBeCalledWith('!tasks due command must be called from a text channel');
    });

    it('should send error message and log when command is "!tasks due" and error ' 
        + 'getting project ID', done => {
        expect.assertions(2);
            
        const client = new Client();

        client.login = jest.fn(() => Promise.resolve());

        const projectId = 0;
        const error = 'error';
        const channelName = 'channel';

        let sentMessageValue = '';

        const commandControllerMock: Partial<ICommandController> = {
            tasksDueThisWeekForProject: jest.fn(() => Promise.resolve(new RichEmbed()))
        };

        const loggerMock: Partial<Logger> = {
            warn: jest.fn(value => {
                expect(value).toBe(`Error getting tasks due for week: Error: ${error}`);
                expect(sentMessageValue).toBe(`Unable to find ActiveCollab project for channel ` 
                    + channelName);
                done();
            })
        };

        const mappingControllerMock = {
            getProjectId: jest.fn(() => { throw Error(error); })
        };

        const discordController = setupDiscordController(
            undefined,
            client,
            mappingControllerMock,
            commandControllerMock,
            loggerMock
        );

        const sentMessage = {
            edit: jest.fn(value => {
                sentMessageValue = value;
                return Promise.resolve();
            })
        };

        const message = {
            content: '!tasks due',
            author: 'author',
            channel: {
                send: jest.fn(() => Promise.resolve(sentMessage)),
                startTyping: jest.fn(() => Promise.resolve()),
                stopTyping: jest.fn(() => Promise.resolve()),
                type: 'text',
                name: channelName
            }
        };

        client.emit('message', message);
    });

    it('should send message when command is unknown', () => {
        const unknownCommand = '!unknown';
        
        const client = new Client();

        client.login = jest.fn(() => Promise.resolve());

        const commandControllerMock: Partial<ICommandController> = {
            listTasksForUser: jest.fn(() => Promise.resolve(new RichEmbed()))
        };

        const discordController = setupDiscordController(
            undefined,
            client,
            undefined,
            commandControllerMock
        );

        const message = {
            content: unknownCommand,
            author: 'author',
            channel: {
                send: jest.fn(() => Promise.resolve())
            }
        };

        client.emit('message', message);

        expect(message.channel.send).toHaveBeenCalledWith(`Unknown command, ` 
            + `*${unknownCommand}*, use *!help* or *!commands*`);
    });

    it('should send message when command is unknown task command', () => {
        const unknownCommand = '!tasks unknown';
        
        const client = new Client();

        client.login = jest.fn(() => Promise.resolve());

        const commandControllerMock: Partial<ICommandController> = {
            listTasksForUser: jest.fn(() => Promise.resolve(new RichEmbed()))
        };

        const discordController = setupDiscordController(
            undefined,
            client,
            undefined,
            commandControllerMock
        );

        const message = {
            content: unknownCommand,
            author: 'author',
            channel: {
                send: jest.fn(() => Promise.resolve())
            }
        };

        client.emit('message', message);

        expect(message.channel.send).toHaveBeenCalledWith(`Unknown command, ` 
            + `*${unknownCommand}*, use *!tasks help* or *!tasks commands* ` 
            + `for list of commands.`);
    });

    it('should call commandController.listTasksForUser when command is "!tasks list for @user"', () => {
        const mentionedUser = 'user';
        
        const client = new Client();

        client.login = jest.fn(() => Promise.resolve());

        const commandControllerMock: Partial<ICommandController> = {
            listTasksForUser: jest.fn(() => Promise.resolve(new RichEmbed()))
        };

        const discordController = setupDiscordController(
            undefined,
            client,
            undefined,
            commandControllerMock
        );

        const message = {
            content: '!tasks list for @user',
            author: {
                bot: false
            },
            mentions: {
                users: {
                    first: jest.fn().mockReturnValue(mentionedUser)
                }
            },
            channel: {
                send: jest.fn(() => Promise.resolve())
            }
        };

        client.emit('message', message);

        expect(commandControllerMock.listTasksForUser).toHaveBeenCalledWith(mentionedUser);
    });

    it('should send list of commands when command is !help', () => {
        const client = new Client();

        client.login = jest.fn(() => Promise.resolve());
        const discordController = setupDiscordController(
            undefined,
            client
        );

        const message = {
            content: '!help',
            author: {
                bot: false
            },
            channel: {
                send: jest.fn(() => Promise.resolve())
            }
        };

        const expectedHelp = new RichEmbed()
            .setTitle('Commands')
            .addField('!tasks', 
                '*!tasks list* - lists your tasks.\n' +
                '*!tasks list for @user* - lists tasks for mentioned user.\n' +
                '*!tasks due* - lists tasks due this week for current channel\'s project\n'
            );

        client.emit('message', message);

        expect(message.channel.send).toHaveBeenCalledWith(expectedHelp);
    });

    it('should send list of commands when command is !commands', () => {
        const client = new Client();

        client.login = jest.fn(() => Promise.resolve());
        const discordController = setupDiscordController(
            undefined,
            client
        );

        const message = {
            content: '!commands',
            author: {
                bot: false
            },
            channel: {
                send: jest.fn(() => Promise.resolve())
            }
        };

        const expectedHelp = new RichEmbed()
            .setTitle('Commands')
            .addField('!tasks', 
                '*!tasks list* - lists your tasks.\n' +
                '*!tasks list for @user* - lists tasks for mentioned user.\n' +
                '*!tasks due* - lists tasks due this week for current channel\'s project\n'
        );

        client.emit('message', message);

        expect(message.channel.send).toHaveBeenCalledWith(expectedHelp);
    });

    it('should do nothing when message doesnt start with prefix or message sent with bot', () => {
        const client = new Client();

        client.login = jest.fn(() => Promise.resolve());

        const commandControllerMock: Partial<ICommandController> = {
            listTasksForUser: jest.fn(() => Promise.resolve(new RichEmbed()))
        };

        const discordController = setupDiscordController(
            undefined,
            client,
            undefined,
            commandControllerMock
        );

        let message = {
            content: 'tasks list for @user',
            author: {
                bot: false
            }
        };

        client.emit('message', message);

        message = {
            content: '!tasks list for @user',
            author: {
                bot: true
            }
        };

        client.emit('message', message);

        expect(commandControllerMock.listTasksForUser).toHaveBeenCalledTimes(0);
    });

    it('should do nothing when message is empty and starts with prefix', () => {
        const client = new Client();

        client.login = jest.fn(() => Promise.resolve());

        const commandControllerMock: Partial<ICommandController> = {
            listTasksForUser: jest.fn(() => Promise.resolve(new RichEmbed()))
        };

        const discordController = setupDiscordController(
            undefined,
            client,
            undefined,
            commandControllerMock
        );

        const message = {
            content: '!',
            author: {
                bot: false
            }
        };

        client.emit('message', message);

        expect(commandControllerMock.listTasksForUser).toHaveBeenCalledTimes(0);
    });
});

function setupTestFramework(
    channelToReturn: string = 'activecollab-notifications',
    shouldReturnUndefinedChannel: boolean = false
) {
        const allChannels = 
            new discord.Collection<string, discord.Channel>();

        allChannels.set(   
            '1',
            {
                name: 'activecollab-notifications'
            } as discord.TextChannel
        );

        const channels = {
            findAll: jest.fn().mockReturnValue(allChannels)
        };

        const client = setupMockDiscordClient(undefined, undefined, channels);

        const mappingController: Partial<IMappingController> = { 
            getChannel: jest.fn().mockReturnValue(
                shouldReturnUndefinedChannel 
                ? undefined 
                : channelToReturn
        )};

        const discordController = setupDiscordController(
            undefined,
            <Client>client,
            mappingController
        );

        return {
            client: client,
            allChannels: allChannels,
            mappingController: mappingController,
            discordController: discordController
        };
}

function setupDiscordController(
    token = '',
    client?: Client,
    mappingController?: Partial<IMappingController>,
    commandController?: Partial<ICommandController>, 
    logger?: Partial<Logger>
) {
    if (!client) {
        client = <Client>setupMockDiscordClient();
    }

    if (!mappingController) {
        mappingController = {
            getChannel: jest.fn().mockReturnValue('channel')
        };
    }

    if (!commandController) {
        commandController = {
            listTasksForUser: jest.fn(() => Promise.resolve(new RichEmbed()))
        };
    }

    if (!logger) {
        logger = {
            warn: jest.fn()
        };
    }

    return new DiscordController(
        token,
        client,
        mappingController as IMappingController,
        commandController as ICommandController,
        logger,
        '!',
        'REAL SERIOUS GAMGES'
    );
}

function setupMockDiscordClient (
    on = jest.fn(),
    login?,
    channels: Partial<discord.Collection<string, discord.Channel>> = {
        findAll: jest.fn()
    },
    guilds: Partial<discord.Collection<string, discord.Guild>> = {
        find: jest.fn()
    }
): Partial<Client> {
    if (login === undefined) {
        const loginStub = jest.fn(() => Promise.resolve());
        login = loginStub;
    }

    const client: Partial<Client> = {
        on: jest.fn(),
        login: login,
        channels: <discord.Collection<string, discord.Channel>>channels,
        guilds: <discord.Collection<string, discord.Guild>>guilds
    };

    return client;
}