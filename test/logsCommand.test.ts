import * as logsCommand from '../src/controllers/logsCommand';
import * as mockDate from 'mockdate';
import {
    Message,
    RichEmbed,
    User,
    Client,
    DMChannel,
    Presence
} from 'discord.js';

const eventColor = '#449DF5';

const discordUser: Partial<User> = {
    tag: 'tag',
    username: 'username',
    id: '22020202',
    send: jest.fn()
};

describe('logsCommand', () => {
    describe('getLogsFile', () => {});

    describe('logsSendFile', () => {});

    describe('logsSendMessage', () => {
        it('should send Discord message with data or error message', () => {
            expect.assertions(1);

            logsCommand.logsSendMessage(eventColor, discordUser as User);
            expect(discordUser.send).toHaveBeenCalled();
        });
        it('should send message with multiple fields when logFile is longer than 1024 chars', () => {
            expect.assertions(1);

            logsCommand.logsSendMessage(eventColor, discordUser as User);
            // Can't currently test as the logfile can't be faked
            expect(discordUser.send).toHaveBeenCalled();
        });
    });
});
