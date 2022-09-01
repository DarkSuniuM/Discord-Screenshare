require("dotenv").config();
import Discord from "discord.js-selfbot-v13";
import COMMANDS from "./commands";
import { contextFactory } from "./commands/_utils";
import { OWNER_ID, PREFIX, REJECT, TOKEN } from "./config";
import { Stream } from "./stream";
let users = require("./users.json");

let intLoop: NodeJS.Timer | undefined;
let loop = false;
const client = new Discord.Client();

let stream = new Stream(TOKEN);

const notAllowed = (msg: Discord.Message<boolean>) => {
  return (
    stream.owner !== msg.author.id &&
    stream.owner !== OWNER_ID &&
    !msg.member?.permissions.has("ADMINISTRATOR")
  );
};

client.on("ready", () => {
  console.log("Bot started");
});

client.on("messageCreate", (msg) => {
  if (!msg.content.startsWith(PREFIX)) return;
  const { command, ...context } = contextFactory(stream, msg);

  if (OWNER_ID && !users.includes(msg.author.id) && msg.author.id != OWNER_ID) return;

  const fn = COMMANDS[command];
  if (fn) {
    return fn({ command, ...context });
  }
  switch (command) {
    case "loop":
      if (notAllowed(msg)) msg.react(REJECT);
      else {
        if (!loop) {
          loop = true;
          intLoop = setInterval(() => {
            stream.current().then((result: any) => {
              if (result >= stream.duration) stream.driver.executeScript("video.play()");
            });
          }, 100);
          msg.reply("Video loop set");
        } else {
          loop = false;
          clearInterval(intLoop);
          msg.reply("Video loop unset");
        }
      }
      break;
    default:
      msg.reply("Unknown command, type `*help` for list of commands");
  }
});

client.login(TOKEN);
