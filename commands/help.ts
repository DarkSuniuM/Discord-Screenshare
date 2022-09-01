import { CommandContext } from "./types";

const helpMessage = `Help\n
    *p \`url\` | Youtube | direct link (without downloading)\n
    *play | Play video\n
    *pause | Pause video\n
    *duration | Show video duration\n
    *seek | Show current video time\n
    *seek \`sec, +sec, -sec\` | Change video time\n
    *loop | Toggle playing video on loop\n
    *stop | Stop streaming
`;

export default function ({ msg }: CommandContext) {
  return msg.channel.send(helpMessage);
}
