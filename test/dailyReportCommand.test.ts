import * as dailyReport from '../src/controllers/dailyReportCommand';
import { ActiveCollabApiMockBuilder } from './builders/activeCollabApiMockBuilder';
import { LoggerMockBuilder } from './builders/loggerMockBuilder';
import { TasksData } from '../src/models/projectTasks';
import { IActiveCollabAPI } from '../src/controllers/activecollab-api';
import { RichEmbed } from 'discord.js';

const eventColor = '#449DF5';

const taskDataToReturn: Partial<TasksData> = {
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

describe('dailyReport', () => {
    it('place holder', async () => {
    });
    // it('should return a spreadsheet', async () => {
    //     const writeToFileMock = (filename: string, logger: any) => jest.fn();

    //     const activeCollabApiMock = new ActiveCollabApiMockBuilder()
    //         .withGetAssignmentTasksByProject(jest.fn(() => Promise.resolve(taskDataToReturn)))
    //         .build();

    //     const expectedReturn = new RichEmbed()
    //         .setTitle('')
    //         .setColor(eventColor);

    //     expect(await dailyReport.dailyReport(
    //         ['0'],
    //         eventColor,
    //         activeCollabApiMock as IActiveCollabAPI,
    //         new LoggerMockBuilder().build(),
    //         writeToFileMock('', new LoggerMockBuilder().build())
    //     )
    //         .then(embed => embed.fields.length)
    //     )
    //         .toEqual(1);
    // });
});
