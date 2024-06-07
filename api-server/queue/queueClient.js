import amqplib from "amqplib";
import "dotenv/config";

const { RABBITMQ } = process.env;

export const queueClient = async () => {
    try {
        const connection = await amqplib.connect(RABBITMQ);
        console.log('Connected to RabbitMQ server.');

        // Logic for consuming or publishing messages can be placed here

        // Listen for connection close events
        connection.on('close', () => {
            console.log('Connection to RabbitMQ closed. Reconnecting...');
            setTimeout(connect, 1000); // Attempt to reconnect after 1 second
        });

        // Listen for connection error events
        connection.on('error', (err) => {
            console.error('Connection error:', err.message);
        });
        return connection 
    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error.message);
        // Retry connection after a delay
        setTimeout(connection, 1000);
    }
}

