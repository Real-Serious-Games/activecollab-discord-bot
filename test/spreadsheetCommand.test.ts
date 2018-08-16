import * as spreadsheetCommand from '../src/controllers/spreadsheetCommand';
import { TimeRecord } from '../src/models/timeRecords';
import { RichEmbed } from 'discord.js';
import { ActiveCollabApiMockBuilder } from './builders/activeCollabApiMockBuilder';
import { LoggerMockBuilder } from './builders/loggerMockBuilder';
import { IActiveCollabAPI } from '../src/controllers/activecollab-api';

const eventColor = '#449DF5';

describe('', () => {
    it('', () => {
        expect(true).toEqual(true);
    });
});

describe('filteredTasks', () => {
    // it('should return spreadsheet file', async () => {

    //     const writeToFileMock = (filename: string, logger: any) => jest.fn();

    //     const tasksToReturn: Array<TimeRecord> = [
    //         {
    //             id: 1,
    //             type: 'type',
    //             parent_type: 'parent_type',
    //             parent_id: 1,
    //             group_id: 1,
    //             record_date: 1,
    //             user_id: 1,
    //             user_name: 'user_name',
    //             user_email: 'user_email',
    //             summary: 'summary',
    //             value: 1,
    //             billable_status: 1,
    //             project_id: 1,
    //             project_name: 'project_name',
    //             project_url: 'project_url',
    //             client_id: 1,
    //             client_name: 'client_name',
    //             currency_id: 1,
    //             custom_hourly_rate: 1,
    //             parent_name: 'parent_name',
    //             parent_url: 'parent_url',
    //             group_name: 'group_name',
    //             billable_name: 'billable_name'
    //         },
    //         {
    //             id: 2,
    //             type: 'type',
    //             parent_type: 'parent_type',
    //             parent_id: 2,
    //             group_id: 2,
    //             record_date: 2,
    //             user_id: 2,
    //             user_name: 'user_name',
    //             user_email: 'user_email',
    //             summary: 'summary',
    //             value: 2,
    //             billable_status: 2,
    //             project_id: 2,
    //             project_name: 'project_name',
    //             project_url: 'project_url',
    //             client_id: 2,
    //             client_name: 'client_name',
    //             currency_id: 2,
    //             custom_hourly_rate: 2,
    //             parent_name: 'parent_name',
    //             parent_url: 'parent_url',
    //             group_name: 'group_name',
    //             billable_name: 'billable_name'
    //         }
    //     ];

    //     const expectedReturn = new RichEmbed()
    //         .setTitle('Successful')
    //         .setColor(eventColor);

    //     const activeCollabApiMock = new ActiveCollabApiMockBuilder()
    //         .withGetAllAssignmentTasksDateRange(jest.fn(() => Promise.resolve(tasksToReturn)))
    //         .build();

    //     expect(await spreadsheetCommand.filteredTasks(
    //         [],
    //         [],
    //         '',
    //         '',
    //         eventColor,
    //         activeCollabApiMock as IActiveCollabAPI,
    //         new LoggerMockBuilder().build(),
    //         writeToFileMock(new Workbook(), '', new LoggerMockBuilder().build())
    //     )
    //         .then(embed => embed.title)
    //     )
    //         .toEqual(expectedReturn.title);
    // });
});
