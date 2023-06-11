# Murasame
老人ホームのずんだもん

部室のゆかりさんがずんだもんに変化してDiscordに帰ってきた

村雨とずんだもんってビジュアルが似てるよね。。。

## これは何？
Discordでチャットしたものをずんだもんが代読してくれるBot

## 必須要件
node.js v18以上

## 使い方
1. `$ cp settings_sample.js settings.js`
1. `setting.js`に各トークンを設定
1. `$ npm install`
1. `$ docker compose up -d`

## 他の部屋でも代読したい場合
**別のプロセスで起動する必要があります**
1. `$ cp settings_sample.js settings2.js`
1. `setting.js`に各トークンを設定
1. docker composeをコピーして `services > server > command` を書き換える
1. docker composeコマンドで起動

## settingsファイルについて
```javascript
const setting = {
  DISCORD: {
    TARGET_VOICE_ROOM: '', // 読み上げる部屋名
    TARGET_CHAT_ROOM: '', // 読み上げるメッセージの取得元部屋名
    TOKEN: '', // DiscordのBotトークン
    WAIT_TIME: 1, // メッセージ間のインターバル
    QUEUE_SIZE: 100, // 保持できるメッセージの最大数
  },
  VOICEVOX: {
    BASE_URL: 'http://engine:50021', // VOICEVOX APIのBase URL（基本的に変更の必要なし）
    SPEAKER_ID: 3, // ずんだもんはIDが3
  },
  BLACKLIST: {
    REGEX: [
      /https?:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#\u3000-\u30FE\u4E00-\u9FA0\uFF01-\uFFE3]+/g, // URL検出
      /<(:|@).*>/g, // カスタム絵文字とメンション
      /?.*/g, // ミュートprefix "?"
    ],
  },
};

export default {
  DISCORD: setting.DISCORD,
  VOICEVOX: setting.VOICEVOX,
  BLACKLIST: setting.BLACKLIST,
};
```

## つくったひと
Yukiho @Yukiho-YOSHIEDA

## LICENSE
MIT
