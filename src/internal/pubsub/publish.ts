import type {ConfirmChannel} from "amqplib";

export function publishJSON<T>(
    ch: ConfirmChannel,
    exchange: string,
    routingKey: string,
    value: T,
): Promise<void>{
    return new Promise<void>((resolve, reject) => {
        const jsonBytes = Buffer.from(JSON.stringify(value));
        const ok = ch.publish(exchange, routingKey, jsonBytes, { contentType: "application/json" });
        if (!ok) {
            reject(new Error("Failed to publish message"));
        } else {
            resolve();
        }
    });
}
