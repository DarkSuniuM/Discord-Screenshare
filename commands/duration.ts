import type { CommandContext } from "./types";

export default function duration({ stream, msg }: CommandContext) {
  stream.duration
    ? msg.channel.send(stream.hms(stream.duration))
    : msg.reply("N/A, try again later");
}
