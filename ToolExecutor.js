import { exec } from "child_process";
import { stdin as input, stdout as output } from "node:process";

async function executeCmd(cmd) {
  let cmdResponse = "";
  cmdResponse = await new Promise((resolve) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        resolve(error.message);
      } else if (stderr) {
        resolve(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
  if (cmdResponse === "") cmdResponse = "task executed successfully.";
  return cmdResponse;
}

async function executeTool(toolCall) {
  let toolResponse = "";
  let cmd = "";
  const { name, args } = toolCall;
  output.write("tool name: " + name);
  if (name === "execute_commands") {
    cmd = args.command;
  } else if (name === "read_message_details") {
    cmd = `gws gmail users messages get --params "{\\"userId\\": \\"me\\", \\"id\\": \\"${args.id}\\"}"`;
  } else if (name === "list_unread_messages") {
    const params = `{ \\"userId\\": \\"${args.userId}\\", \\"q\\": \\"${args.q}\\", \\"maxResults\\": \\"${args.maxResults}\\" }`;
    //command to list unread messages: gws gmail users messages list --params "{\"userId\": \"me\", \"q\": \"is:unread\", \"maxResults\": \"2\", \"pageToken\": \"18101350643833213025\"}"
    cmd = `gws gmail users messages list --params "${params}"`;
  } else if (name === "sendMails") {
    let mailStr = "";
    let len = args.mailList.length - 1;
    for (let i = 0; i < len; i++) {
      mailStr = mailStr + args.mailList[i] + ",";
    }
    mailStr = mailStr + args.mailList[len];
    cmd = `gws gmail +send --to ${mailStr} --subject "${args.subject}" --body "${args.body}"`;
  } else if (name === "trash_gmail_message") {
    cmd = `gws gmail users messages trash --params "{\\"userId\\":\\"me\\",\\"id\\":\\"${args.id}\\"}"`;
  }
  output.write("tool command: " + cmd);
  cmd = cmd + " >output.txt";
  await executeCmd(cmd);
  toolResponse = await executeCmd("type output.txt");
  //console.log(toolResponse);
  return toolResponse;
}

export { executeTool };
