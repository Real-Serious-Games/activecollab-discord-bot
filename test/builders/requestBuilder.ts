import { Request } from 'express';

import { defaultWebhookSecret } from './apiControllerBuilder';
import { Socket } from 'net';

export class RequestBuilder {
    private body = 'body';
    private header = jest.fn().mockReturnValue(defaultWebhookSecret);
    private connection: Partial<Socket> = { localPort: 80 };

    public withWebhookSecret(webhookSecret: string): RequestBuilder {
        this.header = jest.fn().mockReturnValue(webhookSecret);
        return this;
    }

    public withConnectionPort(portNumber: number) {
        this.connection = { localPort: portNumber };
        return this;
    }

    public build(): Partial<Request> {
        return {
            body: this.body,
            header: this.header,
            connection: this.connection as Socket
        };
    }
}