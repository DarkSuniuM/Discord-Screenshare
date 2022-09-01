require("dotenv").config();
import Discord from "discord.js-selfbot-v13";
import COMMANDS from "./commands";
import { contextFactory } from "./commands/_utils";
import { PREFIX, TOKEN } from "./config";
import { Stream } from "./stream";

const client = new Discord.Client();

let stream = new Stream(TOKEN);

client.on("ready", () => {
  console.log("Bot started");
});

client.on("messageCreate", (msg) => {
  if (!msg.content.startsWith(PREFIX)) return;
  const { command, ...context } = contextFactory(stream, msg);

  const fn = COMMANDS[command];
  if (fn) {
    return fn({ command, ...context });
  }
  msg.reply("Unknown command, type `*help` for list of commands");
});

client.login(TOKEN);
