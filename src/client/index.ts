import amqp from "amqplib";
import {clientWelcome} from "../internal/gamelogic/gamelogic.js";

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

  console.log("Starting Peril client...");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
