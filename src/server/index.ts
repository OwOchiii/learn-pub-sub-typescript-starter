import amqp from "amqplib";
import { publishJSON } from "../internal/pubsub/publish.js";
import { ExchangePerilDirect, PauseKey } from "../internal/routing/routing.js";
import type { PlayingState } from "../internal/gamelogic/gamestate.js";

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

  const confirmChannel = await conn.createConfirmChannel();
  if (!confirmChannel) {
    throw new Error("Could not create RabbitMQ confirm channel");
  }
  console.log("RabbitMQ confirm channel created");

  console.log("Starting Peril server...");

  await publishJSON<PlayingState>(confirmChannel, ExchangePerilDirect, PauseKey, { isPaused: true });
  console.log("Published pause message");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
