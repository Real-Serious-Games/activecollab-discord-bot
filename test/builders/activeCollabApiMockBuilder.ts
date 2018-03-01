import { Assignment } from '../../src/models/report';
import { Project } from '../../src/models/project';
import { IActiveCollabAPI } from '../../src/controllers/activecollab-api';

export class ActiveCollabApiMockBuilder {
    private tasksToReturn: Array<Partial<Assignment>> = [{
        type: 'Task',
        project_id: 0,
        name: 'Task 1',
        assignee_id: 0,
        permalink: 'url'
    },
    {
        type: 'Task',
        project_id: 1,
        name: 'Task 2',
        assignee_id: 0,
        permalink: 'url'
    }]; 

    private projectsToReturn: Array<Partial<Project>> = [{
        id: 0,
        name: 'Project 0'
    },
    {
        id: 1,
        name: 'Project 1'
    }];

    private getAssignmentTasksByUserId = jest.fn(() => Promise.resolve(this.tasksToReturn));
    private getAllProjects = jest.fn(() => Promise.resolve(this.projectsToReturn));
    private getTaskListNameById = jest.fn().mockReturnValue('Completed');
    private getAllAssignmentTasks = jest.fn(() => Promise.resolve(this.tasksToReturn));
    private createTask = jest.fn(() => Promise.resolve());

    public withGetAssignmentTasksByUserId(mock: jest.Mock<Promise<Partial<Assignment>[]>>) {
        this.getAssignmentTasksByUserId = mock;
        return this;
    }

    public withGetAllProjects(mock: jest.Mock<Promise<Partial<Assignment>[]>>) {
        this.getAllProjects = mock;
        return this;
    }

    public withGetTaskListNameById(mock: jest.Mock<{}>) {
        this.getTaskListNameById = mock;
        return this;
    }

    public withGetAllAssignmentTasks(mock: jest.Mock<Promise<Partial<Assignment>[]>>) {
        this.getAllAssignmentTasks = mock;
        return this;
    }

    public withCreateTask(mock: jest.Mock<Promise<void>>) {
        this.createTask = mock;
        return this;
    }

    public build() {
        return  {
            getAssignmentTasksByUserId: this.getAssignmentTasksByUserId,
            getAllProjects: this.getAllProjects,
            getTaskListNameById: this.getTaskListNameById,
            getAllAssignmentTasks: this.getAllAssignmentTasks,
            createTask: this.createTask
        } as Partial<IActiveCollabAPI>;
    }
}