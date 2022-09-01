import { REJECT } from "../config";
import type { CommandContext } from "./types";
import { notAllowed } from "./_utils";

export default function pause({ stream, msg }: CommandContext) {
  notAllowed(stream, msg) ? msg.react(REJECT) : stream.pause();
}
