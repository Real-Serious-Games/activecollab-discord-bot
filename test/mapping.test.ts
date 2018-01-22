import * as mapping from '../src/controllers/mapping';

describe('calling getChannel', () => {
    it('returns channel when project ID is valid', () => {
        const projectId = 1;
        const channelName = 'channel';

        const channelsMap = new Array<mapping.ChannelMap>(
            { projectId: projectId, channelName: channelName },
        );

        const mappingController = createMappingController(channelsMap);

        expect(mappingController.getChannel(projectId)).toEqual(channelName);
    });

    it('throws error when project ID is invalid', () => {
        const invalidProjectId = undefined;
        
        const mappingController = createMappingController();

        expect(() => mappingController.getChannel(invalidProjectId))
            .toThrow('Invalid project ID: undefined');
    });

    it('throws error when project ID not found', () => {
        const unknownProjectID = 2;
        
        const channelsMap = new Array<mapping.ChannelMap>(
            { projectId: 1, channelName: 'channelName' },
        );

        const mappingController = createMappingController(channelsMap);

        expect(() => mappingController.getChannel(unknownProjectID))
            .toThrow(`Channel not found with project ID: ${unknownProjectID}`);
    });
});

describe('calling getProjectId', () => {
    it('returns project ID when channel is valid', () => {
        const projectId = 1;
        const channelName = 'channel';

        const channelsMap = new Array<mapping.ChannelMap>(
            { projectId: projectId, channelName: channelName },
        );

        const mappingController = createMappingController(channelsMap);

        expect(mappingController.getProjectId(channelName)).toEqual(projectId);
    });

    it('throws error when channel is invalid', () => {
        const invalidChannel = '';
        
        const mappingController = createMappingController();

        expect(() => mappingController.getProjectId(invalidChannel))
            .toThrow(`Invalid channel: ${invalidChannel}`);
    });

    it('throws error when channel not found', () => {
        const unknownChannel = 'unknownName';
        
        const channelsMap = new Array<mapping.ChannelMap>(
            { projectId: 1, channelName: 'channelName' },
        );

        const mappingController = createMappingController(channelsMap);

        expect(() => mappingController.getProjectId(unknownChannel))
            .toThrow(`Project ID not found with channel name: ${unknownChannel}`);
    });
});

describe('calling getDiscordUser', () => {
    it('returns Discord user when ActiveCollab user is valid', () => {
        const activeCollabUser = 1;
        const discordUser = 'discordUser';

        const usersMap = new Array<mapping.UserMap>(
            { activeCollabUser: activeCollabUser, discordUser: discordUser },
        );

        const mappingController = createMappingController(undefined, usersMap);

        expect(mappingController.getDiscordUser(activeCollabUser)).toEqual(discordUser);
    });

    it('throws error when ActiveCollab user is invalid', () => {
        const invalidActiveCollabUser = undefined;
        
        const mappingController = createMappingController();

        expect(() => mappingController.getDiscordUser(invalidActiveCollabUser))
            .toThrow(`Invalid ActiveCollab user: ${invalidActiveCollabUser}`);
    });

    it('throws error when ActiveCollab user not found', () => {
        const unknownActiveCollabUser = 10;
        
        const usersMap = new Array<mapping.UserMap>(
            { activeCollabUser: 1, discordUser: 'discordUser' },
        );

        const mappingController = createMappingController(undefined, usersMap);

        expect(() => mappingController.getDiscordUser(unknownActiveCollabUser))
            .toThrow(`Discord user not found with ActiveCollab user: ${unknownActiveCollabUser}`);
    });
});

describe('calling getActiveCollabUser', () => {
    it('returns ActiveCollab user when Discord user is valid', () => {
        const activeCollabUser = 1;
        const discordUser = 'discordUser';

        const usersMap = new Array<mapping.UserMap>(
            { activeCollabUser: activeCollabUser, discordUser: discordUser },
        );

        const mappingController = createMappingController(undefined, usersMap);

        expect(mappingController.getActiveCollabUser(discordUser))
            .toEqual(activeCollabUser);
    });

    it('throws error when Discord user is invalid', () => {
        const invalidDiscordUser = '';
        
        const mappingController = createMappingController();

        expect(() => mappingController.getActiveCollabUser(invalidDiscordUser))
            .toThrow(`Invalid Discord user: ${invalidDiscordUser}`);
    });

    it('throws error when Discord user not found', () => {
        const unknownDiscordUser = 'unknownName';
        
        const usersMap = new Array<mapping.UserMap>(
            { activeCollabUser: 1, discordUser: 'discordUser' },
        );

        const mappingController = createMappingController(undefined, usersMap);

        expect(() => mappingController.getActiveCollabUser(unknownDiscordUser))
            .toThrow(`ActiveCollab user not found with Discord user: ${unknownDiscordUser}`);
    });
});

function createChannelsMap(): Array<mapping.ChannelMap> {
    return new Array<mapping.ChannelMap>(
        { projectId: 1, channelName: 'channel' },
        { projectId: 2, channelName: 'channel 2' }
    );
}

function createUsersMap(): Array<mapping.UserMap> {
    return new Array<mapping.UserMap>(
        { discordUser: 'user1', activeCollabUser: 1 },
        { discordUser: 'user2', activeCollabUser: 2 },
    );
}

function createMappingController(
    channelsMap?: Array<mapping.ChannelMap>,
    usersMap?: Array<mapping.UserMap>,
): mapping.IMappingController {
    if (!channelsMap) {
        channelsMap = createChannelsMap();
    }

    if (!usersMap) {
        usersMap = createUsersMap();
    }

    return mapping.createMappingController(
        () => channelsMap,
        () => usersMap
    );
}