import { Client, Collection, Channel, Guild } from 'discord.js';


export class DiscordClientMockBuilder {

    private on = jest.fn();
    private login = jest.fn(() => Promise.resolve());
    private channels: Partial<Collection<string, Channel>> = {
        findAll: jest.fn()
    };
    private guilds: Partial<Collection<string, Guild>> = {
        find: jest.fn()
    };

    public withOn(func: any) {
        this.on = func;
        return this;
    }

    public withLogin(func: any) {
        this.login = func;
        return this;
    }

    public withChannels(func: any) {
        this.channels = func;
        return this;
    }

    public withGuilds(func: any) {
        this.guilds = func;
        return this;
    }

    public build(): Partial<Client> {
        return {
            on: this.on,
            login: this.login,
            channels: this.channels as Collection<string, Channel>,
            guilds: this.guilds as Collection<string, Guild>
        } as Partial<Client>;
    }
}