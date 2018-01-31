/**
 * Map ActiveCollab and Discord channels and users
 */
export interface IMappingController {
    /**
     * Take an ActiveCollab project ID and return the Discord channel name for it
     */
    getChannel: (projectId: number) => string;

    /**
     * Map Discord channel name to ActiveCollab project ID
     */
    getProjectId: (channelName: string) => number;
    
    /**
     * Map Discord user to ActiveCollab user ID
     */
    getDiscordUser: (activeCollabUserID: number) => string;

    /**
     * Map ActiveCollab user to Discord user
     */
    getActiveCollabUser: (discordUser: string) => number;
}

export interface ChannelMap {
    projectId: number;
    channelName: string;
}

export interface UserMap {
    discordUser: string;
    activeCollabUser: number;
}

function getChannel(
    channelsMap: () => Array<ChannelMap>,
    projectId: number
): string {
    if (!projectId) {
        throw Error(`Invalid project ID: ${projectId}`);
    }
    const channelMap = channelsMap()
        .find(channelMap => channelMap.projectId === projectId);

    if (!channelMap) {
        throw Error(`Channel not found with project ID: ${projectId}`);
    }

    return channelMap.channelName;
}

function getProjectId(
    channelsMap: () => Array<ChannelMap>,
    channelName: string
): number {
    if (!channelName) {
        throw Error(`Invalid channel: ${channelName}`);
    }

    const channelMap = channelsMap()
        .find(channelMap => channelMap.channelName === channelName);

    if (!channelMap) {
        throw Error(`Project ID not found with channel name: ${channelName}`);
    }

    return channelMap.projectId;
}

function getDiscordUser(
    usersMap: () => Array<UserMap>,
    activeCollabUser: number
): string {
    if (!activeCollabUser) {
        throw Error(`Invalid ActiveCollab user: ${activeCollabUser}`);
    }

    const userMap = usersMap()
        .find(usersMap => usersMap.activeCollabUser === activeCollabUser);

    if (!userMap) {
        throw Error(`Discord user not found with ActiveCollab user: ${activeCollabUser}`);
    }

    return userMap.discordUser;
}

function getActiveCollabUser(
    usersMap: () => Array<UserMap>,
    discordUser: string
): number {
    if (!discordUser) {
        throw Error(`Invalid Discord user: ${discordUser}`);
    }

    const userMap = usersMap()
        .find(usersMap => usersMap.discordUser === discordUser);

    if (!userMap) {
        throw Error(`ActiveCollab user not found with Discord user: ${discordUser}`);
    }

    return userMap.activeCollabUser;
}

export function createMappingController(
    channelsMap: () => Array<ChannelMap>,
    usersMap: () => Array<UserMap>
): IMappingController {
    return {
        getChannel: getChannel.bind(undefined, channelsMap),
        getProjectId: getProjectId.bind(undefined, channelsMap),
        getDiscordUser: getDiscordUser.bind(undefined, usersMap),
        getActiveCollabUser: getActiveCollabUser.bind(undefined, usersMap) 
    };
}