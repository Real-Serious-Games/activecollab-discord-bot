import { IMappingController } from '../../src/controllers/mapping';

export class MappingControllerMockBuilder {

    private getChannels = jest.fn().mockReturnValue([
        {
            projectId: 0,
            channelName: 'channel',
            guildIndex: 0
        },
        {
            projectId: 0,
            channelName: 'channel',
            guildIndex: 1
        }
    ]);
    
    private getProjectId = jest.fn().mockReturnValue(0);
    private getDiscordUser = jest.fn().mockReturnValue('user');
    private getActiveCollabUser = jest.fn().mockReturnValue(0);

    public withGetChannels(func: any) {
        this.getChannels = func;
        return this;
    }

    public withGetProjectId(func: any) {
        this.getProjectId = func;
        return this;
    }

    public withGetDiscordUser(func: any) {
        this.getDiscordUser = func;
        return this;
    }

    public withGetActiveCollabUser(func: any) {
        this.getActiveCollabUser = func;
        return this;
    }

    public build(): IMappingController {
         return {
             getChannels: this.getChannels,
             getProjectId: this.getProjectId,
             getDiscordUser: this.getDiscordUser,
             getActiveCollabUser: this.getActiveCollabUser,
         };
    }
}