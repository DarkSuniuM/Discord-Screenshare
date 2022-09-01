import type Discord from "discord.js-selfbot-v13";
import { PREFIX } from "../config";
import { Stream } from "../stream";
import type { CommandContext } from "./types";

export const notAllowed = (stream: Stream, msg: Discord.Message<boolean>) => {
  return (
    stream.owner !== msg.author.id &&
    stream.owner !== process.env.owner_id &&
    !msg.member?.permissions.has("ADMINISTRATOR")
  );
};

export const contextFactory = (stream: Stream, msg: Discord.Message<boolean>) =>
  ({
    content: msg.content.split(" "),
    command: msg.content.split(" ")[0].split(PREFIX)[1],
    msg,
    stream,
  } as CommandContext);
