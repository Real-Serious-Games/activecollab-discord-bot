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

    public withGetAssignmentTasksByUserId(func: any) {
        this.getAssignmentTasksByUserId = func;
        return this;
    }

    public withGetAllProjects(func: any) {
        this.getAllProjects = func;
        return this;
    }

    public withGetTaskListNameById(func: any) {
        this.getTaskListNameById = func;
        return this;
    }

    public withGetAllAssignmentTasks(func: any) {
        this.getAllAssignmentTasks = func;
        return this;
    }

    public build() {
        return  {
            getAssignmentTasksByUserId: this.getAssignmentTasksByUserId,
            getAllProjects: this.getAllProjects,
            getTaskListNameById: this.getTaskListNameById,
            getAllAssignmentTasks: this.getAllAssignmentTasks
        } as Partial<IActiveCollabAPI>;
    }
}