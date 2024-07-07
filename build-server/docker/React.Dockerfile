FROM ubuntu:jammy

ENV NODE_VERSION=20.11.1
ENV NVM_VER=v0.39.7
RUN apt-get update
RUN apt-get -y install git
RUN apt install -y curl
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/${NVM_VER}/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"
RUN node --version
RUN npm --version
WORKDIR /home/app/output
RUN mkdir /root/.ssh && chmod 0700 /root/.ssh && ssh-keyscan -t rsa github.com >> /root/.ssh/known_hosts 

