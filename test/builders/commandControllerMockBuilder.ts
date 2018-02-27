import { ICommandController } from '../../src/controllers/command';
import { RichEmbed } from 'discord.js';

export class CommandControllerMockBuilder {

    private tasksForUser = jest.fn(() => Promise.resolve(new RichEmbed()));
    private tasksDueThisWeekForProject = jest.fn(() => Promise.resolve(new RichEmbed()));
    private tasksInListForProject = jest.fn(() => Promise.resolve(new RichEmbed()));
    private addTask = jest.fn(() => Promise.resolve(new RichEmbed()));
    
    public withTasksForUser(mock: jest.Mock<Promise<RichEmbed>>) {
        this.tasksForUser = mock;
        return this;
    }

    public withTasksDueThisWeekForProject(mock: jest.Mock<Promise<RichEmbed>>) {
        this.tasksDueThisWeekForProject = mock;
        return this;
    }

    public withTasksInListForProject(mock: jest.Mock<Promise<RichEmbed>>) {
        this.tasksInListForProject = mock;
        return this;
    }

    public withAddTask(mock: jest.Mock<Promise<RichEmbed>>) {
        this.addTask = mock;
        return this;
    }

    public build(): ICommandController {
        return {
            tasksForUser: this.tasksForUser,
            tasksDueThisWeekForProject: this.tasksDueThisWeekForProject,
            tasksInListForProject: this.tasksInListForProject,
            addTask: this.addTask
        };
    }
}