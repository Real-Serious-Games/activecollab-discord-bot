import * as sinon from 'sinon';
import { TextChannel, Client } from 'discord.js';
import * as discord from 'discord.js';

import { DiscordController, IDiscordController } from '../src/controllers/discord';
import { createClient } from 'http';
import { AssertionError } from 'assert';

describe('calling sendMessageToChannel', () => {
    it('should send message to channel when channel is valid', () => {
        const message: string = 'Test message';

        const channelStub: sinon.SinonStub = sinon.stub();
        channelStub.resolves(message);

        const channel: Partial<TextChannel> = {
            send: channelStub
        };

        const client = setupMockDiscordClient();

        const discordController: DiscordController = 
            new DiscordController(
                '',
                <Client>client,
                jest.fn().mockReturnValue('channel'));

        discordController.sendMessageToChannel(message, <TextChannel>channel);
        sinon.assert.calledWith(channel.send as sinon.SinonStub, message);
    }),

    it('should error when channel is invalid', () => {
        const client = setupMockDiscordClient();

        const discordController: DiscordController = 
            new DiscordController(
                '',
                <Client>client,
                jest.fn().mockReturnValue('channel'));

        expect(() => discordController.sendMessageToChannel('', undefined))
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
        expect(framework.getChannelFromId)
            .toHaveBeenCalled();
    });
    it('should return ID not found error when project ID not found', () => {
        const cantFindValue = true;

        const framework = setupTestFramework(undefined, cantFindValue);

        const projectId = 1;

        expect(() => framework.discordController.determineChannel(projectId))
            .toThrow(`Project ID not found: ${projectId}`);
        expect(framework.getChannelFromId)
            .toHaveBeenCalled();
    });
    it('should return invalid ID error when project ID not valid', () => {
        const framework = setupTestFramework();

        const invalidProjectId = undefined;

        expect(() => framework.discordController.determineChannel(invalidProjectId))
            .toThrow(`Project ID not valid: undefined`);
        expect(framework.getChannelFromId)
            .toHaveBeenCalledTimes(0);
    });
    it('should return channel not found error when channel not found', () => {
        const nonExistantChannel = 'channel-that-doesnt-exist';
        
        const frameWork = setupTestFramework(nonExistantChannel);

        const projectId = 1;
        
        expect(() => frameWork.discordController.determineChannel(1))
            .toThrow(`Channel not found: null`);
        expect(frameWork.getChannelFromId)
            .toHaveBeenCalled;
    });
});

function setupTestFramework(
    channelToReturn: any = 'activecollab-notifications',
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

        const getChannelFromId = jest.fn().mockReturnValue(
            shouldReturnUndefinedChannel 
            ? undefined 
            : channelToReturn
        );

        const discordController: IDiscordController = 
            new DiscordController(
            '',
            <Client>client,
            getChannelFromId);

        return {
            client: client,
            allChannels: allChannels,
            getChannelFromId: getChannelFromId,
            discordController: discordController
        };
}

// function setupDiscordController(
//     token: '',
//     client: setupMockDiscordClient(),
//     getChannelFromId: jest.fn().mockReturnValue('channel')
// ) {
//     return new DiscordController(
//         token,
//         client,
//         getChannelFromId);
// }

function setupMockDiscordClient (
    on: sinon.SinonStub = sinon.stub(),
    login?: sinon.SinonStub,
    channels: Partial<discord.Collection<string, discord.Channel>> = {
        findAll: sinon.spy()
    }
): Partial<Client> {
    if (login === undefined) {
        const loginStub: sinon.SinonStub = sinon.stub();
        loginStub.resolves();

        login = loginStub;
    }

    const client: Partial<Client> = {
        on: sinon.stub(),
        login: login,
        channels: <discord.Collection<string, discord.Channel>>channels
    };

    return client;
}