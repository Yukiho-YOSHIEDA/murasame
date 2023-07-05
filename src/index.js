import DiscordClient from './client/DiscordClient';
import VoicevoxClient from './client/VoicevoxClient';
import InMemoryMessageStoreRepository from './repository/InMemoryMessageStoreRepository';
import SoundPlayer from './SoundPlayer';

/**
 * main関数
 */
const main = () => {
  if (process.argv.length < 3) {
    console.log('\x1b[31m設定ファイルを指定してください。\x1b[0m');
    return;
  }
  if (process.argv.length !== 3) {
    console.log('\x1b[31mコマンドライン引数が多すぎます。\x1b[0m');
    return;
  }

  // 設定ファイルの読み込み
  const settingFilePath = `../${process.argv[2]}`;
  import(settingFilePath)
    .then((setting) => {
      const soundPlayer = new SoundPlayer(
        setting.default.DISCORD.WAIT_TIME,
      );
      const discordClient = new DiscordClient(
        setting.default.DISCORD.TOKEN,
        setting.default.DISCORD.TARGET_VOICE_ROOM,
        setting.default.DISCORD.TARGET_CHAT_ROOM,
        setting.default.BLACKLIST.REGEX,
      );
      const voicevoxClient = new VoicevoxClient(
        setting.default.VOICEVOX.BASE_URL,
        setting.default.VOICEVOX.SPEAKER_ID,
      );
      const messageStore = new InMemoryMessageStoreRepository(setting.default.DISCORD.QUEUE_SIZE);

      discordClient.setOnGetMessageFunc((message) => {
        if (soundPlayer.isDown()) {
          return;
        }

        if (soundPlayer.isReady()) {
          soundPlayer.play();
          console.log('音声を生成します');
          voicevoxClient.generateVoice(message).then((voiceStream) => {
            console.log('音声を再生します');
            discordClient.play(voiceStream);
          });
        } else {
          console.log('メッセージをエンキューします');
          messageStore.enqueue(message);
        }
      });

      discordClient.setOnPlayedMessageFunc(() => {
        soundPlayer.stop();
      });

      discordClient.setOnJoinedVoiceChannelFunc(() => {
        soundPlayer.up();
      });

      discordClient.setOnLeftVoiceChannelFunc(() => {
        soundPlayer.down();
        messageStore.reset();
      });

      soundPlayer.setOnReadyFunc(() => {
        const message = messageStore.dequeue();
        if (!message) {
          return;
        }
        soundPlayer.play();
        console.log('キューから音声を生成します');
        voicevoxClient.generateVoice(message).then((voiceStream) => {
          console.log('キューから音声を再生します');
          discordClient.play(voiceStream);
        });
      });

      console.log(`ボイスチャンネル: ${setting.default.DISCORD.TARGET_VOICE_ROOM}, チャットチャンネル: ${setting.default.DISCORD.TARGET_CHAT_ROOM}`);

      // Discordと接続
      discordClient.start()
        .then(() => {
          console.log('Connect success');
        })
        .catch(() => {
          console.log('Connect failed');
        });
    })
    .catch((e) => {
      console.log(e);
      console.log(`\x1b[31m設定ファイルが存在しません。(${settingFilePath})\x1b[0m`);
    });
};

main();
