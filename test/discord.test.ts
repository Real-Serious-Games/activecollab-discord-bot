import { TextChannel, Client, RichEmbed } from 'discord.js';
import * as discord from 'discord.js';

import { DiscordController, IDiscordController } from '../src/controllers/discord';
import { createClient } from 'http';
import { AssertionError } from 'assert';
import { IMappingController } from '../src/controllers/mapping';

describe('calling sendMessageToChannel', () => {
    it('should send message to channel when channel is valid', () => {
        const message: discord.RichEmbed = new RichEmbed();

        const channelStub = jest.fn(() => Promise.resolve());

        const channel: Partial<TextChannel> = {
            send: channelStub
        };

        const discordController = setupDiscordController();

        discordController.sendMessageToChannel(message, <TextChannel>channel);
        expect(channelStub).toBeCalledWith(undefined, message);
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
    mappingController?: Partial<IMappingController>
) {
    if (!client) {
        client = <Client>setupMockDiscordClient();
    }

    if (!mappingController) {
        mappingController = {
            getChannel: jest.fn().mockReturnValue('channel')
        };
    }

    return new DiscordController(
        token,
        client,
        <IMappingController>mappingController,
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