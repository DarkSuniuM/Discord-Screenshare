import duration from "./duration";
import help from "./help";
import pause from "./pause";
import play from "./play";
import prepare from "./prepare";
import seek from "./seek";
import stop from "./stop";
import { CommandContext } from "./types";

const COMMANDS: { [p: string]: (context: CommandContext) => void } = {
  prepare,
  play,
  duration,
  help,
  pause,
  seek,
  stop,
} as const;

export default COMMANDS;
