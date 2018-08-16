import { Assignment } from '../../src/models/report';
import { Project } from '../../src/models/project';
import { IActiveCollabAPI } from '../../src/controllers/activecollab-api';
import { TimeRecord } from '../../src/models/timeRecords';
import { TasksData } from '../../src/models/projectTasks';

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

    private timesToReturn: Array<Partial<TimeRecord>> = [
        {
            id: 1,
            type: 'type',
            parent_type: 'parent_type',
            parent_id: 1,
            group_id: 1,
            record_date: 1,
            user_id: 1,
            user_name: 'user_name',
            user_email: 'user_email',
            summary: 'summary',
            value: 1,
            billable_status: 1,
            project_id: 1,
            project_name: 'project_name',
            project_url: 'project_url',
            client_id: 1,
            client_name: 'client_name',
            currency_id: 1,
            custom_hourly_rate: 1,
            parent_name: 'parent_name',
            parent_url: 'parent_url',
            group_name: 'group_name',
            billable_name: 'billable_name'
        },
        {
            id: 2,
            type: 'type',
            parent_type: 'parent_type',
            parent_id: 2,
            group_id: 2,
            record_date: 2,
            user_id: 2,
            user_name: 'user_name',
            user_email: 'user_email',
            summary: 'summary',
            value: 2,
            billable_status: 2,
            project_id: 2,
            project_name: 'project_name',
            project_url: 'project_url',
            client_id: 2,
            client_name: 'client_name',
            currency_id: 2,
            custom_hourly_rate: 2,
            parent_name: 'parent_name',
            parent_url: 'parent_url',
            group_name: 'group_name',
            billable_name: 'billable_name'
        }
    ];

    private projectsToReturn: Array<Partial<Project>> = [{
        id: 0,
        name: 'Project 0'
    },
    {
        id: 1,
        name: 'Project 1'
    }];

    private taskDataToReturn: Partial<TasksData> = {
        tasks: [{
            id: 0,
            class: 'string',
            url_path: 'string',
            name: 'string',
            assignee_id: 0,
            delegated_by_id: 0,
            completed_on: 0,
            completed_by_id: 0,
            is_completed: false,
            comments_count: 0,
            // attachments: [],
            // labels: [],
            is_trashed: false,
            trashed_on: 0,
            trashed_by_id: 0,
            project_id: 0,
            is_hidden_from_clients: false,
            body: 'string',
            body_formatted: 'string',
            created_on: 0,
            created_by_id: 0,
            created_by_name: 'string',
            created_by_email: 'string',
            updated_on: 0,
            updated_by_id: 0,
            task_number: 0,
            task_list_id: 0,
            position: 0,
            is_important: false,
            start_on: 0,
            due_on: 0,
            estimate: 0,
            job_type_id: 0,
            fake_assignee_name: 0,
            fake_assignee_email: 0,
            total_subtasks: 0,
            completed_subtasks: 0,
            open_subtasks: 0,
            created_from_recurring_task_id: 0,
        }],
        task_lists: [{
            id: 0,
            class: 'string',
            url_path: 'string',
            name: 'string',
            is_trashed: false,
            trashed_on: 0,
            trashed_by_id: 0,
            completed_on: 0,
            completed_by_id: 0,
            is_completed: false,
            project_id: 0,
            created_on: 0,
            created_by_id: 0,
            created_by_name: 'string',
            created_by_email: 'string',
            updated_on: 0,
            updated_by_id: 0,
            start_on: 0,
            due_on: 0,
            position: 0,
            open_tasks: 0,
            completed_tasks: 0,
        }]
    };

    // getAssignmentTasksByProject: (project: string) =>
    //     getAssignmentTasksByProject(project, restClient)

    private getAssignmentTasksByUserId = jest.fn(() => Promise.resolve(this.tasksToReturn));
    private getAllProjects = jest.fn(() => Promise.resolve(this.projectsToReturn));
    private getTaskListNameById = jest.fn().mockReturnValue('Completed');
    private getAllAssignmentTasks = jest.fn(() => Promise.resolve(this.tasksToReturn));
    private createTask = jest.fn(() => Promise.resolve());
    private getAllAssignmentTasksDateRange = jest.fn(() => Promise.resolve(this.timesToReturn));
    private getAssignmentTasksByProject = jest.fn(() => Promise.resolve(this.taskDataToReturn));

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

    public withGetAllAssignmentTasksDateRange(mock: jest.Mock<Promise<Partial<Assignment>[]>>) {
        this.getAllAssignmentTasksDateRange = mock;
        return this;
    }

    public withGetAssignmentTasksByProject(mock: jest.Mock<Promise<Partial<TasksData>>>) {
        this.getAssignmentTasksByProject = mock;
        return this;
    }

    public build() {
        return {
            getAssignmentTasksByUserId: this.getAssignmentTasksByUserId,
            getAllProjects: this.getAllProjects,
            getTaskListNameById: this.getTaskListNameById,
            getAllAssignmentTasks: this.getAllAssignmentTasks,
            createTask: this.createTask,
            getAllAssignmentTasksDateRange: this.getAllAssignmentTasksDateRange,
            getAssignmentTasksByProject: this.getAssignmentTasksByProject
        } as Partial<IActiveCollabAPI>;
    }
}
