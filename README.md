# Active Collab Discord Bot
[![Build Status](https://travis-ci.org/Real-Serious-Games/activecollab-discord-bot.svg?branch=master)](https://travis-ci.org/Real-Serious-Games/activecollab-discord-bot) [![NSP Status](https://nodesecurity.io/orgs/rsg/projects/63275344-d29a-4122-92b2-3d92506f6578/badge)](https://nodesecurity.io/orgs/rsg/projects/63275344-d29a-4122-92b2-3d92506f6578)

This is a Discord bot for Active Collab. It can send notifications to specified channels for task and comment events in Active Collab as well as respond to commands. It is written in TypeScript and runs on Node.js and Express.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installing](#installing)
    - [Setup Discord App](#setup-discord-app)
    - [Create Active Collab User](#create-active-collab-user)
    - [Setup Config](#setup-config)
    - [Running the Server](#running-the-server)
  - [Running with Docker](#running-with-docker)
  - [Deployment](#deployment)
  - [Commands](#commands)
- [Getting involved](#getting-involved)
  - [Running tests](#running-tests)
- [API](#api)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

* [Node](https://nodejs.org/en/) version 8.
* A [Discord](https://discordapp.com) account to create the Discord App with
* A Discord account with *Manage Server* permissions for your guild. This can be the same account as above
* An ActiveCollab instance with an account the bot can log in as.
* (optional) [Docker](https://www.docker.com)

### Installing

Clone the latest copy of the repo, install and build:

```
git clone https://github.com/Real-Serious-Games/activecollab-discord-bot.git activecollab-discord-bot
cd activecollab-discord-bot
npm install
npm run build
```

Before you can run the project you will need to create a *config.json* file, which requires details from Discord and Active Collab.

#### Setup Discord App

1. Sign into [Discord](https://discordapp.com) and go to the [applications page](https://discordapp.com/developers/applications/me)
2. Create a new App, I called mine *ActiveCollabBot*
3. Once created go to the Bot section of the page, click to reveal the token and take note of it as it will be used in the *config.json* file
4. The bot will need to be invited to your Guild:
   1. Click *Generate OAUth2 URL*
   2. The default scope of "bot" is enough
   3. Copy the URL and have a user with *"Manage Server"* permissions for the guild add the bot to the server

#### Create Active Collab User

A user will be needed to make requests to Active Collab, they will need at least read access to all projects you want notifications for and write access if you want the bot to be able to make changes.

Note their username and password as they will be needed in *config.json*.

#### Setup Config

config.json is a JSON object with the following fields:

- *discordBotToken:* Discord app token found on your Discord application's page
- *webhookSecret:* Used to verify requests sent to the server, this should be a randomly generated string
- *activeCollab:*
  - *connectionStr:* The base URL for making requests to ActiveCollab, *(https://app.activecollab.com/<account ID>)*
  - *email:* Active Collab user email address
  - *password:* Active Collab user password
- *guildNames:* Names of Discord guild names the bot is invited to
- *commandPrefix:* The prefix used to specify that a message is a command
- *channels:* An array that maps Active Collab project IDs to Discord channels and Guilds
- *users:* An array that maps Active Collab user IDs to Discord users *(<Username>#<tag>)*

Example config:
```json
{
    "discordBotToken": "AONdas0924nASdoasd",
    "webhookSecret": "AOHdas0dh0qhed2d",
    "activeCollab": {
         "connectionStr": "https://app.activecollab.com/23432523",
         "email": "account@email.com",
         "password": "verySecurePassword"
    },
    "guildNames": ["Great Guild Good Job", "The Real Guild"],
    "commandPrefix": "!",
    "channels": [
        {"projectId": 49, "channelName": "Project-X", "guildIndex": 0},
        {"projectId": 49, "channelName": "Project-X", "guildIndex": 1},
        {"projectId": 78, "channelName": "Project-Y", "guildIndex": 1},
    ],
    "users": [
        {"discordUser": "TokyoToon#4984", "activeCollabUser": 48},
    ]
}
```

Create *config.json* in the root directory of the project.

#### Running the Server

```
npm start
```

### Running with Docker

Running the bot using the Docker container automatically exposes port 80 and uses the production configuration.

```
docker build -t activecollab-discord-bot .
docker run -p 8080:80 activecollab-discord-bot
```

### Deployment

You can deploy with or without the Docker container.

Once you have deployed the bot Active Collab needs to be configured to POST to it, to do so go to https://app.activecollab.com, sign in and browse to Add-Ons. From there configure the Webhooks add-on specifying the target URL (<server address>/api/webhook) and the secret which you have specified in *config.json*.

### Commands

The bot currently supports 5 different commands, listed below with a prefix of '!':

* _!tasks list_ - lists your tasks
* _!tasks list_ for @user - lists tasks for mentioned user
* _!tasks due_ - lists tasks due this week for current channel's project
* _!help_ - lists all commands
* _!commands_ - lists all commands

Commands can be triggered from any channel the bot is present in and has read/write access as well as by messaging the bot directly. Note that some commands will only function if sent from an appropriate channel.

## Getting involved

If you find a bug or want to add a feature, feel free to [raise an issue](https://github.com/Real-Serious-Games/activecollab-discord-bot/issues) or create a pull request. If you are creating a new pull request, please make sure that your new code has good test coverage and passes the build (including TSLint). You should also make sure that your editor supports [EditorConfig](http://editorconfig.org/) so that it can be set up to match the style of our existing code.

To rebuild and run the server when the source changes:

```
npm run watch
```

### Running tests

The bot uses Jest as a test framework, which can be run from the command line:
```
npm run test
```

The test runner can also run in the background and automatically re-run tests when it detects code changes:
```
npm run watch-test
```

## API

Active Collab will send the correct POST requests, however manually testing events can be useful and can be done by sending POST requests to the server. Payloads used for testing purposes can be found in *test/testData.ts*.

```
POST /api/webhook

headers:
X-Angie-WebhookSecret: AOHdas0dh0qhed2d
Content-Type: application/json
```
```json
body:
{
  "payload": {
    "id": 288,
    "class": "Task",
    "url_path": "\/projects\/2\/tasks\/288",
    "name": "Example Task",
    "assignee_id": 18,
    "delegated_by_id": 18,
    "completed_on": null,
    "completed_by_id": null,
    "is_completed": false,
    "comments_count": 0,
    "attachments": [

    ],
    "labels": [

    ],
    "is_trashed": false,
    "trashed_on": null,
    "trashed_by_id": 0,
    "project_id": 2,
    "is_hidden_from_clients": false,
    "body": "",
    "body_formatted": "",
    "created_on": 1515388565,
    "created_by_id": 18,
    "updated_on": 1515388565,
    "updated_by_id": 18,
    "task_number": 33,
    "task_list_id": 3,
    "position": 18,
    "is_important": false,
    "start_on": null,
    "due_on": null,
    "estimate": 0,
    "job_type_id": 0,
    "total_subtasks": 0,
    "completed_subtasks": 0,
    "open_subtasks": 0,
    "created_from_recurring_task_id": 0
  },
  "timestamp": 1515388565,
  "type": "TaskCreated"
}
```
