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
      output.write(`modelrestext> ${modelResponse.text}`);
      for (let i = 0; i < modelResponse.functionCalls.length; i++) {
        msgHistory.push(
          "function Call: " + modelResponse.functionCalls[i].name,
        );
        let toolResponse = await executeTool(modelResponse.functionCalls[i]);
        toolResponse = "function Response: " + toolResponse;
        output.write(`msgHistory> ${toolResponse.toString()}`);
        msgHistory.push(toolResponse.toString());
      }
      modelResponse = await generateResponse(msgHistory.toString());
      let chatSummary = await chatSummariser(msgHistory.toString());
      msgHistory = [chatSummary.text];
    }
    output.write(`msgHistory> ${msgHistory.toString()}`);
    output.write(`finaloutput> ${modelResponse.text}\n\n`);
    msgHistory.push(modelResponse.text);
  }

  rl.close();
}
main();
