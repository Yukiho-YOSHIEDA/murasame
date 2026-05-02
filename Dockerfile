FROM node:22

RUN apt-get -y update && apt-get -y upgrade && apt-get -y install ffmpeg

# パッケージ定義をコピー
COPY package*.json /murasame/

# 依存関係のインストール
RUN cd /murasame && npm install --omit=dev

# 実行コマンドのデフォルト
CMD ["npm", "run", "start", "settings.js"]
