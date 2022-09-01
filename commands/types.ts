import type Discord from "discord.js-selfbot-v13";
import type { Stream } from "../stream";

export type CommandContext = {
  stream: Stream;
  msg: Discord.Message<boolean>;
  content: string[];
  command: string;
};
