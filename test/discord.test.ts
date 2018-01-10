import * as sinon from 'sinon';
import { TextChannel } from 'discord.js';

import * as discord from '../src/controllers/discord';

describe('sendMessageToHook', () => {
    it('should return message', () => {
        const message: string = "Test message";

        const channelStub: sinon.SinonStub = sinon.stub();
        channelStub.resolves(message);

        const channel: Partial<TextChannel> = {
            send: channelStub
        };

        discord.sendMessageToHook(message, <TextChannel>channel);
        sinon.assert.calledWith(channel.send as sinon.SinonStub, message);
    })
})
