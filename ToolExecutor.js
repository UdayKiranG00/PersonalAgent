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

async function executeTool(fnObj) {
  let toolResponse = "";
  const toolName = fnObj.name;
  output.write(toolName);
  let cmd = "";
  if (toolName === "quick_add_event") {
    let calName = fnObj.args.calendar_name;
    let date = fnObj.args.date;
    let time = fnObj.args.time;
    let eventName = fnObj.args.event_name;
    //output.write(calName + date+time+eventName);
    cmd = `gcalcli --calendar ${calName} quick "${date} ${time} ${eventName}"`;
    toolResponse = await executeCmd(cmd);
    if (toolResponse.trim() === "") {
      toolResponse = "event added successfully to calendar.";
    }
  } else if (toolName === "list_agenda_7_days") {
    cmd = `gcalcli agenda`;
    toolResponse = await executeCmd(cmd);
  } else if (toolName === "execute_commands") {
    let command = fnObj.args.command;
    output.write(command);
    cmd = command + " >output.txt";
    toolResponse = await executeCmd(cmd);
    toolResponse = await executeCmd("type output.txt");
  }

  console.log(toolResponse);
  return toolResponse;
}

//executeTool({});
export { executeTool };
