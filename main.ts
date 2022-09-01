require("dotenv").config();
import Discord from "discord.js-selfbot-v13";
import { writeFile } from "fs";
import { LOG_CHANNEL_ID, OWNER_ID, TOKEN } from "./config";
import { Stream } from "./stream";
let users = require("./users.json");

let intLoop: NodeJS.Timer | undefined;
let loop = false;
const reject = "❌";
const accept = "✅";
const prefix = "*";
const client = new Discord.Client();

let stream = new Stream(TOKEN);
const url_expression =
  /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
const url_regex = new RegExp(url_expression);

const helpMessage = `Help\n
    *p \`url\` | Youtube | direct link (without downloading)\n
    *play | Play video\n
    *pause | Pause video\n
    *duration | Show video duration\n
    *seek | Show current video time\n
    *seek \`sec, +sec, -sec\` | Change video time\n
    *loop | Toggle playing video on loop\n
    *stop | Stop streaming
`;

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
  if (msg.content.startsWith(prefix)) {
    const content = msg.content.split(" ");
    const command = content[0].split(prefix)[1];
    let voice_channel: Discord.VoiceBasedChannel | null | undefined;
    let id: string | null, url: string | null;

    if (OWNER_ID && !users.includes(msg.author.id) && msg.author.id != OWNER_ID) return;

    switch (command) {
      case "p":
        if (stream.in_progress && notAllowed(msg)) {
          msg.reply("Another session is already in progress");
          return;
        }

        voice_channel = msg.member?.voice.channel;
        if (!voice_channel) {
          msg.reply("You need to be in a voice channel to use this command");
          return;
        }

        stream.in_progress = true;
        stream.owner = msg.author.id;
        stream.guild_id = msg.guild?.id || "";
        stream.channel_id = voice_channel.id;
        url = content[content.length - 1];
        if (!url || !url.match(url_regex)) {
          msg.react(reject);
          return;
        }

        !stream.in_loading
          ? msg.channel.send("Please wait...").then((msg) => {
              // not safe...
              if (url?.includes("youtube.com") || url?.includes("youtu.be"))
                stream.load(url, true, msg);
              else stream.load(url, false, msg);
            })
          : msg.reply("Another video loading is already in progress, Try again later.");
        break;
      case "play":
        notAllowed(msg) ? msg.react(reject) : stream.play();
        break;
      case "pause":
        notAllowed(msg) ? msg.react(reject) : stream.pause();
        break;
      case "duration":
        stream.duration
          ? msg.channel.send(stream.hms(stream.duration))
          : msg.reply("N/A, try again later");
        break;
      case "seek":
        if (content[1]) notAllowed(msg) ? msg.react(reject) : stream.current(content[1]);
        else
          stream.current().then((result: any) => {
            if (result) msg.channel.send(stream.hms(result));
            else msg.reply("N/A, try again later");
          });
        break;
      case "loop":
        if (notAllowed(msg)) msg.react(reject);
        else {
          if (!loop) {
            loop = true;
            intLoop = setInterval(() => {
              stream.current().then((result: any) => {
                if (result >= stream.duration)
                  stream.driver.executeScript("video.play()");
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
      case "stop":
        if (notAllowed(msg)) msg.react(reject);
        else {
          stream.stop();
          if (stream.in_loading) stream.killed = true;
          stream.in_loading = false;
          stream.in_progress = false;
          msg.react(accept);
        }
        break;
      case "help":
        msg.channel.send(helpMessage);
        break;
      case "add":
        id = content[content.length - 1];
        if (!id || msg.author.id != OWNER_ID) return;

        users.push(id);
        writeFile("users.json", JSON.stringify(users), (err) => {
          if (err) {
            msg.channel.send(JSON.stringify(err));
            return;
          }

          msg.reply("User added");
        });
        break;
      case "remove":
        id = content[content.length - 1];
        if (!id || msg.author.id != OWNER_ID) return;

        if (!users.includes(id)) {
          msg.reply("User does not exist");
          return;
        }

        users = users.filter((e: string) => e != id);
        writeFile("users.json", JSON.stringify(users), (err) => {
          if (err) {
            msg.channel.send(JSON.stringify(err));
            return;
          }

          msg.reply("User removed");
        });
        break;
      case "list":
        msg.channel.send(users.length !== 0 ? users.join("\n\n") : "No user available");
        break;
      default:
        msg.reply("Unknown command, type `*help` for list of commands");
    }
    if (LOG_CHANNEL_ID)
      client.channels.cache
        .get(LOG_CHANNEL_ID)
        // @ts-ignore
        ?.send(
          `Command: ${msg.content}\nSender: ${msg.author.username} | ${msg.author.id}`,
        );
  }
});

client.login(TOKEN);
