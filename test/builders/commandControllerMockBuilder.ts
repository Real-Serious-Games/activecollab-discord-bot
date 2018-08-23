import { RichEmbed } from 'discord.js';

import { ICommandController } from '../../src/controllers/command';

export class CommandControllerMockBuilder {

    private logsSendFile = jest.fn(() => Promise.resolve(new RichEmbed()));
    private logsSendMessage = jest.fn();
    private tasksForUser = jest.fn(() => Promise.resolve(new RichEmbed()));
    private tasksDueThisWeekForProject = jest.fn(() => Promise.resolve(new RichEmbed()));
    private tasksInListForProject = jest.fn(() => Promise.resolve(new RichEmbed()));
    private createTask: jest.Mock<Promise<void>> = jest.fn(() => Promise.resolve());

    public withLogsSendFile(mock: jest.Mock<Promise<RichEmbed>>) {
        this.logsSendFile = mock;
        return this;
    }

    public withLogsSendMessage(mock: jest.Mock<Promise<void>>) {
        this.logsSendMessage = mock;
        return this;
    }

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

    public withCreateTask(mock: jest.Mock<Promise<void>>) {
        this.createTask = mock;
        return this;
    }

    public build(): ICommandController {
        return {
            logsSendFile: this.logsSendFile,
            logsSendMessage: this.logsSendMessage,
            tasksForUser: this.tasksForUser,
            tasksDueThisWeekForProject: this.tasksDueThisWeekForProject,
            tasksInListForProject: this.tasksInListForProject,
            createTask: this.createTask
        };
    }
}
