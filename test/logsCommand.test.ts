import * as logsCommand from '../src/controllers/logsCommand';
import { User } from 'discord.js';

const eventColor = '#449DF5';

const createDiscordUser = (): Partial<User> => {
    return {
        tag: 'tag',
        username: 'username',
        id: '22020202',
        send: jest.fn()
    };
};

const longLog = (
    'Lorem ipsum dolor sit amet, consectetur bibesssndum adipiscing eit. \n' +
    'Vivamus sed odio non purus suscipit bibendum nec non dolor. Vesulum \n' +
    'tincidunt, ligula et viverra feugiat, quam felis faucibus ipsum, ut \n' +
    'urna enim eu ante.Cras ultrices justo sit amet leo eleifend lacifnia\n' +
    'molestie massa lacus, quis ornare leo tincidunt eu.Suspendisse segd \n' +
    'est.Pellentesque in pharetra erat, non sollitudin urna. Lorem ipsum \n' +
    'sit amet, consectetur adipiscing elit.Vestibulum gravida hedndrerit \n' +
    'efficitur.Fusce commodo finibus magna, et lobortis est eleifsend at \n' +
    'tempus dignissim elit, sit amet accumsan justo imperdiet ac.\n' +
    '\n' +
    'Praesent posuere feugiat tincidunt. Maecenas consquat vitae dolor id\n' +
    'vestibulum. Quisque non sagittis sapien. Phasellus eu uffrna nec est\n' +
    'ultrices eget nec velit. Nullam consequat erat vitae luctus laoreet.\n' +
    'et malesuada fames ac ante ipsum primis in faucibus. Vestibulum mpus\n' +
    'sed faucibus. Elementum interdum venenatis. Integer feugiatimerdiet.\n' +
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. \n' +
    'Vivamus sed odio non purus suscipit bibendum nec non dolor. Vestbum \n' +
    'tincidunt, ligula et viverra feugiat, quam felis faucibus ipsum, ut \n' +
    'urna enim eu ante.Cras ultrices justo sit amet leo eleifend lacinia \n' +
    'molestie massa lacus, quis ornare leo tincidunt eu. Suspendisse sed \n' +
    'est.Pellentesque in pharetra erat, non so citudin urna. Lorem ipsum \n' +
    'sit amet, consectetur adipiscing elit. Vestibulum gravida hendrerit \n' +
    'efficitur. Fusce commodo finibus magna, et lobortis est eleifend at \n' +
    'tempus dignissim elit, sit amet accumsan justo imperdiet ac.\n' +
    '\n' +
    'Praesent posuere feugiat tincidunt. Maecenas consquat vitae dolor id\n' +
    'vestibulum. Quisque non sagittis sapien. Phasellus eu uffrna nec est\n' +
    'ultrices eget nec velit. Nullam consequat erat vitae luctus laoreet.\n' +
    'et malesuada fames ac ante ipsum primis in faucibus. Vestibulum mpus\n' +
    'sed faucibus. Elementum interdum venenatis. Integer feugiatimerdiet.\n' +
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. \n' +
    'Vivamus sed odio non purus suscipit bibendum nec non dolor. Vestbum \n' +
    'tincidunt, ligula et viverra feugiat, quam felis faucibus ipsum, ut \n' +
    'urna enim eu ante.Cras ultrices justo sit amet leo eleifend lacinia \n' +
    'molestie massa lacus, quis ornare leo tincidunt eu. Suspendisse sed \n' +
    'est.Pellentesque in pharetra erat, non so citudin urna. Lorem ipsum \n' +
    'sit amet, consectetur adipiscing elit. Vestibulum gravida hendrerit \n' +
    'efficitur. Fusce commodo finibus magna, et lobortis est eleifend at \n' +
    'tempus dignissim elit, sit amet accumsan justo imperdiet ac.\n' +
    '\n' +
    'Praesent posuere feugiat tincidunt. Maecenas consequat vitae dolr id\n' +
    'vestibulum. Quisque non sagittis sapien. Phasellus eu urna nec esest\n' +
    'ultrices eget nec velit. Nullam consequat erat vitae luctus laoreet.\n' +
    'et malesuada fames ac ante ipsum primis in faucibus. Vestibulum teus\n' +
    'sed faucibus. Elementum interdum venenatis. Integer feugiatimperdiet.'
);

describe('logsCommand', () => {
    describe('getLogsFile', () => {
        it('returns an empty string if no file is found', () => {
            const fileName = 'file';
            const fileExistsMock = jest.fn(() => false);
            const logsFolder = 'Logs/';

            const testFile = logsCommand
                .getLogsFile(fileName, fileExistsMock, logsFolder);

            expect(testFile).toEqual('');
        });
        it('returns full file name', () => {
            const fileName = 'file';
            const fileExistsMock = jest.fn(() => true);
            const logsFolder = 'Logs/';

            const testFile = logsCommand
                .getLogsFile(fileName, fileExistsMock, logsFolder);

            expect(testFile).toEqual(logsFolder + fileName + '.txt');
        });
    });

    describe('splitLogMessage', () => {
        it('should not split < 1000 chars into multiple messages', () => {
            const buffer = new Buffer('not enough to split');
            const testEmbed = logsCommand.splitLogMessage(buffer);

            expect(testEmbed.fields.length).toEqual(1);
        });
        it('should split > 1000 chars into multiple messages', () => {
            const buffer = new Buffer(longLog);
            const testEmbed = logsCommand.splitLogMessage(buffer);

            expect(testEmbed.fields.length).toEqual(3);
        });
    });

    describe('logsSendFile', () => {
        it('should send Discord message with error message if no log found',
            async () => {
                expect.assertions(1);

                const mockDate = jest.fn(() => 'date');
                const mockFile = jest.fn(() => '');

                const expectedTitle =
                    `Unable to find log file for today (${mockDate()})`;

                const testEmbed = await logsCommand.logsSendFile(
                    eventColor,
                    mockDate,
                    mockFile
                );

                expect(testEmbed).toEqual(
                    expect.objectContaining({
                        title: expectedTitle
                    })
                );
            }
        );
        it('should send Discord message with log file',
            async () => {
                expect.assertions(1);

                const mockDate = jest.fn(() => 'date');
                const mockFile = jest.fn(() => 'file');

                const expectedTitle =
                    `Log file for ${mockDate()}`;

                const testEmbed = await logsCommand.logsSendFile(
                    eventColor,
                    mockDate,
                    mockFile
                );

                expect(testEmbed).toEqual(
                    expect.objectContaining({
                        file: mockFile(),
                        title: expectedTitle
                    })
                );
            }
        );
    });

    describe('logsSendMessage', () => {
        it('should send Discord message with error message if no log found',
            () => {
                const discordUser = createDiscordUser() as User;
                const mockDate = jest.fn(() => 'date');
                const mockFile = jest.fn(() => '');
                const mockReadFile = jest.fn(() => new Buffer(''));

                const expectedTitle =
                    `Unable to find log file for today (${mockDate()})`;

                logsCommand.logsSendMessage(
                    eventColor,
                    discordUser,
                    mockDate,
                    mockFile,
                    mockReadFile
                );

                expect(discordUser.send).toHaveBeenCalledTimes(1);

                expect(discordUser.send).toBeCalledWith(
                    expect.objectContaining({
                        title: expectedTitle
                    })
                );
            }
        );
        it('should send Discord message with error if log file is empty',
            () => {
                const discordUser = createDiscordUser() as User;
                const mockDate = jest.fn(() => 'date');
                const mockFile = jest.fn(() => 'file');
                const mockReadFile = jest.fn(() => new Buffer(''));

                const expectedTitle =
                    `The log file for today (${mockDate()}) is empty`;

                logsCommand.logsSendMessage(
                    eventColor,
                    discordUser,
                    mockDate,
                    mockFile,
                    mockReadFile
                );

                expect(discordUser.send).toHaveBeenCalledTimes(1);

                expect(discordUser.send).toBeCalledWith(
                    expect.objectContaining({
                        title: expectedTitle
                    })
                );
            }
        );
        it('should send Discord message with message contents',
            () => {
                const discordUser = createDiscordUser() as User;
                const mockDate = jest.fn(() => 'date');
                const mockFile = jest.fn(() => 'Filename');
                const fileData = 'File data content';
                const mockReadFile = jest.fn(() => new Buffer(fileData));

                logsCommand.logsSendMessage(
                    eventColor,
                    discordUser,
                    mockDate,
                    mockFile,
                    mockReadFile
                );

                expect(discordUser.send).toHaveBeenCalledTimes(1);

                expect(discordUser.send).toBeCalledWith(
                    expect.objectContaining({
                        fields: [
                            {
                                inline: false,
                                name: 'Output',
                                value: fileData
                            }
                        ]
                    })
                );
            }
        );
        it('should send message with multiple fields when logFile'
            + ' is longer than 1024 chars', () => {
                const discordUser = createDiscordUser() as User;
                const mockDate = jest.fn(() => 'date');

                const mockFile = jest.fn(() => 'UNKNOWNFILE');
                const mockReadFile = jest.fn(() => new Buffer(longLog));

                logsCommand.logsSendMessage(
                    eventColor,
                    discordUser,
                    mockDate,
                    mockFile,
                    mockReadFile
                );

                expect(discordUser.send).toHaveBeenCalledTimes(1);
                expect(discordUser.send).toHaveBeenCalledWith(
                    expect.objectContaining({
                        fields: [
                            expect.anything(),
                            expect.anything(),
                            expect.anything()
                        ]
                    })
                );
            }
        );
    });
});
