import { REJECT, URL_REGEX } from "../config";
import type { CommandContext } from "./types";
import { notAllowed } from "./_utils";

export default function prepare({ stream, msg, content }: CommandContext) {
  if (stream.in_progress && notAllowed(stream, msg)) {
    msg.reply("Another session is already in progress");
    return;
  }

  const voice_channel = msg.member?.voice.channel;
  if (!voice_channel) {
    msg.reply("You need to be in a voice channel to use this command");
    return;
  }

  stream.in_progress = true;
  stream.owner = msg.author.id;
  stream.guild_id = msg.guild?.id || "";
  stream.channel_id = voice_channel.id;
  const url = content[content.length - 1];
  if (!url || !url.match(URL_REGEX)) return msg.react(REJECT);

  !stream.in_loading
    ? msg.channel.send("Please wait...").then((msg) => {
        // not safe...
        if (url.includes("youtube.com") || url.includes("youtu.be"))
          stream.load(url, true, msg);
        else stream.load(url, false, msg);
      })
    : msg.reply("Another video loading is already in progress, Try again later.");
}
