import { Request } from 'express';

import { defaultWebhookSecret } from './apiControllerBuilder';

export class RequestBuilder {
    private body = 'body';
    private header = jest.fn().mockReturnValue(defaultWebhookSecret);

    public withWebhookSecret(webhookSecret: string): RequestBuilder {
        this.header = jest.fn().mockReturnValue(webhookSecret);
        return this;
    }

    public build(): Partial<Request> {
        return {
            body: this.body,
            header: this.header
        };
    }
}