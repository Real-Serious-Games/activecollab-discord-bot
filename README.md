# Active Collab Discord Bot

This is a Discord bot for Active Collab, it can send notifications to specified channels for task and comment events in Active Collab as well as respond to commands. It is written in TypeScript and runs on Node.js and Express.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

* [NPM](https://www.npmjs.com)
* [Node](https://nodejs.org/en/)
* A [Discord](https://discordapp.com) account to create the Discord App with
* A Discord account with *Manage Server* permissions for your guild, this can be the same account as above
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
- *guildName:* Discord guild name
- *channels:* An array that maps Active Collab project IDs to Discord channels
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
    "guildName": "Great Guild Good Job",
    "channels": [
        {"projectId": 49, "channelName": "Project-X"},
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

Or to rebuild and run the server when the source changes:

```
npm run watch
```

### Running tests

The bot uses Jest as a test framework, to run tests automatically on source change:

```
npm run test
```

### Running with Docker

Running the bot using the Docker container automatically exposes port 80 and uses the production configuration.

```
docker build -t activecollab-discord-bot .
docker run -p 8080:80 activecollab-discord-bot
```

### Deployment

You can deploy with or without the Docker container, however if you deploy without it you will need to configure the project to use production mode.

Once you have deployed the bot Active Collab needs to be configured to POST to it, to do so go to https://app.activecollab.com, sign in and browse to Add-Ons. From there configure the Webhooks add-on specifying the target URL (<server address>/api/webhook) and the secret which you have specified in *config.json*.

### Built with

- Node.js
- TypeScript
- Express
- Discord.js
- Jest

### License

This project is licensed under the MIT License.
