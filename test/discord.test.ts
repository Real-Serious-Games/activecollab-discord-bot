import { TextChannel, Client, RichEmbed, Collection, Channel, Guild } from 'discord.js';

import { DiscordControllerBuilder } from './builders/discordControllerBuilder';
import { MappingControllerMockBuilder } from './builders/mappingControllerMockBuilder';
import { DiscordClientMockBuilder } from './builders/discordClientMockBuilder';
import { LoggerMockBuilder } from './builders/loggerMockBuilder';
import { CommandControllerMockBuilder } from './builders/commandControllerMockBuilder';
import * as Moment from '../node_modules/moment';

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
                guild: { name: guildNames[0] }
            } as TextChannel
        );

        clientChannels.set(
            '2',
            {
                name: 'channel 2',
                guild: { name: guildNames[1] }
            } as TextChannel
        );

        clientChannels.set(
            '3',
            {
                name: 'channel 3',
                guild: { name: guildNames[0] }
            } as TextChannel
        );

        clientChannels.set(
            '4',
            {
                name: 'channel',
                guild: { name: guildNames[1] }
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

    it('should return found channels when given valid project ID and log warning '
        + ' when not all channels found', () => {
            const mappingControllerMock = new MappingControllerMockBuilder()
                .withGetChannels(jest.fn().mockReturnValue(mappingChannels))
                .build();

            const clientChannels = new Collection<string, Channel>();

            clientChannels.set(
                '1',
                {
                    name: 'channel',
                    guild: { name: guildNames[0] }
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
                guild: { name: guildNames[0] }
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
    it('should send help message when message is "!tasks"', done => {
        expect.assertions(1);

        const client = setupClient();

        const discordController = new DiscordControllerBuilder()
            .withClient(client)
            .build();

        const message = new MessageBuilder()
            .withContent('!tasks')
            .withSend(jest.fn(async value => {
                expect(value).toEqual(`Unknown command, *${message.content}*, `
                    + `use *!tasks help* or *!tasks commands* for list of commands.`);

                done();
            }))
            .build();

        client.emit('message', message);
    });

    it('should send help message when message is "!tasks" with unknown command', done => {
        expect.assertions(1);

        const client = setupClient();

        const discordController = new DiscordControllerBuilder()
            .withClient(client)
            .build();

        const message = new MessageBuilder()
            .withContent('!tasks unknown')
            .withSend(jest.fn(async value => {
                expect(value).toEqual(`Unknown command, *${message.content}*, `
                    + `use *!tasks help* or *!tasks commands* for list of commands.`);

                done();
            }))
            .build();

        client.emit('message', message);
    });

    describe('when message is "!tasks create"', () => {
        it('should call commandController.createTask when command'
            + ' is sent from project channel', done => {
                expect.assertions(2);

                const firstMessage = 'Creating task...';

                const client = setupClient();

                const commandControllerMock = new CommandControllerMockBuilder()
                    .build();

                const discordController = new DiscordControllerBuilder()
                    .withClient(client)
                    .withCommandController(commandControllerMock)
                    .build();

                const message = new MessageBuilder()
                    .withContent('!tasks create new task')
                    .withSend(jest.fn(async value => {
                        expect(value).toEqual(firstMessage);
                        done();
                    }))
                    .build();

                client.emit('message', message);

                expect(commandControllerMock.createTask).toHaveBeenCalled();
            });

        it('should call send message when creating task fails', done => {
            expect.assertions(2);

            const channelName = 'channelName';
            const firstMessage = 'Creating task...';
            const secondMessage = 'There was an error creating task for ' + channelName;
            let messagesSent = 0;

            const client = setupClient();

            const commandControllerMock = new CommandControllerMockBuilder()
                .withCreateTask(jest.fn(() => Promise.reject(new Error('Error'))))
                .build();

            const discordController = new DiscordControllerBuilder()
                .withCommandController(commandControllerMock)
                .withClient(client)
                .build();

            const message = new MessageBuilder()
                .withContent('!tasks create new task')
                .withChannelName(channelName)
                .withSend(jest.fn(async value => {
                    messagesSent++;

                    if (messagesSent === 1) {
                        expect(value).toEqual(firstMessage);
                    }
                    if (messagesSent === 2) {
                        expect(value).toEqual(secondMessage);
                        done();
                    }
                }))
                .build();

            client.emit('message', message);
        });

        it('should send warning message when channel type is not text', () => {
            const client = setupClient();

            const discordController = new DiscordControllerBuilder()
                .withClient(client)
                .build();

            const message = new MessageBuilder()
                .withContent('!tasks create new task')
                .withChannelType('voice')
                .build();

            client.emit('message', message);

            expect(message.channel.send)
                .toBeCalledWith('!tasks create command must be called from a text channel'
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
                .withError(jest.fn().mockImplementation(value => {
                    expect(value).toBe(`Error creating task: ${error}`);
                    expect(sentMessageValue).toBe(`There was an error creating task for ` + channelName);
                    done();
                }))
                .build();

            const mappingControllerMock = new MappingControllerMockBuilder()
                .withGetProjectId(jest.fn(() => { throw new Error(error); }))
                .build();

            const discordController = new DiscordControllerBuilder()
                .withMappingController(mappingControllerMock)
                .withClient(client)
                .withLogger(loggerMock)
                .build();

            const message = new MessageBuilder()
                .withContent('!tasks create task')
                .withSend(jest.fn(async value => {
                    sentMessageValue = value;
                }))
                .withChannelName(channelName)
                .build();

            client.emit('message', message);
        });
    });

    describe('when message is "!tasks due"', () => {
        it('should call commandController.tasksDueThisWeekForProject when command is'
            + ' sent from project channel', done => {
                const client = setupClient();

                const commandControllerMock = new CommandControllerMockBuilder()
                    .withTasksDueThisWeekForProject(jest.fn(async () => done()))
                    .build();

                const discordController = new DiscordControllerBuilder()
                    .withCommandController(commandControllerMock)
                    .withClient(client)
                    .build();

                const message = new MessageBuilder()
                    .withContent('!tasks due')
                    .withSend(jest.fn(() => Promise.resolve()))
                    .build();

                client.emit('message', message);
            });

        it('should send warning message when channel type is not text', () => {
            const client = setupClient();

            const commandControllerMock = new CommandControllerMockBuilder()
                .withTasksDueThisWeekForProject(jest.fn(() => Promise.resolve(new RichEmbed())))
                .build();

            const discordController = new DiscordControllerBuilder()
                .withCommandController(commandControllerMock)
                .withClient(client)
                .build();

            const message = new MessageBuilder()
                .withContent('!tasks due')
                .withChannelType('voice')
                .build();

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
            let messagesSent = 0;

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
                .withGetProjectId(jest.fn(() => { throw new Error(error); }))
                .build();

            const discordController = new DiscordControllerBuilder()
                .withMappingController(mappingControllerMock)
                .withClient(client)
                .withLogger(loggerMock)
                .build();

            const message = new MessageBuilder()
                .withContent('!tasks due')
                .withSend(jest.fn(async value => {
                    messagesSent++;

                    if (messagesSent === 2) {
                        sentMessageValue = value;
                    }
                }))
                .withChannelName(channelName)
                .build();

            client.emit('message', message);
        });
    });

    describe('when command is "!tasks list"', () => {
        it('should call commandController.listTasksForUser when command all caps', done => {
            expect.assertions(4);

            const client = setupClient();

            const firstMessage = 'Getting tasks...';
            const returnedTasks = new RichEmbed();
            let numberMessages = 0;

            const commandControllerMock = new CommandControllerMockBuilder()
                .withTasksForUser(jest.fn(() => Promise.resolve(returnedTasks)))
                .build();

            const discordController = new DiscordControllerBuilder()
                .withCommandController(commandControllerMock)
                .withClient(client)
                .build();

            const message = new MessageBuilder()
                .withContent('!TASKS LIST')
                .withSend(jest.fn(async value => {
                    numberMessages++;

                    if (numberMessages === 1) {
                        expect(value).toEqual(firstMessage);
                    }

                    if (numberMessages === 2) {
                        expect(commandControllerMock.tasksForUser).toBeCalledWith(message.author);
                        expect(value).toBe(returnedTasks);
                        expect(message.channel.startTyping).toBeCalled();
                        done();
                        return;
                    }
                }))
                .build();

            client.emit('message', message);
        });

        it('should call commandController.listTasksForUser and send  '
            + 'message when command is "!tasks list for @user"', done => {
                expect.assertions(3);

                const client = setupClient();
                let messagesSent = 0;
                const returnedTasks = new RichEmbed();

                const commandControllerMock = new CommandControllerMockBuilder()
                    .withTasksForUser(jest.fn(() => Promise.resolve(returnedTasks)))
                    .build();

                const discordController = new DiscordControllerBuilder()
                    .withClient(client)
                    .withCommandController(commandControllerMock)
                    .build();

                const message = new MessageBuilder()
                    .withContent('!tasks list for @user')
                    .withSend(jest.fn(async value => {
                        messagesSent++;

                        if (messagesSent === 2) {
                            expect(commandControllerMock.tasksForUser).toBeCalled();
                            expect(value).toBe(returnedTasks);
                            expect(message.channel.startTyping).toBeCalled();
                            done();
                        }
                    }))
                    .build();

                client.emit('message', message);
            });
    });

    describe('when message is "!tasks in <list>"', () => {
        it('should call commandController.taskInListForProject with list from '
            + 'command and project ID from channel', done => {
                const client = setupClient();

                const taskList = 'Selected for Development';
                const firstMessage = `Getting tasks in ${taskList}...`;
                const projectId = 0;
                const returnedTasks = new RichEmbed();
                let messagesSent = 0;

                const commandControllerMock = new CommandControllerMockBuilder()
                    .withTasksInListForProject(jest.fn(() => Promise.resolve(returnedTasks)))
                    .build();

                const mappingControllerMock = new MappingControllerMockBuilder()
                    .withGetProjectId(jest.fn().mockReturnValue(projectId))
                    .build();

                const discordController = new DiscordControllerBuilder()
                    .withClient(client)
                    .withMappingController(mappingControllerMock)
                    .withCommandController(commandControllerMock)
                    .build();

                const message = new MessageBuilder()
                    .withContent(`!tasks in ${taskList}`)
                    .withSend(jest.fn(async value => {
                        messagesSent++;

                        if (messagesSent === 1) {
                            expect(value).toEqual(firstMessage);
                        }

                        if (messagesSent === 2) {
                            expect(commandControllerMock.tasksInListForProject)
                                .toBeCalledWith(taskList, projectId);
                            done();
                        }
                    }))
                    .build();

                client.emit('message', message);
            });

        it('should send warning when channel type is not text', () => {
            const client = setupClient();

            const commandControllerMock = new CommandControllerMockBuilder()
                .withTasksInListForProject(jest.fn(() => Promise.resolve(new RichEmbed())))
                .build();

            const discordController = new DiscordControllerBuilder()
                .withCommandController(commandControllerMock)
                .withClient(client)
                .build();

            const message = new MessageBuilder()
                .withContent(`!tasks in list`)
                .withChannelType('voice')
                .build();

            client.emit('message', message);

            expect(message.channel.send)
                .toBeCalledWith('!tasks in list command must be called from'
                    + ' a text channel associated with a project');
        });

        it('should send warning and log error when error getting project ID', done => {
            const client = setupClient();

            const projectId = 0;
            const error = 'error';
            const list = 'List';
            const channelName = 'channel';

            let sentMessageValue = '';

            const loggerMock = new LoggerMockBuilder()
                .withError(jest.fn().mockImplementation(value => {
                    expect(value).toBe(`Error getting tasks in ${list}: Error: ${error}`);
                    expect(sentMessageValue).toBe(`There was an error creating task for `
                        + channelName);
                    done();
                }))
                .build();

            const mappingControllerMock = new MappingControllerMockBuilder()
                .withGetProjectId(jest.fn(() => { throw new Error(error); }))
                .build();

            const discordController = new DiscordControllerBuilder()
                .withMappingController(mappingControllerMock)
                .withClient(client)
                .withLogger(loggerMock)
                .build();

            const message = new MessageBuilder()
                .withContent(`!tasks in ${list}`)
                .withSend(jest.fn(async value => sentMessageValue = value))
                .withChannelName(channelName)
                .build();

            client.emit('message', message);
        });
    });

    describe('when command is "!spreadsheet"', () => {
        it('should reply with a rich embed', () => {
            const client = setupClient();

            const commandControllerMock = new CommandControllerMockBuilder()
                .withFilteredTasks(jest.fn(() => Promise.resolve(new RichEmbed())))
                .build();

            const discordController = new DiscordControllerBuilder()
                .withCommandController(commandControllerMock)
                .withClient(client)
                .build();

            const message = new MessageBuilder()
                .withContent('!spreadsheet ' + Moment().format('YYYY-MM-DD'))
                .build();

            client.emit('message', message);
        });

        it('should reply with syntax help if no arguments are given', () => {
            expect.assertions(2);
            const client = setupClient();

            const commandControllerMock = new CommandControllerMockBuilder()
                .withFilteredTasks(jest.fn(() => Promise.resolve(new RichEmbed())))
                .build();

            const discordController = new DiscordControllerBuilder()
                .withCommandController(commandControllerMock)
                .withClient(client)
                .build();

            const message = new MessageBuilder()
                .withContent('!spreadsheet')
                .build();

            client.emit('message', message);

            expect(message.channel.send)
                .toBeCalledWith('Eg: !spreadsheet ' + Moment().format('YYYY-MM-DD'));
            expect(message.channel.send)
                .toBeCalledWith('Wrong syntax. Please enter at least one date');
        });
    });

    it('should send message when command is unknown', () => {
        const unknownCommand = '!unknown';

        const client = setupClient();

        const discordController = new DiscordControllerBuilder()
            .withClient(client)
            .build();

        const message = new MessageBuilder()
            .withContent(unknownCommand)
            .build();

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

        const message = new MessageBuilder()
            .withContent(unknownCommand)
            .build();

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

        const message = new MessageBuilder()
            .withContent('!help')
            .build();

        const expectedHelp = new RichEmbed()
            .setTitle('Commands')
            .addField('!tasks',
                '**!tasks list** - lists your tasks.\n' +
                '**!tasks list for @user** - lists tasks for mentioned user.\n' +
                '**!tasks due** - lists tasks due this week for current channel\'s project\n' +
                '**!tasks create <task name>** - creates a task for current channel\'s project\n' +
                '**!tasks in <list>** - lists tasks in task list for current channel\'s project\n'
            )
            .addField('!spreadsheet',
                '**!spreadsheet <date>** - All time records since <date>.\n' +
                '**!spreadsheet <startdate> <enddate>** - All time records between <startdate> and <enddate>.\n' +
                'You can also add optional filters in the command:\n' +
                '**names=<name>** - This will only show times with <name> in thier task name\n' +
                '**names=<name>,<name>** - Filters are separated by commas\n' +
                '**names="<Name with spaces>"** - If your filter has spaces, wrap it in quotes\n' +
                '**projects=<ID>** - This will only show times from the project with the ID <ID>\n' +
                'Note: project ID can be found by looking in the URL in active collab\n' +
                '**projects=<ID>,<ID>** - Filters are separated by commas\n'
            );

        client.emit('message', message);

        expect(message.channel.send).toHaveBeenCalledWith(expectedHelp);
    });

    it('should send list of commands when command is !commands', () => {
        const client = setupClient();

        const discordController = new DiscordControllerBuilder()
            .withClient(client)
            .build();

        const message = new MessageBuilder()
            .withContent('!commands')
            .build();

        const expectedHelp = new RichEmbed()
            .setTitle('Commands')
            .addField('!tasks',
                '**!tasks list** - lists your tasks.\n' +
                '**!tasks list for @user** - lists tasks for mentioned user.\n' +
                '**!tasks due** - lists tasks due this week for current channel\'s project\n' +
                '**!tasks create <task name>** - creates a task for current channel\'s project\n' +
                '**!tasks in <list>** - lists tasks in task list for current channel\'s project\n'
            )
            .addField('!spreadsheet',
                '**!spreadsheet <date>** - All time records since <date>.\n' +
                '**!spreadsheet <startdate> <enddate>** - All time records between <startdate> and <enddate>.\n' +
                'You can also add optional filters in the command:\n' +
                '**names=<name>** - This will only show times with <name> in thier task name\n' +
                '**names=<name>,<name>** - Filters are separated by commas\n' +
                '**names="<Name with spaces>"** - If your filter has spaces, wrap it in quotes\n' +
                '**projects=<ID>** - This will only show times from the project with the ID <ID>\n' +
                'Note: project ID can be found by looking in the URL in active collab\n' +
                '**projects=<ID>,<ID>** - Filters are separated by commas\n'
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

        let message = new MessageBuilder()
            .withContent('tasks list for @user')
            .build();

        client.emit('message', message);

        message = new MessageBuilder()
            .withContent('!tasks list for @user')
            .build();

        client.emit('message', message);

        expect(commandControllerMock.tasksForUser).toHaveBeenCalledTimes(0);
    });

    it('should not split spaces into args that are wrapped in quotes', () => {
        const client = setupClient();

        const filterMock = jest.fn(() => Promise.resolve(new RichEmbed()));
        const commandControllerMock = new CommandControllerMockBuilder()
            .withFilteredTasks(filterMock)
            .build();

        const discordController = new DiscordControllerBuilder()
            .withClient(client)
            .withCommandController(commandControllerMock)
            .build();

        const message = new MessageBuilder()
            .withContent('!spreadsheet ' + Moment().format('YYYY-MM-DD') + 'names="this that"')
            .build();

        client.emit('message', message);

        // expect(filterMock.)
    });

    it('should do nothing when message is empty and starts with prefix', () => {
        const client = setupClient();

        const commandControllerMock = new CommandControllerMockBuilder()
            .build();

        const discordController = new DiscordControllerBuilder()
            .withClient(client)
            .withCommandController(commandControllerMock)
            .build();

        const message = new MessageBuilder()
            .withContent('!')
            .build();

        client.emit('message', message);

        expect(commandControllerMock.tasksForUser).toHaveBeenCalledTimes(0);
    });
});

function setupClient() {
    const client = new Client();
    client.login = jest.fn(() => Promise.resolve());

    return client;
}

class MessageBuilder {
    private message = {
        content: '!',
        author: 'author',
        mentions: {
            users: {
                first: jest.fn().mockReturnValue('mentionedUser')
            }
        },
        channel: {
            send: jest.fn(() => Promise.resolve()),
            startTyping: jest.fn(() => Promise.resolve()),
            type: 'text',
            name: 'channelName'
        }
    };

    public withContent(content: string) {
        this.message.content = content;
        return this;
    }

    public withSend(send: jest.Mock<Promise<any>>) {
        this.message.channel.send = send;
        return this;
    }

    public withChannelType(type: string) {
        this.message.channel.type = type;
        return this;
    }

    public withChannelName(name: string) {
        this.message.channel.name = name;
        return this;
    }

    public build() {
        return this.message;
    }
}
