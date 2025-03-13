import chalk from 'chalk';
import debounce from 'lodash/debounce';
import { App, LogLevel } from '@slack/bolt';
import Bot from './bot';
import { error } from '../util';

class SlackBot extends Bot {
  app: App;

  constructor() {
    super();

    this.app = new App({
      socketMode: true, // Enable the socket mode
      token: process.env.SLACK_BOT_TOKEN,
      appToken: process.env.SLACK_APP_TOKEN,
      logLevel: process.env.DEBUG === 'debug' ? LogLevel.DEBUG : LogLevel.INFO
    });
  }

  async say() {}


  private isSlackFormatMrkdwn(): boolean {
    return process.env.SLACK_FORMAT === 'mrkdwn';
  }

  private async handleSlackMessage(
    client: any,
    channel: string,
    thread_ts: string,
    text: string,
    user: string
  ) {
    const inputs = {};
    const query = text;

    let params = {
      channel: channel,
      thread_ts: thread_ts,
    }

    if (this.isSlackFormatMrkdwn()) {
      Object.assign(params, {
        mrkdwn: true,
        markdown_text: `<@${user}>! Thinking...`
      });
    } else {
      Object.assign(params, {
        text: `<@${user}>! Thinking...`
      });
    }

    const response = await client.chat.postMessage(params);

    if (response.channel && response.ts) {
      await this.handleMessageResponse(
        client,
        inputs,
        query,
        user,
        response.channel,
        response.ts
      );
    }
  }

  private handleMessageResponse = async (
    client: any,
    inputs: any,
    query: string,
    user: string,
    channel: string,
    ts: string
  ) => {
    try {
      this.send(inputs, query, user, async (msg, err) => {
        console.log('dify message........', msg)
        if (err) {
          msg = 'Error while sending message to dify.ai'
          this.debouncedChatUpdate(
            client,
            channel,
            ts,
            msg
          );
        } else {
          this.debouncedChatUpdate(
            client,
            channel,
            ts,
            msg || 'sec.., let me thinking.'
          );
        }
      });
    } catch (e) {
      error('Error while sending message to slack');
      error(`${e}`);
    }
  };

  handleDirectMessage = async ({ message, client, event}: { message: any; client: any; event: any }) => {
    if (message.subtype === undefined || message.subtype === 'bot_message') {
      await this.handleSlackMessage(
        client,
        message.channel,
        message.event_ts,
        event.text,
        event.user || ''
      );
    } else {
      console.log("handleDirectMessage.....message", message)
      const { text } = message.message
      const isUpdateText = message.previous_message.text !== message.message.text
      if (isUpdateText && message.subtype === 'message_changed'){
        const event_ts = message.message.ts
        const channel = message.channel
        this.debouncedChatUpdate(
          client,
          channel,
          event_ts,
          text || 'sec.., let me thinking.'
        );
      }
    }
  };

  debouncedChatUpdate = debounce(async (client, channel, ts, text) => {
    const params = { channel, ts };

    try {
      if (this.isSlackFormatMrkdwn()) {
        Object.assign(params, {
          mrkdwn: true,
          markdown_text: text,
        });
      } else {
        Object.assign(params, {
          text: text,
        });
      }
      await client.chat.update(params);
    } catch (e) {
      error('debouncedChatUpdate: Error while sending message to slack');
      error(`catch.....err.....${e}`);
    }
  }, 500);

  handleAppMention = async ({ event, client }: { event: any; client: any }) => {
    await this.handleSlackMessage(
      client,
      event.channel,
      event.ts,
      event.text,
      event.user || ''
    );
  };

  // handleHello = async ({ message, say, event, client }: { event: any; client: any; message: any; say: any; }) => {
  //   await say({
  //     blocks: [
  //       {
  //         "type": "section",
  //         "text": {
  //           "type": "mrkdwn",
  //           "text": `Hey there <@${message.user}>!`
  //         },
  //         "accessory": {
  //           "type": "button",
  //           "text": {
  //             "type": "plain_text",
  //             "text": "Click Me"
  //           },
  //           "action_id": "button_click"
  //         }
  //       }
  //     ],
  //     text: `Hey there <@${message.user}>!`
  //   });
  // };

  async hear() {
    // this.app.message('hello', this.handleHello);
    this.app.message(this.handleDirectMessage);
    this.app.event('app_mention', this.handleAppMention);
  }

  async up() {
    await this.app.start();
    console.log(chalk.blue('⚡️ Slack app started'));
  }
}

export default SlackBot;
