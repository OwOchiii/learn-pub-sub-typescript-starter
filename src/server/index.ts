import amqp from "amqplib";
import { publishJSON } from "../internal/pubsub/publish.js";
import { ExchangePerilDirect, PauseKey } from "../internal/routing/routing.js";
import type { PlayingState } from "../internal/gamelogic/gamestate.js";
import {getInput, printServerHelp} from "../internal/gamelogic/gamelogic.js";

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

  printServerHelp()

  while (true) {
    const input = await getInput()
    if (input.length === 0) {
      continue;
    }
    else if (input[0] === "pause") {
      console.log("Pausing game...");
      await publishJSON<PlayingState>(confirmChannel, ExchangePerilDirect, PauseKey, { isPaused: true });
    }
    else if (input[0] === "resume") {
      console.log("Resuming game...");
      await publishJSON<PlayingState>(confirmChannel, ExchangePerilDirect, PauseKey, { isPaused: false });
    }
    else if (input[0] === "quit") {
      console.log("Quitting...");
      await conn.close();
      process.exit(0);
    }
    else if (input[0] === "help") {
      printServerHelp();
    }
    else {
      console.log("Unknown command. Type 'help' for available commands.");
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
