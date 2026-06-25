import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { executeTool } from "./ToolExecutor.js";
import { generateResponse, chatSummariser } from "./model_interface.js";

const EXIT = new Set(["/exit", "/quit", "exit", "quit"]);
function shouldExit(line) {
  return EXIT.has(line.trim().toLowerCase());
}

async function main() {
  const rl = createInterface({ input, output });

  let msgHistory = [];
  while (true) {
    //input
    let userQuery = await rl.question("You> ");
    userQuery = "User Query: " + userQuery;
    msgHistory.push(userQuery);

    if (shouldExit(userQuery)) break;

    let modelResponse = await generateResponse(userQuery);

    while (modelResponse.functionCalls?.length > 0) {
      for (let i = 0; i < modelResponse.functionCalls.length; i++) {
        msgHistory.push(
          "Tool Call: " + modelResponse.functionCalls[i].name,
        );
        let toolResponse = await executeTool(modelResponse.functionCalls[i]);
        toolResponse = "Tool Response: " + toolResponse;
        output.write(`tool response: ${toolResponse}\n`);
        msgHistory.push(toolResponse);
      }
      output.write(`message history: ${msgHistory.toString()}`);
      modelResponse = await generateResponse(msgHistory.toString());
      let chatSummary = await chatSummariser(msgHistory.toString());
      output.write(`chat summary: ${chatSummary.text}`);
      msgHistory = [chatSummary.text];
    }
    output.write(`message history: ${msgHistory}`);
    output.write(`final model output: ${modelResponse.text}\n\n`);
    msgHistory.push(modelResponse.text);
  }

  rl.close();
}
main();
