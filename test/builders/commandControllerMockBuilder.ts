import { RichEmbed } from 'discord.js';
import { Option, some, none } from 'fp-ts/lib/Option';

import { ICommandController } from '../../src/controllers/command';

export class CommandControllerMockBuilder {

    private tasksForUser = jest.fn(() => Promise.resolve(new RichEmbed()));
    private tasksDueThisWeekForProject = jest.fn(() => Promise.resolve(new RichEmbed()));
    private tasksInListForProject = jest.fn(() => Promise.resolve(new RichEmbed()));
    private createTask: jest.Mock<Promise<Option<RichEmbed>>> 
        = jest.fn(() => Promise.resolve(none));
    
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

    public withCreateTask(mock: jest.Mock<Promise<Option<RichEmbed>>>) {
        this.createTask = mock;
        return this;
    }

    public build(): ICommandController {
        return {
            tasksForUser: this.tasksForUser,
            tasksDueThisWeekForProject: this.tasksDueThisWeekForProject,
            tasksInListForProject: this.tasksInListForProject,
            createTask: this.createTask
        };
    }
}