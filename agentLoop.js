import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { executeTool } from "./ToolExecutor.js";
import {
  generateResponse,
  summariserPrompt,
  gmailPrompt
} from "./model_interface.js";
import { gmailToolDeclaration, commandToolDeclaration, planningToolDeclaration } from "./tooldesc.js";
import { getGmailConfig, getScratchPad, setScratchPad } from "./mongodb_interface.js";

const EXIT = new Set(["/exit", "/quit", "exit", "quit"]);
function shouldExit(line) {
  return EXIT.has(line.trim().toLowerCase());
}

async function main() {
  const rl = createInterface({ input, output });
  const [gmailToolDefinitions,gmailSystemPrompt] = await getGmailConfig();// use mongodb gmail prompt later for now using application gmail prompt
  await setScratchPad("");
  let scratchPad = await getScratchPad();
  let msgHistory = [];
  while (true) {
    //input
    let userQuery = await rl.question("You> ");
    userQuery = "User Query: " + userQuery;
    msgHistory.push(userQuery);

    if (shouldExit(userQuery)) break;
    console.log(msgHistory.toString());
    let modelResponse = await generateResponse(
      msgHistory.toString(),
      gmailPrompt,
      gmailToolDefinitions,
    );
    let count = 1;
    while (modelResponse.functionCalls?.length > 0) {
    output.write(`\nLength in loop ${count} is: ${modelResponse.functionCalls?.length}`);
      for (let i = 0; i < modelResponse.functionCalls.length; i++) {
        msgHistory.push("[Tool Call]: " + modelResponse.functionCalls[i].name);
        let toolResponse = await executeTool(modelResponse.functionCalls[i]);
        toolResponse = "[Tool Response]: " + toolResponse;
        output.write(`\n${toolResponse}\n`);
        msgHistory.push(toolResponse);
      }
      modelResponse = await generateResponse(
        scratchPad+msgHistory.toString(),
        gmailPrompt,
        gmailToolDefinitions,
      );
      scratchPad = await getScratchPad();
      output.write(`\nscratch pad: ${scratchPad}`);
      count++;
    }
    output.write(`\nSummarising the data...\n`);
    let chatSummary = await generateResponse(
          msgHistory.toString(),
          summariserPrompt,
          [],
        );
    output.write(`\nfinal model output: ${modelResponse.text}\n`);
    msgHistory.push(modelResponse.text);
    //output.write(`\nchat summary: ${chatSummary.text}`);
    msgHistory = [chatSummary.text];
  }

  rl.close();
}
main();
