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

  handleHello1 = async ({ message, say, client, event}: { message: any; say: any, client: any, event: any }) => {
    // await say(`Hey there!`);

    if (message.subtype === undefined || message.subtype === 'bot_message') {
      console.log("1..................handleHello:",  message);

      const inputs = {};
      const query = event.text;
      const user = event.user || '';
      const reversedText = [...message.text].reverse().join("");
      // await say(reversedText);

      const response = await client.chat.postMessage({
        channel: message.channel,
        thread_ts: message.event_ts,
        text: `<@${user}>! Thinking...`
      });
      try {
        if (response.channel && response.ts) {
          this.send(inputs, query, user, async (msg, err) => {
            console.log('msg.....', msg)
            if (err) {
              console.log('err.....', err)
              await client.chat.update({
                channel: response.channel,
                ts: response.ts,
                text: 'Error while sending message to dify.ai'
              });
            } else {
              try {
                this.debouncedChatUpdate(
                  client,
                  response.channel,
                  response.ts,
                  msg || 'sec.., let me thinking.'
                );
              } catch (e){
                error('Error while sending message to slack');
                error(`catch.....err.....${e}`);
              }
            }
          });
        }
      } catch (e) {
        error('Error while sending message to slack');
        error(`catch.....err.....${e}`);
      }
    } else {
      try {
        console.log("2..................handleHello:",  message);
        const { text } = message.message
        if (message.subtype === 'message_changed'){
          console.log("2..................handleHello:",  message);
        }

        const isUpdateText = message.previous_message.text !== message.message.text

        console.log('isUpdateText....:', isUpdateText)

        if (isUpdateText && message.subtype === 'message_changed'){
          // const event_ts = message.event_ts
          const event_ts = message.message.ts
          const channel = message.channel
          this.debouncedChatUpdate(
            client,
            channel,
            event_ts,
            text || 'sec.., let me thinking. 2'
          );
        }
      } catch (e) {
        error('Error while sending message to slack');
        error(`catch.....err.....${e}`);
      }
    }
  }

  handleHello = async ({ message, say, client, event}: { message: any; say: any, client: any, event: any }) => {
    console.log("..................handleHello:",  message);
    console.log("..................event:",  event);
    let current_message = message;
    let current_message_channel = message.channel;

    if (message.subtype === 'message_changed') {
      current_message = message.message;
      current_message_channel = message.channel;
    }

    const inputs = {};
    const query = current_message.text;
    const user = current_message.user || '';

    if (message.subtype === 'message_changed') {

    } else {
      const response = await client.chat.postMessage({
        channel: current_message_channel,
        thread_ts: current_message.event_ts,
        text: `<@${user}>! Thinking...`
      });
    }
    // .................handleHello: {
    //   type: 'message',
    //   subtype: 'message_changed',
    //   message: {
    //     user: 'U08FF4BD7R7',
    //     type: 'message',
    //     edited: { user: 'B08FF4BC1FB', ts: '1741793564.000000' },
    //     bot_id: 'B08FF4BC1FB',
    //     app_id: 'A08F0KRSAA1',
    //     text: 'Error while sending message to <http://dify.ai|dify.ai>',
    //     team: 'T025WBQV074',
    //     bot_profile: {
    //       id: 'B08FF4BC1FB',
    //       app_id: 'A08F0KRSAA1',
    //       name: 'DifyOABot',
    //       icons: [Object],
    //       deleted: false,
    //       updated: 1741080408,
    //       team_id: 'T025WBQV074'
    //     },
    //     thread_ts: '1741793484.620209',
    //     parent_user_id: 'U0262HS14BE',
    //     blocks: [ [Object] ],
    //     ts: '1741793486.102099',
    //     source_team: 'T025WBQV074',
    //     user_team: 'T025WBQV074'
    //   },

    // console.log("..................event:",  event);
    // console.log("..................client:",  client);
    // ..................handleHello: {
    //   user: 'U0262HS14BE',
    //   type: 'message',
    //   ts: '1741789190.572569',
    //   client_msg_id: '284e9644-1895-4c18-a526-09f45c371930',
    //   text: 'hello',
    //   team: 'T025WBQV074',
    //   blocks: [ { type: 'rich_text', block_id: 'ZL1yL', elements: [Array] } ],
    //   channel: 'D08FF4BF6NM',
    //   event_ts: '1741789190.572569',
    //   channel_type: 'im'
    // }
    // this.debouncedChatUpdate(client: client)
    // await say(`Hey there!`);


    // ..................event: {
    //   user: 'U0262HS14BE',
    //   type: 'message',
    //   ts: '1741794111.755819',
    //   client_msg_id: 'e0681b14-f734-4356-9849-b88bc4ff75c1',
    //   text: 'what you name?',
    //   team: 'T025WBQV074',
    //   blocks: [ { type: 'rich_text', block_id: '5/jyj', elements: [Array] } ],
    //   channel: 'D08FF4BF6NM',
    //   event_ts: '1741794111.755819',
    //   channel_type: 'im'
    // }

    // console.log('response.channel.......', response.channel)
    // console.log('response.ts.......', response.ts)
    try {
      if (current_message_channel && current_message.event_ts) {
        console.log('inputs.......', inputs)
        console.log('query.......', query)
        console.log('user.......', user)

        this.send(inputs, query, user, async (msg, err) => {
          if (err) {
            await client.chat.update({
              channel: current_message_channel,
              ts: current_message.event_ts,
              text: 'Error while sending message to dify.ai'
            });
          } else {
            this.debouncedChatUpdate(
              client,
              current_message_channel,
              current_message.event_ts,
              msg || 'sec.., let me thinking.'
            );
          }
        });
      }
    } catch (e) {
      error('Error while sending message to slack');
      error(`catch.....err.....${e}`);
    }

    // this.handleAppMention({event: event, client: client});
  };

  debouncedChatUpdate = debounce(async (client, channel, ts, text) => {
    // 1 debouncedChatUpdate--- channel: D08FF4BF6NM, ts: 1741801818.121349
    // 2 debouncedChatUpdate--- channel: D08FF4BF6NM, ts: 1741801840.016100
    try{
      await client.chat.update({
        channel: channel,
        ts: ts,
        text: text
      });
      this.debugLog(`1 debouncedChatUpdate--- channel: ${channel}, ts: ${ts}`);

    }catch(e){
      this.debugLog(`2 debouncedChatUpdate--- channel: ${channel}, ts: ${ts}`);
      error('Error while sending message to slack');
      error(`catch.....err.....${e}`);
    }
  }, 500);

  handleAppMention = async ({ event, client }: { event: any; client: any }) => {
    const inputs = {};
    const query = event.text;
    const user = event.user || '';

    const response = await client.chat.postMessage({
      channel: event.channel,
      thread_ts: event.ts,
      text: `<@${user}>! Thinking...`
    });

    try {
      if (response.channel && response.ts) {
        this.send(inputs, query, user, async (msg, err) => {
          console.log('msg.....', msg)
          if (err) {
            console.log('err.....', err)
            await client.chat.update({
              channel: response.channel,
              ts: response.ts,
              text: 'Error while sending message to dify.ai'
            });
          } else {
            this.debouncedChatUpdate(
              client,
              response.channel,
              response.ts,
              msg || 'sec.., let me thinking.'
            );
          }
        });
      }
    } catch (e) {
      error('Error while sending message to slack');
      error(`catch.....err.....${e}`);
    }
  };

  async hear() {
    this.app.message(this.handleHello1);

    // this.app.message('hello', this.handleHello);
    this.app.event('app_mention', this.handleAppMention);
  }

  async up() {
    await this.app.start();
    console.log(chalk.blue('⚡️ Slack app started'));
  }
}

export default SlackBot;
