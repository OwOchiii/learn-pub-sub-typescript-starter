import amqp from "amqplib";
import { clientWelcome, getInput, printClientHelp, printQuit, commandStatus } from "../internal/gamelogic/gamelogic.js";
import { declareAndBind, SimpleQueueType } from "../internal/pubsub/consume.js";
import { ExchangePerilDirect, PauseKey } from "../internal/routing/routing.js";
import { commandSpawn } from "../internal/gamelogic/spawn.js";
import { commandMove } from "../internal/gamelogic/move.js";
import { GameState } from "../internal/gamelogic/gamestate.js";

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
  const gs = new GameState(username);
  const queueName = `pause.${username}`;
  await declareAndBind(conn, ExchangePerilDirect, queueName, PauseKey, SimpleQueueType.Transient);

  console.log("Starting Peril client...");

  while (true) {
    const words = await getInput();
    if (words.length === 0) continue;

    switch (words[0]) {
      case "spawn":
        try { commandSpawn(gs, words); } catch (e) { console.error(e); }
        break;
      case "move":
        try { commandMove(gs, words); console.log("Move successful"); } catch (e) { console.error(e); }
        break;
      case "status":
        await commandStatus(gs);
        break;
      case "help":
        printClientHelp();
        break;
      case "spam":
        console.log("Spamming not allowed yet!");
        break;
      case "quit":
        printQuit();
        process.exit(0);
      default:
        console.log(`Unknown command: ${words[0]}. Type 'help' for available commands.`);
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
