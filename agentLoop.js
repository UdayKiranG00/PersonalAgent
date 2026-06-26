import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { executeTool } from "./ToolExecutor.js";
import { generateResponse, summariserPrompt, gmailPrompt } from "./model_interface.js";
import { gmailToolDeclaration ,commandToolDeclaration} from "./tooldesc.js";

const EXIT = new Set(["/exit", "/quit", "exit", "quit"]);
function shouldExit(line) {
  return EXIT.has(line.trim().toLowerCase());
}

async function main() {
  const rl = createInterface({ input, output });
  let toolDeclarations = [gmailToolDeclaration,commandToolDeclaration];
  let msgHistory = [];
  while (true) {
    //input
    let userQuery = await rl.question("You> ");
    userQuery = "User Query: " + userQuery;
    msgHistory.push(userQuery);

    if (shouldExit(userQuery)) break;
    console.log(msgHistory.toString());
    let modelResponse = await generateResponse(msgHistory.toString(),gmailPrompt,toolDeclarations);

    while (modelResponse.functionCalls?.length > 0) {
      for (let i = 0; i < modelResponse.functionCalls.length; i++) {
        msgHistory.push("Tool Call: " + modelResponse.functionCalls[i].name);
        let toolResponse = await executeTool(modelResponse.functionCalls[i]);
        toolResponse = "Tool Response: " + toolResponse;
        output.write(`tool response: ${toolResponse}\n`);
        msgHistory.push(toolResponse);
      }
      modelResponse = await generateResponse(msgHistory.toString(),gmailPrompt,toolDeclarations);
    }
    output.write(`final model output: ${modelResponse.text}\n\n`);
    msgHistory.push(modelResponse.text);
    let chatSummary = await generateResponse(msgHistory.toString(),summariserPrompt,[]);
    output.write(`chat summary: ${chatSummary.text}`);
    msgHistory = [chatSummary.text];
  }

  rl.close();
}
main();
