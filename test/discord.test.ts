import * as sinon from 'sinon';
import { TextChannel, Client } from 'discord.js';

const chai = require('chai');
const expect = chai.expect;

import { DiscordController } from '../src/controllers/discord';
import { createClient } from 'http';
import { AssertionError } from 'assert';

describe('DiscordController', () => {
    it('should throw exception when attempting to create controller when one already exists', () => {
        // Static variables aren't getting reset between tests so do it manually 
        DiscordController.instance = undefined;

        const client = createDiscordClient();

        const discordController: DiscordController =  new DiscordController('', <Client>client);

        expect(() => new DiscordController('', <Client>client))
            .to
            .throw('Attempting to create a new DiscordController when one already exists')
    }),

    describe('sendMessageToChannel', () => {
        it('should send message to channel', () => {
            DiscordController.instance = undefined;

            const message: string = 'Test message';
    
            const channelStub: sinon.SinonStub = sinon.stub();
            channelStub.resolves(message);
    
            const channel: Partial<TextChannel> = {
                send: channelStub
            };
    
            const client = createDiscordClient();
    
            const discordController: DiscordController =  new DiscordController('', <Client>client);
    
            discordController.sendMessageToChannel(message, <TextChannel>channel);
            sinon.assert.calledWith(channel.send as sinon.SinonStub, message);
        }),
    
        it('should error when channel is undefined', () => {
            DiscordController.instance = undefined;

            const client = createDiscordClient();
    
            const discordController: DiscordController =  new DiscordController('', <Client>client);
    
            expect(() => discordController.sendMessageToChannel('', undefined))
                .to
                .throw('Cannot send without a channel: undefined');
        });
    });
});

function createDiscordClient (
    on: sinon.SinonStub = sinon.stub(),
    login: sinon.SinonStub = undefined
): Partial<Client> {
    if (login == undefined) {
        const loginStub: sinon.SinonStub = sinon.stub();
        loginStub.resolves();

        login = loginStub;
    }

    const client: Partial<Client> = {
        on: sinon.stub(),
        login: login
    };

    return client;
}