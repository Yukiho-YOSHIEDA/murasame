/**
 * Discord操作クラス
 */
import Eris from 'eris';

export default class DiscordClient {
  /**
   * コンストラクタ
   *
   * @param {String} token
   * @param {String} targetVoiceRoom
   * @param {String} targetChatRoom
   * @param {String} regex
   */
  constructor(token, targetVoiceRoom, targetChatRoom, regex) {
    this.bot = new Eris(token);
    this.targetVoiceRoom = targetVoiceRoom;
    this.targetChatRoom = targetChatRoom;
    this.regex = regex;
    this.onGetMessageFunc = () => {};
    this.onPlayedMessageFunc = () => {};
    this.onJoinedVoiceChannelFunc = () => {};
    this.onLeftVoiceChannelFunc = () => {};

    this.voiceChannelConnection = null;

    this.getUserName = (member) => (member.nick ? member.nick : member.username);
    this.connectVoiceChannel = (channelId) => {
      if (this.voiceChannelConnection) {
        return;
      }
      this.bot.getChannel(channelId).join().then((connection) => {
        connection.on('end', () => {
          console.log('メッセージの再生を終えたのだ');
          this.onPlayedMessageFunc();
        });
        this.voiceChannelConnection = connection;
        console.log('ボイスチャンネルに入室できたのだ');
        this.onJoinedVoiceChannelFunc();
      });
    };
    this.disconnectVoiceChannel = (channelId) => {
      if (!this.voiceChannelConnection) {
        return;
      }
      if (this.bot.getChannel(channelId).voiceMembers.size > 1) {
        return;
      }
      console.log('ボイスチャンネルから退出するのだ');
      this.voiceChannelConnection.disconnect();
      this.voiceChannelConnection = null;
      this.onLeftVoiceChannelFunc();
    };
  }

  /**
   * Discordに接続します。
   *
   * @returns {Promise} 接続結果
   */
  start() {
    this.bot.on('error', (...args) => {
      args.forEach((el) => {
        console.log(el);
      });
    });

    this.bot.on('ready', () => {
      // botの準備できたら呼び出されるイベント
      console.log('Ready!');
    });

    this.bot.on('voiceChannelJoin', (member, channel) => {
      // 入室処理
      const username = this.getUserName(member);
      console.log(`${username}[${member.id}] が チャンネル ${channel.name} に入室しました。`);
      if (channel.name !== this.targetVoiceRoom || member.bot) {
        return;
      }
      this.connectVoiceChannel(channel.id);
    });

    this.bot.on('voiceChannelSwitch', (member, newChannel, oldChannel) => {
      // 部屋を入れ替えた処理
      const username = this.getUserName(member);
      console.log(`${username}[${member.id}] が チャンネル ${oldChannel.name} から チャンネル ${newChannel.name} に移動しました。`);
      if (newChannel.name !== this.targetVoiceRoom && oldChannel.name !== this.targetVoiceRoom) {
        return;
      }

      if (newChannel.name === this.targetVoiceRoom) {
        this.connectVoiceChannel(newChannel.id);
      } else {
        this.disconnectVoiceChannel(oldChannel.id);
      }
    });

    this.bot.on('voiceChannelLeave', (member, channel) => {
      // 退室処理
      const username = this.getUserName(member);
      console.log(`${username}[${member.id}] が チャンネル ${channel.name} を退室しました。`);
      if (channel.name !== this.targetVoiceRoom) {
        return;
      }
      this.disconnectVoiceChannel(channel.id);
    });

    this.bot.on('messageCreate', (message) => {
      if (message.channel.name !== this.targetChatRoom || !message.content) {
        return;
      }
      console.log(`ターゲットチャンネルへのメッセージを取得: ${message.content}`);
      let parsedUrlMessage;
      for (const index in this.regex) {
        if(message.content.match(this.regex[index])){
          parsedUrlMessage = message.content.replace(this.regex[index], '');
          break;
        }else{
          parsedUrlMessage = message.content;
        }
      }
      if(parsedUrlMessage.length <= 0){
        return;
      };
      const trimmedMessage = parsedUrlMessage.length > 100 ? `${parsedUrlMessage.substring(0, 100)}以下略` : parsedUrlMessage;
      this.onGetMessageFunc(trimmedMessage);
    });

    return this.bot.connect();
  }

  play(voiceStream) {
    if (!this.voiceChannelConnection) {
      return;
    }
    this.voiceChannelConnection.play(voiceStream);
  }

  /**
   * メッセージを取得したときのコールバックをセット
   *
   * @param {Function} onGetMessageFunc メッセージを取得したときのコールバック
   */
  setOnGetMessageFunc(onGetMessageFunc) {
    this.onGetMessageFunc = onGetMessageFunc;
  }

  /**
   * メッセージを再生し終えたときのコールバックをセット
   *
   * @param {Function} onPlayedMessageFunc メッセージを再生し終えたときのコールバック
   */
  setOnPlayedMessageFunc(onPlayedMessageFunc) {
    this.onPlayedMessageFunc = onPlayedMessageFunc;
  }

  /**
   * ボイスチャンネルに入室したときのコールバックをセット
   *
   * @param {Function} onJoinedVoiceChannelFunc ボイスチャンネルに入室したときのコールバック
   */
  setOnJoinedVoiceChannelFunc(onJoinedVoiceChannelFunc) {
    this.onJoinedVoiceChannelFunc = onJoinedVoiceChannelFunc;
  }

  /**
   * ボイスチャンネルに退室したときのコールバックをセット
   *
   * @param {Function} onLeftVoiceChannelFunc ボイスチャンネルに退室したときのコールバック
   */
  setOnLeftVoiceChannelFunc(onLeftVoiceChannelFunc) {
    this.onLeftVoiceChannelFunc = onLeftVoiceChannelFunc;
  }
}
