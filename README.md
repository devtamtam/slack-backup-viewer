# Backup Viewer

Backup Viewer is a tool designed to visualize and manage backups created by the `slack_convosaver` tool. It provides a user-friendly interface to browse and interact with archived Slack conversations and their associated files.

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/devtamtam/slack-backup-viewer.git
   cd backup-viewer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Usage

1. Ensure you have backups created by `slack_convosaver` https://github.com/devtamtam/slack_convosaver 

2. The entire backup folder `backup` should be copied to the `public` folder of this project.

3. Run the development server as described in the installation steps.

4. Open your browser and navigate to `http://localhost:3000` to view and interact with the backups.

5. And open json file from `public/Backup/`

## Interaction with `slack_convosaver`

`slack_convosaver` is a Python script that archives Slack conversations and downloads associated files. It saves messages in timestamped JSON files and stores downloaded files in a structured directory format. These backups can be visualized using the Backup Viewer.

### Setting up `slack_convosaver`

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install required packages:
   ```bash
   pip install slack_sdk requests
   ```

3. Create a `settings.json` file with your Slack credentials:
   ```json
   {
       "SLACK_BOT_TOKEN": "your-slack-bot-token",
       "CHANNEL_ID": "your-channel-id"
   }
   ```

4. Run the script:
   ```bash
   python convo_saver.py
   ```

   This will generate timestamped JSON files and download associated files into a structured directory.

### Visualizing Backups

Once the backups are created, copy them into the `public/Backup/` folder of the Backup Viewer project. Start the Backup Viewer server to browse and interact with the archived data.