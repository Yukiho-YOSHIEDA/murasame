/**
 * Discord操作クラス
 */
import { AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel, StreamType } from '@discordjs/voice';
import { Client, Events, GatewayIntentBits } from 'discord.js';

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
    this.token = token;
    this.targetVoiceRoom = targetVoiceRoom;
    this.targetChatRoom = targetChatRoom;
    this.regex = regex;
    this.onGetMessageFunc = () => {};
    this.onPlayedMessageFunc = () => {};
    this.onJoinedVoiceChannelFunc = () => {};
    this.onLeftVoiceChannelFunc = () => {};

    this.voiceChannelConnection = null;

    this.voicePlayer = createAudioPlayer();
    this.voicePlayer.on(AudioPlayerStatus.Idle, () => {
      console.log('メッセージの再生を終えたのだ');
      this.onPlayedMessageFunc();
    });

    this.getUserName = (member) => (member.nickname ? member.nickname : member.displayName);
    this.connectVoiceChannel = (client, channelId, guild) => {
      if (this.voiceChannelConnection) {
        return;
      }

      const connection = joinVoiceChannel({
        channelId: channelId,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
      });

      this.voiceChannelConnection = connection;
      console.log('ボイスチャンネルに入室できたのだ');
      this.onJoinedVoiceChannelFunc();
    };
    this.disconnectVoiceChannel = (client, channel) => {
      if (!this.voiceChannelConnection) {
        return;
      }

      if (channel.members.size > 1) {
        return;
      }

      console.log('ボイスチャンネルから退出するのだ');
      this.voiceChannelConnection.destroy();
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
    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
      ],
    });

    client.on(Events.Error, (...args) => {
      args.forEach((el) => {
        console.log(el);
      });
    });

    client.once(Events.ClientReady, () => {
      // botの準備できたら呼び出されるイベント
      console.log('Ready!');
    });

    client.on(Events.VoiceStateUpdate, (oldState, newState) => {
      const member = newState.member || oldState.member;

      // botユーザは対象外
      if (!member || member.user.bot) {
        return;
      }

      // 入室処理
      if (!oldState.channelId && newState.channelId) {
        // 入室処理
        const username = this.getUserName(member);
        console.log(`${username}[${member.id}] が チャンネル ${newState.channel.name} に入室しました。`);
        if (newState.channel.name !== this.targetVoiceRoom || member.user.bot) {
          return;
        }
        this.connectVoiceChannel(client, newState.channelId, newState.guild);
      }

      // 退室処理
      if (oldState.channelId && !newState.channelId){
        const username = this.getUserName(member);
        console.log(`${username}[${member.id}] が チャンネル ${oldState.channel.name} を退室しました。`);
        if (oldState.channel.name !== this.targetVoiceRoom) {
          return;
        }
        this.disconnectVoiceChannel(client, oldState.channel);
      }

      // チャンネル移動
      if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
        const username = this.getUserName(member);
        console.log(`${username}[${member.id}] が チャンネル ${oldState.channel.name} から チャンネル ${newState.channel.name} に移動しました。`);
        if (newState.channel.name !== this.targetVoiceRoom && oldState.channel.name !== this.targetVoiceRoom) {
          return;
        }

        if (newState.channel.name === this.targetVoiceRoom) {
          this.connectVoiceChannel(client, newState.channelId, newState.guild);
        } else {
          this.disconnectVoiceChannel(client, oldState.channel);
        }
      }
    });

    client.on(Events.MessageCreate, (message) => {
      if (message.channel.name !== this.targetChatRoom || !message.content) {
        return;
      }
      console.log(`ターゲットチャンネルへのメッセージを取得: ${message.content}`);
      let parsedUrlMessage;
      for (const index in this.regex) {
        if (message.content.match(this.regex[index])){
          parsedUrlMessage = message.content.replace(this.regex[index], '');
          break;
        } else {
          parsedUrlMessage = message.content;
        }
      }
      if (parsedUrlMessage.length <= 0) {
        return;
      };
      const trimmedMessage = parsedUrlMessage.length > 100 ? `${parsedUrlMessage.substring(0, 100)}以下略` : parsedUrlMessage;
      this.onGetMessageFunc(trimmedMessage);
    });

    return client.login(this.token);
  }

  play(voiceStream) {
    if (!this.voiceChannelConnection) {
      return;
    }

    const resource = createAudioResource(voiceStream, {
      inputType: StreamType.Arbitrary,
    });

    this.voicePlayer.play(resource);
    this.voiceChannelConnection.subscribe(this.voicePlayer);
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
