import { TextChannel, Client, RichEmbed, Collection, Channel, Guild } from 'discord.js';
import { Logger } from 'structured-log';

import { DiscordController } from '../src/controllers/discord';
import { DiscordControllerBuilder } from './builders/discordControllerBuilder';
import { MappingControllerMockBuilder } from './builders/mappingControllerMockBuilder';
import { DiscordClientMockBuilder } from './builders/discordClientMockBuilder';
import { map } from 'fp-ts/lib/Either';
import { LoggerMockBuilder } from './builders/loggerMockBuilder';
import { CommandControllerMockBuilder } from './builders/commandControllerMockBuilder';

describe('calling sendMessageToChannel', () => {
    it('should send message to channel when channel is valid', () => {
        const message: RichEmbed = new RichEmbed();

        const channel: Partial<TextChannel> = {
            send: jest.fn(() => Promise.resolve())
        };

        const discordController = new DiscordControllerBuilder().build();

        discordController.sendMessageToChannel(message, <TextChannel>channel);
        expect(channel.send).toBeCalledWith(message);
    }),

    it('should error when channel is invalid', () => {
        const discordController = new DiscordControllerBuilder().build();

        expect(() => discordController.sendMessageToChannel(undefined, undefined))
            .toThrow('Cannot send without a channel: undefined');
    });
});

describe('calling determineChannels', () => {
    const projectId = 1;
    
    const guildNames = [
        'guild 1',
        'guild 2'
    ];

    const mappingChannels = [
        {
            projectId: projectId,
            channelName: 'channel',
            guildIndex: 0
        },
        {
            projectId: projectId,
            channelName: 'channel 2',
            guildIndex: 1
        }
    ];

    it('should return channels when given valid project ID', () => {
        const mappingControllerMock = new MappingControllerMockBuilder()
            .withGetChannels(jest.fn().mockReturnValue(mappingChannels))
            .build();

        const clientChannels = new Collection<string, Channel>();

        clientChannels.set(   
            '1',
            {
                name: 'channel',
                guild: { name: guildNames[0]}
            } as TextChannel
        );

        clientChannels.set(   
            '2',
            {
                name: 'channel 2',
                guild: { name: guildNames[1]}
            } as TextChannel
        );

        clientChannels.set(   
            '3',
            {
                name: 'channel 3',
                guild: { name: guildNames[0]}
            } as TextChannel
        );

        clientChannels.set(   
            '4',
            {
                name: 'channel',
                guild: { name: guildNames[1]}
            } as TextChannel
        );

        const clientMock = new DiscordClientMockBuilder()
            .withChannels({
                findAll: jest.fn().mockReturnValue(clientChannels)
            })
            .build();

        const discordController = new DiscordControllerBuilder()
            .withMappingController(mappingControllerMock)
            .withClient(clientMock)
            .withGuildNames(guildNames)
            .build();

        const returnedChannels = discordController.determineChannels(projectId);

        expect(returnedChannels.length).toEqual(2);
        expect(returnedChannels[0]).toEqual(clientChannels.first());
    });

    it ('should return found channels when given valid project ID and log warning ' 
        + ' when not all channels found', () => {
        const mappingControllerMock = new MappingControllerMockBuilder()
            .withGetChannels(jest.fn().mockReturnValue(mappingChannels))
            .build();

        const clientChannels = new Collection<string, Channel>();

        clientChannels.set(   
            '1',
            {
                name: 'channel',
                guild: { name: guildNames[0]}
            } as TextChannel
        );

        const clientMock = new DiscordClientMockBuilder()
            .withChannels({
                findAll: jest.fn().mockReturnValue(clientChannels)
            })
            .build();

        const warnMock = jest.fn();

        const loggerMock = new LoggerMockBuilder()
            .withWarn(warnMock)
            .build();

        const discordController = new DiscordControllerBuilder()
            .withMappingController(mappingControllerMock)
            .withClient(clientMock)
            .withGuildNames(guildNames)
            .withLogger(loggerMock)
            .build();

        const returnedChannels = discordController.determineChannels(projectId);

        expect(returnedChannels.length).toEqual(1);
        expect(warnMock).toBeCalledWith('Unable to find channels: '
            + `${mappingChannels[1].channelName} (${guildNames[mappingChannels[1].guildIndex]})`);
    });

    it('should return ID not found error when channels for project ID not found', () => {
        const mappingControllerMock = new MappingControllerMockBuilder()
            .withGetChannels(jest.fn().mockReturnValue(undefined))
            .build();

        const discordController = new DiscordControllerBuilder()
            .withMappingController(mappingControllerMock)
            .build();

        const projectId = 1;

        expect(() => discordController.determineChannels(projectId))
            .toThrow(`Channels not found for project ID: ${projectId}`);
    });

    it('should return invalid ID error when project ID not valid', () => {
        const discordController = new DiscordControllerBuilder().build();

        const invalidProjectId = undefined;

        expect(() => discordController.determineChannels(invalidProjectId))
            .toThrow(`Project ID not valid: ${invalidProjectId}`);
    });

    it('should return channel not found error when channel not found', () => {
        const mappingControllerMock = new MappingControllerMockBuilder()
            .withGetChannels(jest.fn().mockReturnValue(mappingChannels))
            .build();

        const clientChannels = new Collection<string, Channel>();

        clientChannels.set(   
            '1',
            {
                name: 'non matching channel',
                guild: { name: guildNames[0]}
            } as TextChannel
        );

        const clientMock = new DiscordClientMockBuilder()
            .withChannels({
                findAll: jest.fn().mockReturnValue(clientChannels)
            })
            .build();

        const discordController = new DiscordControllerBuilder()
            .withClient(clientMock)
            .withGuildNames(guildNames)
            .withMappingController(mappingControllerMock)
            .build();
        
        expect(() => discordController.determineChannels(projectId))
            .toThrow(`Channels do not exist on Discord: ` 
                + `${mappingChannels[0].channelName} (${guildNames[mappingChannels[0].guildIndex]}), `
                + `${mappingChannels[1].channelName} (${guildNames[mappingChannels[1].guildIndex]})`
            );
    });
});

describe('calling getUserId', () => {
    it('should return user ID when input valid and exists in a guild', () => {
        const username = 'username';
        const expectedId = 1;

        const guildsMock: Partial<Collection<string, Guild>> = {
            find: jest.fn().mockReturnValue({
                members: {
                    find: jest.fn().mockReturnValue({ 
                            user: { username: username },
                            id: expectedId
                        }
                    )
                }
            })
        };

        const clientMock = new DiscordClientMockBuilder()
            .withGuilds(guildsMock)
            .build();

        const discordController = new DiscordControllerBuilder()
            .withClient(clientMock)
            .build();

        expect(discordController.getUserId(username)).toEqual(expectedId);
    });

    it('should throw error when guilds not found', () => {
        const guildsMock: Partial<Collection<string, Guild>> = {
            find: jest.fn().mockReturnValue(undefined)
        };

        const guilds = ['1'];

        const clientMock = new DiscordClientMockBuilder()
            .withGuilds(guildsMock)
            .build();

        const discordController = new DiscordControllerBuilder()
            .withClient(clientMock)
            .withGuildNames(guilds)
            .build();

        expect(() => discordController.getUserId('username'))
            .toThrow(`Guilds not found: ${guilds}`);
    });

    it('should throw error when username invalid', () => {
        const invalidUsername = undefined;

        const discordController = new DiscordControllerBuilder()
            .build();

        expect(() => discordController.getUserId(invalidUsername))
            .toThrow(`Username not valid: ${invalidUsername}`);
    });

    it('should throw error when username not found in guild', () => {
        const username = 'username';

        const guildsMock: Partial<Collection<string, Guild>> = {
            find: jest.fn().mockReturnValue({
                members: {
                    find: jest.fn().mockReturnValue(undefined)
                }
            })
        };

        const clientMock = new DiscordClientMockBuilder()
            .withGuilds(guildsMock)
            .build();

        const discordController = new DiscordControllerBuilder()
            .withClient(clientMock)
            .build();

        expect(() => discordController.getUserId(username))
            .toThrow(`User not found: ${username}`);
    });
});

describe('client receiving message', () => {
    describe('when message is "!tasks due"', () => {   
        it('should call commandController.tasksDueThisWeekForProject when command is' 
            + ' sent from project channel', done => {
            const client = setupClient();

            const commandControllerMock = new CommandControllerMockBuilder()
                .withTasksDueThisWeekForProject(jest.fn(async () => done()))
                .build();

            const mappingControllerMock = new MappingControllerMockBuilder()
                .withGetProjectId(jest.fn().mockReturnValue(0))
                .build();

            const discordController = new DiscordControllerBuilder()
                .withMappingController(mappingControllerMock)
                .withCommandController(commandControllerMock)
                .withClient(client)
                .build();

            const sentMessage = {
                edit: jest.fn(() => Promise.resolve())
            };

            const message = {
                content: '!tasks due',
                author: 'author',
                channel: {
                    send: jest.fn(async () => sentMessage),
                    startTyping: jest.fn(() => Promise.resolve()),
                    stopTyping: jest.fn(() => Promise.resolve()),
                    name: 'channel',
                    type: 'text'
                }
            };

            client.emit('message', message);
        });

        it('should send warning message when channel type is not text' , () => {
            const client = setupClient();

            const commandControllerMock = new CommandControllerMockBuilder()
                .withTasksDueThisWeekForProject(jest.fn(() => Promise.resolve(new RichEmbed())))
                .build();

            const discordController = new DiscordControllerBuilder()
                .withCommandController(commandControllerMock)
                .withClient(client)
                .build();

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

            expect(message.channel.send)
                .toBeCalledWith('!tasks due command must be called from a text channel' 
                    + ' associated with a project');
        });

        it('should send error message and log when error getting project ID', done => {
            expect.assertions(2);
                
            const client = setupClient();

            const projectId = 0;
            const error = 'error';
            const channelName = 'channel';

            let sentMessageValue = '';

            const loggerMock = new LoggerMockBuilder()
                .withWarn(jest.fn().mockImplementation(value => {
                    expect(value).toBe(`Error getting tasks due for week: Error: ${error}`);
                    expect(sentMessageValue).toBe(`Unable to find ActiveCollab project for channel ` 
                        + channelName);
                    done();
                }))
                .build();

            const mappingControllerMock = new MappingControllerMockBuilder()
                .withGetProjectId(jest.fn(() => { throw Error(error); }))
                .build();

            const discordController = new DiscordControllerBuilder()
                .withMappingController(mappingControllerMock)
                .withClient(client)
                .withLogger(loggerMock)
                .build();

            const sentMessage = {
                edit: jest.fn(async value => {
                    sentMessageValue = value;
                })
            };

            const message = {
                content: '!tasks due',
                author: 'author',
                channel: {
                    send: jest.fn(async () => sentMessage),
                    startTyping: jest.fn(() => Promise.resolve()),
                    stopTyping: jest.fn(() => Promise.resolve()),
                    type: 'text',
                    name: channelName
                }
            };

            client.emit('message', message);
        });
    });

    describe('when command is "!tasks list"', () => {
        it('should call commandController.listTasksForUser when command all caps', done => {
            expect.assertions(3);
    
            const client = setupClient();
    
            const returnedTasks = new RichEmbed();
    
            const commandControllerMock = new CommandControllerMockBuilder()
                .withListTasksForUser(jest.fn(() => Promise.resolve(returnedTasks)))
                .build();
    
            const discordController = new DiscordControllerBuilder()
                .withCommandController(commandControllerMock)
                .withClient(client)
                .build();
    
            const sentMessage = {
                edit: jest.fn(async value => {
                    expect(commandControllerMock.tasksForuser).toBeCalledWith(message.author);
                    expect(value).toBe(returnedTasks);
                    expect(message.channel.startTyping).toBeCalled();
                    done();
                })
            };
    
            const message = {
                content: '!TASKS LIST',
                author: 'author',
                channel: {
                    send: jest.fn(async () => sentMessage),
                    startTyping: jest.fn(() => Promise.resolve()),
                    stopTyping: jest.fn(() => Promise.resolve()),
                }
            };
    
            client.emit('message', message);
        });

        it('should call commandController.listTasksForUser and send  '
            + 'message when command is "!tasks list for @user"', done => {
            expect.assertions(3);

            const client = setupClient();

            const returnedTasks = new RichEmbed();

            const commandControllerMock = new CommandControllerMockBuilder()
                .withListTasksForUser(jest.fn(() => Promise.resolve(returnedTasks)))
                .build();

            const discordController = new DiscordControllerBuilder()
                .withClient(client)
                .withCommandController(commandControllerMock)
                .build();

            const sentMessage = {
                edit: jest.fn(async value => {
                    expect(commandControllerMock.tasksForuser).toBeCalled();
                    expect(value).toBe(returnedTasks);
                    expect(message.channel.startTyping).toBeCalled();
                    done();
                })
            };

            const message = {
                content: '!tasks list for @user',
                author: {
                    bot: false
                },
                mentions: {
                    users: {
                        first: jest.fn().mockReturnValue('mentionedUser')
                    }
                },
                channel: {
                    send: jest.fn(async () => sentMessage),
                    startTyping: jest.fn(() => Promise.resolve()),
                    stopTyping: jest.fn(() => Promise.resolve()),
                }
            };

            client.emit('message', message);
        });
    });

    it('should send message when command is unknown', () => {
        const unknownCommand = '!unknown';
        
        const client = setupClient();

        const discordController = new DiscordControllerBuilder()
            .withClient(client)
            .build();

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
        
        const client = setupClient();

        const discordController = new DiscordControllerBuilder()
            .withClient(client)
            .build();

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

    it('should send list of commands when command is !help', () => {
        const client = setupClient();

        const discordController = new DiscordControllerBuilder()
            .withClient(client)
            .build();

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
        const client = setupClient();

        const discordController = new DiscordControllerBuilder()
            .withClient(client)
            .build();

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

    it(`should do nothing when message doesn't start with prefix or message sent with bot`, () => {
        const client = setupClient();

        const commandControllerMock = new CommandControllerMockBuilder()
            .build();

        const discordController = new DiscordControllerBuilder()
            .withClient(client)
            .withCommandController(commandControllerMock)
            .build();

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

        expect(commandControllerMock.tasksForuser).toHaveBeenCalledTimes(0);
    });

    it('should do nothing when message is empty and starts with prefix', () => {
        const client = setupClient();

        const commandControllerMock = new CommandControllerMockBuilder()
            .build();

        const discordController = new DiscordControllerBuilder()
            .withClient(client)
            .withCommandController(commandControllerMock)
            .build();

        const message = {
            content: '!',
            author: {
                bot: false
            }
        };

        client.emit('message', message);

        expect(commandControllerMock.tasksForuser).toHaveBeenCalledTimes(0);
    });
});

function setupClient() {
    const client = new Client();
    client.login = jest.fn(() => Promise.resolve());

    return client;
}