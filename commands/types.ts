import type { Stream } from "../stream";
import type Discord from "discord.js-selfbot-v13";

export type CommandContext = {
  stream: Stream;
  msg: Discord.Message<boolean>;
  content: string[];
  command: string;
};
