import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { executeTool } from "./ToolExecutor.js";
import { generateResponse } from "./model_interface.js";

const EXIT = new Set(["/exit","/quit","exit","quit"]);
function shouldExit(line){
return EXIT.has(line.trim().toLowerCase());
}

async function main(){

const rl = createInterface({input,output});

const msgHistory = [];
while(true){
//input
let userQuery = await rl.question("You> ");
userQuery = "User Query: "+userQuery;

msgHistory.push(userQuery);

if(shouldExit(userQuery)) break;

let modelResponse = await generateResponse(userQuery);

while(modelResponse.functionCalls?.length>0){
output.write(`len> ${modelResponse.functionCalls?.length}`);
output.write(`text> ${modelResponse.text}`);
output.write(`msgHist> ${msgHistory.toString()}`);
for(let i=0;i<modelResponse.functionCalls.length;i++){
msgHistory.push("function Call: " + modelResponse.functionCalls[i].name);
let toolResponse = await executeTool(modelResponse.functionCalls[i]);
toolResponse = "function Response: " + toolResponse;
msgHistory.push(toolResponse.toString());
output.write(`toolresponse> ${toolResponse}`)
}

modelResponse = await generateResponse(msgHistory.toString());

}
output.write(`finaloutput> ${modelResponse.text}\n\n`);
msgHistory.push(modelResponse.text);

}

rl.close();

}
main();



