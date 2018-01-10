import * as sinon from 'sinon';
import { TextChannel, Client } from 'discord.js';

import { DiscordController } from '../src/controllers/discord';

describe('sendMessageToHook', () => {
    it('should return message', () => {
        const message: string = "Test message";

        const channelStub: sinon.SinonStub = sinon.stub();
        channelStub.resolves(message);

        const channel: Partial<TextChannel> = {
            send: channelStub
        };

        const loginStub: sinon.SinonStub = sinon.stub();
        loginStub.resolves();

        const client: Partial<Client> = {
            on: sinon.stub(),
            login: loginStub
        };

        const discordController: DiscordController =  new DiscordController('', <Client>client);

        discordController.sendMessageToChannel(message, <TextChannel>channel);
        sinon.assert.calledWith(channel.send as sinon.SinonStub, message);
    })
})
