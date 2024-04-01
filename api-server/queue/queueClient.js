const amqplib = require('amqplib');
import 'dotenv/config'


const {RABBITMQ} = process.env

export const queueClient = async () => {
    const conn = await amqplib.connect(RABBITMQ);
    return conn
}   

