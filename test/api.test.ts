import * as sinon from 'sinon';
import { Response, Request } from 'express';
import { Logger } from 'structured-log/src';

import { IDiscordController, SendMessageToChannel, DetermineChannel } from '../src/controllers/discord';
import * as apiController from '../src/controllers/api';
import * as testData from './testData';
import { PostActiveCollabWebhookFactory } from '../src/controllers/api';

describe('postActiveCollabWebhook', () => {
    it('should call sendStatus with status of 200', () => {
        const body = testData.rawNewTask;

        const req: Partial<Request> = {
            body: body
        };

        const res: Partial<Response> = {
            sendStatus: sinon.spy()
        };

        const logger: Partial<Logger> = { };

        const discordControllerStub: IDiscordController = {
            sendMessageToChannel: <SendMessageToChannel>sinon.spy(),
            determineChannel: <DetermineChannel>sinon.spy()
        };

        const postActiveCollabWebhook = 
            apiController.postActiveCollabWebhookFactory(discordControllerStub, <Logger>logger);

        postActiveCollabWebhook(<Request>req, <Response>res);
        sinon.assert.calledOnce(res.sendStatus as sinon.SinonSpy);
        sinon.assert.calledWith(res.sendStatus as sinon.SinonSpy, 200);
    });

    it('should send message to channel when event is valid', () => {
        const body = testData.rawNewTask;

        const req: Partial<Request> = {
            body: body
        };

        const res: Partial<Response> = {
            sendStatus: sinon.spy()
        };

        const logger: Partial<Logger> = { };

        const discordControllerStub: IDiscordController = {
            sendMessageToChannel: <SendMessageToChannel>sinon.spy(),
            determineChannel: <DetermineChannel>sinon.spy()
        };

        const postActiveCollabWebhook = 
            apiController.postActiveCollabWebhookFactory(discordControllerStub, <Logger>logger);

        postActiveCollabWebhook(<Request>req, <Response>res);
        sinon.assert.calledOnce(discordControllerStub.sendMessageToChannel as sinon.SinonSpy);
    });

    it('should send message to channel when event is valid', () => {
        const body = testData.rawNewTask;

        const req: Partial<Request> = {
            body: body
        };

        const res: Partial<Response> = {
            sendStatus: sinon.spy()
        };

        const logger: Partial<Logger> = {
            warn: sinon.spy()
         };

        const discordControllerStub: IDiscordController = {
            sendMessageToChannel: <SendMessageToChannel>sinon.stub(),
            determineChannel: <DetermineChannel>sinon.stub()
        };

        const postActiveCollabWebhook = 
            apiController.postActiveCollabWebhookFactory(
                discordControllerStub,
                <Logger>logger
            );

        postActiveCollabWebhook(<Request>req, <Response>res);
        sinon
            .assert
            .calledOnce(discordControllerStub.sendMessageToChannel as sinon.SinonSpy);
        sinon
            .assert
            .notCalled(logger.warn as sinon.SinonSpy);
    });

    it('should log warning when event is invalid', () => {
        const body = { };

        const req: Partial<Request> = {
            body: body
        };

        const res: Partial<Response> = {
            sendStatus: sinon.stub()
        };

        const logger: Partial<Logger> = {
            warn: sinon.spy()
         };

        const discordControllerStub: IDiscordController = {
            sendMessageToChannel: <SendMessageToChannel>sinon.stub(),
            determineChannel: <DetermineChannel>sinon.stub()
        };

        const postActiveCollabWebhook = 
            apiController.postActiveCollabWebhookFactory(
                discordControllerStub,
                <Logger>logger
            );

        postActiveCollabWebhook(<Request>req, <Response>res);
        sinon.assert.notCalled(discordControllerStub.sendMessageToChannel as sinon.SinonSpy);
        sinon.assert.calledOnce(logger.warn as sinon.SinonSpy);
    });
});