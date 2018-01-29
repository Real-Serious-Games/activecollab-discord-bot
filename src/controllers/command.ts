import * as Log from 'structured-log';

import { Message, RichEmbed, User } from 'discord.js';
import { IActiveCollabAPI } from '../controllers/activecollab-api';
import { IMappingController } from '../controllers/mapping';

async function listTasksForUser(discordUser: User): Promise<RichEmbed> {
    throw 'NotImplemented';
}

export function createCommandController(
    activecollabApi: IActiveCollabAPI,
    mappingController: IMappingController,
    log: Log.Logger
) {
    return {
        listTasksForUser: listTasksForUser
    };
}
