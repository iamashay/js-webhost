FROM ubuntu:jammy

ENV NODE_VERSION=20.11.1
ENV NVM_VER=v0.39.7
RUN apt-get update
RUN apt-get -y install git
WORKDIR /home/app/output
RUN mkdir /root/.ssh && chmod 0700 /root/.ssh && ssh-keyscan -t rsa github.com >> /root/.ssh/known_hosts 

