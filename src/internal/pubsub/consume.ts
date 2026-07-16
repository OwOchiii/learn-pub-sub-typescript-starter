import amqp from "amqplib";
import type { Channel } from "amqplib";

export async function declareAndBind(
    conn: amqp.ChannelModel,
    exchange: string,
    queueName: string,
    key: string,
    queueType: SimpleQueueType,
): Promise<[Channel, amqp.Replies.AssertQueue]>{
    return new Promise(async (resolve, reject) => {
        const channel = await conn.createChannel()
        const queue = await channel.assertQueue(queueName, { durable: queueType === SimpleQueueType.Durable,
            autoDelete: queueType === SimpleQueueType.Transient, exclusive: queueType === SimpleQueueType.Transient });
        await channel.bindQueue(queue.queue, exchange, key);
        resolve([channel, queue]);
    })
}

export enum SimpleQueueType {
    Durable,
    Transient,
}