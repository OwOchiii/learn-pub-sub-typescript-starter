import amqp from "amqplib";
import {clientWelcome} from "../internal/gamelogic/gamelogic.js";
import {declareAndBind, SimpleQueueType} from "../internal/pubsub/consume.js";
import {ExchangePerilDirect, PauseKey} from "../internal/routing/routing.js";

async function main() {
  const rabbitConnString = "amqp://guest:guest@localhost:5672/";
  const conn = await amqp.connect(rabbitConnString);

  if (!conn) {
    throw new Error("Could not connect to RabbitMQ");
  }
  console.log("Connected to RabbitMQ");
  const channel = await conn.createChannel();
  if (!channel) {
    throw new Error("Could not create RabbitMQ channel");
  }
  console.log("RabbitMQ channel created");

  const username = await clientWelcome();
  const queueName = `pause.${username}`;
  await declareAndBind(conn,ExchangePerilDirect,queueName,PauseKey,SimpleQueueType.Transient)

  console.log("Starting Peril client...");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
