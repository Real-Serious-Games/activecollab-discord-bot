import { Logger } from 'structured-log';
import * as discord from 'discord.js';
import { IActiveCollabAPI } from './activecollab-api';
import { ICommandController } from './command';
import * as ProjectTasks from '../models/projectTasks';

export async function dailyReport(
    projects: string[],
    eventColor: any,
    activeCollabApi: IActiveCollabAPI,
    logger: Logger
): Promise<discord.RichEmbed> {
    const message = new discord.RichEmbed();
    message
        .setTitle('')
        .setColor(eventColor);
    for (const projectID of projects) {
        let taskData: ProjectTasks.TasksData;
        try {
            taskData = await activeCollabApi.getAssignmentTasksByProject(projectID);
        } catch (e) {
            logger.error(`Error getting tasks: ${e}`);
            return new discord.RichEmbed()
                .setTitle(`There was an error getting tasks.`)
                .setColor(eventColor);
        }

        const tasks = taskData.tasks;
        const taskLists = taskData.task_lists.sort((a, b) => {
            if (a.position > b.position) {
                return 1;
            }
            if (a.position < b.position) {
                return -1;
            }
            return 0;
        });

        let messageField: string = '';

        taskLists.forEach(list => {
            const listGroup = tasks.filter(t => t.task_list_id == list.id);

            let fullCount = listGroup.filter(t => t.total_subtasks === 0).length;
            listGroup.forEach(task => {
                fullCount += task.total_subtasks;
            });

            let remainingCount = listGroup.filter(t => t.total_subtasks === 0).length;
            listGroup.forEach(task => {
                remainingCount += task.open_subtasks;
            });

            messageField += (
                '```ini\n'
                + '[' + list.name + '] '
                + remainingCount + '/' + fullCount + '\n'
                + '```'
            );
        });

        message.addField('**Remaining tasks for project: ' + projectID + '**',
            messageField
        );
    }

    return message;
}

export async function dailyReportCommand(
    projects: string[],
    commandController: ICommandController,
    logger: Logger,
    message: discord.Message
): Promise<void> {
    message
        .channel
        .send(`Getting tasks... (This may take a while)`);

    try {
        message
            .channel
            .startTyping();

        message
            .channel
            .send(await commandController.dailyReport(projects));
    } catch (e) {
        message
            .channel
            .send('There was an error getting the tasks');
        logger.error(`Error getting tasks ` + e);
    }
}

export const dailyReportParseCommand = (
    args: string[],
    commandController: ICommandController,
    logger: Logger,
    message: discord.Message
) => {
    dailyReportCommand(args, commandController, logger, message);
};
