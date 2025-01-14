import { REJECT } from "../config";
import type { CommandContext } from "./types";
import { notAllowed } from "./_utils";

export default function seek({ stream, msg, content }: CommandContext) {
  if (content[1])
    notAllowed(stream, msg) ? msg.react(REJECT) : stream.current(content[1]);
  else
    stream.current()?.then((result: string) => {
      const v = parseFloat(result);
      if (result) msg.channel.send(stream.hms(v).toString());
      else msg.reply("N/A, try again later");
    });
}
