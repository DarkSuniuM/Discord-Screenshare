import { REJECT } from "../config";
import type { CommandContext } from "./types";
import { notAllowed } from "./_utils";

export default function play({ stream, msg }: CommandContext) {
  notAllowed(stream, msg) ? msg.react(REJECT) : stream.play();
}
