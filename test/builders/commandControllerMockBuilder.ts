import { RichEmbed } from 'discord.js';

import { ICommandController } from '../../src/controllers/command';

export class CommandControllerMockBuilder {

    private tasksForUser = jest.fn(() => Promise.resolve(new RichEmbed()));
    private tasksDueThisWeekForProject = jest.fn(() => Promise.resolve(new RichEmbed()));
    private tasksInListForProject = jest.fn(() => Promise.resolve(new RichEmbed()));
    private createTask: jest.Mock<Promise<void>> = jest.fn(() => Promise.resolve());
    private filteredTasks = jest.fn(() => Promise.resolve(new RichEmbed()));
    private logsSendFile = jest.fn(() => Promise.resolve(new RichEmbed()));
    private logsSendMessage: jest.Mock<Promise<void>> = jest.fn(() => Promise.resolve());
    private userTimes = jest.fn(() => Promise.resolve(new RichEmbed()));
    private userWeekTimes = jest.fn(() => Promise.resolve(new RichEmbed()));
    private wallOfShame = jest.fn(() => Promise.resolve(new RichEmbed()));
    private dailyReport = jest.fn(() => Promise.resolve([]));
    private databaseAddImage = jest.fn(() => Promise.resolve(new RichEmbed()));
    private databaseGetImage = jest.fn(() => Promise.resolve(''));
    private databaseGetAllImages = jest.fn(() => Promise.resolve([]));
    private databaseRemoveImage: jest.Mock<Promise<void>> = jest.fn(() => Promise.resolve());

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

    public withFilteredTasks(mock: jest.Mock<Promise<RichEmbed>>) {
        this.filteredTasks = mock;
        return this;
    }
    
    public withLogsSendFile(mock: jest.Mock<Promise<RichEmbed>>) {
        this.logsSendFile = mock;
        return this;
    }
    
    public withLogsSendMessage(mock: jest.Mock<Promise<void>>) {
        this.logsSendMessage = mock;
        return this;
    }

    public withUserTimes(mock: jest.Mock<Promise<RichEmbed>>) {
        this.userTimes = mock;
        return this;
    }

    public withUserWeekTimes(mock: jest.Mock<Promise<RichEmbed>>) {
        this.userWeekTimes = mock;
        return this;
    }

    public withWallOfShame(mock: jest.Mock<Promise<RichEmbed>>) {
        this.wallOfShame = mock;
        return this;
    }

    public withDailyReport(mock: jest.Mock<Promise<Array<RichEmbed>>>) {
        this.dailyReport = mock;
        return this;
    }

    public withDatabaseAddImage(mock: jest.Mock<Promise<RichEmbed>>) {
        this.databaseAddImage = mock;
        return this;
    }

    public withDatabaseGetImage(mock: jest.Mock<Promise<string>>) {
        this.databaseGetImage = mock;
        return this;
    }

    public withDatabaseGetAllImages(mock: jest.Mock<Promise<Array<RichEmbed>>>) {
        this.databaseGetAllImages = mock;
        return this;
    }

    public withDatabaseRemoveImage(mock: jest.Mock<Promise<void>>) {
        this.databaseRemoveImage = mock;
        return this;
    }

    public build(): ICommandController {
        return {
            tasksForUser: this.tasksForUser,
            tasksDueThisWeekForProject: this.tasksDueThisWeekForProject,
            tasksInListForProject: this.tasksInListForProject,
            createTask: this.createTask,
            filteredTasks: this.filteredTasks,
            logsSendFile: this.logsSendFile,
            logsSendMessage: this.logsSendMessage,
            userTimes: this.userTimes,
            userWeekTimes: this.userWeekTimes,
            wallOfShame: this.wallOfShame,
            dailyReport: this.dailyReport,
            databaseAddImage: this.databaseAddImage,
            databaseGetImage: this.databaseGetImage,
            databaseGetAllImages: this.databaseGetAllImages,
            databaseRemoveImage: this.databaseRemoveImage
        };
    }
}
