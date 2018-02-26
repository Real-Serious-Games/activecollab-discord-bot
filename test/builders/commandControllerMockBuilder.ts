import { ICommandController } from '../../src/controllers/command';
import { RichEmbed } from 'discord.js';

export class CommandControllerMockBuilder {

    private tasksForUser = jest.fn(() => Promise.resolve(new RichEmbed()));
    private tasksDueThisWeekForProject = jest.fn(() => Promise.resolve(new RichEmbed()));
    private tasksInListForProject = jest.fn(() => Promise.resolve(new RichEmbed()));
    
    public withListTasksForUser(func: any) {
        this.tasksForUser = func;
        return this;
    }

    public withTasksDueThisWeekForProject(func: any) {
        this.tasksDueThisWeekForProject = func;
        return this;
    }

    public withTasksInListForProject(func: any) {
        this.tasksInListForProject = func;
        return this;
    }

    public build(): ICommandController {
        return {
            tasksForuser: this.tasksForUser,
            tasksDueThisWeekForProject: this.tasksDueThisWeekForProject,
            tasksInListForProject: this.tasksInListForProject
        };
    }
}