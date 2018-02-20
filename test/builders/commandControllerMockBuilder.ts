import { ICommandController } from '../../src/controllers/command';
import { RichEmbed } from 'discord.js';

export class CommandControllerMockBuilder {

    private listTasksForUser = jest.fn(() => Promise.resolve(new RichEmbed()));
    private tasksDueThisWeekForProject = jest.fn(() => Promise.resolve(new RichEmbed()));

    public withListTasksForUser(func: any) {
        this.listTasksForUser = func;
        return this;
    }

    public withTasksDueThisWeekForProject(func: any) {
        this.tasksDueThisWeekForProject = func;
        return this;
    }

    public build(): ICommandController {
        return {
            listTasksForUser: this.listTasksForUser,
            tasksDueThisWeekForProject: this.tasksDueThisWeekForProject
        };
    }
}