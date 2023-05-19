FROM node:18

RUN apt-get -y update && apt-get -y upgrade && apt-get -y install ffmpeg

CMD [ "node" ]
