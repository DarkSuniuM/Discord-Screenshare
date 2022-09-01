import { ACCEPT, REJECT } from "../config";
import type { CommandContext } from "./types";
import { notAllowed } from "./_utils";

export default function stop({ msg, stream }: CommandContext) {
  if (notAllowed(stream, msg)) msg.react(REJECT);
  else {
    stream.stop();
    if (stream.in_loading) stream.killed = true;
    stream.in_loading = false;
    stream.in_progress = false;
    msg.react(ACCEPT);
  }
}
