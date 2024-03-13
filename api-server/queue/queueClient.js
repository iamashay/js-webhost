const amqplib = require('amqplib');
require('dotenv').config()

const {RABBITMQ} = process.env

const queueClient = async () => {
    const conn = await amqplib.connect(RABBITMQ);
    return conn
}   

module.exports = {queueClient}