import * as sinon from 'sinon';
import { WebhookClient } from 'discord.js';

import { sendMessageToHook } from '../src/controllers/discordWebhook';

describe('sendMessageToHook', () => {
    it('should return message', () => {
        const message: string = "Test message";

        const hookClientStub: sinon.SinonStub = sinon.stub();
        hookClientStub.resolves(message);

        const hook: Partial<WebhookClient> = {
            send: hookClientStub
        };

        sendMessageToHook(message, <WebhookClient>hook);
        sinon.assert.calledWith(hook.send as sinon.SinonStub, message);
    })
})
