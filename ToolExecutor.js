import { exec } from "child_process";
import fs from "fs/promises";
import { stdin as input, stdout as output } from "node:process";
import * as cheerio from "cheerio";
import { generateResponse, categorizerPrompt } from "./model_interface.js";
import { categoryToolDeclaration } from "./tooldesc.js";
import { setScratchPad } from "./mongodb_interface.js";

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

let filePath = "E:/SampleAgent/output.txt";
async function extractMailContent() {
  let jsonStr = await fs.readFile(filePath, "utf-8");
  let mail = JSON.parse(jsonStr);
  let result = "";
  let headers = mail.payload.headers;
  result += headers[17].name + ": " + headers[17].value + "\n";
  result += headers[20].name + ": " + headers[20].value + "\n";
  result += "mailAddress" + ": " + headers[21].value + "\n";
  result += headers[22].name + ": " + headers[22].value + "\n";
  let decodedData = Buffer.from(
    mail.payload.parts[1].body.data,
    "base64",
  ).toString("utf-8");
  let extractHtml = await cheerio.load(decodedData);
  //output.write("cheerio extraction: "+extractHtml);
  result += "Data: " + (await extractHtml.text()) + "\n";
  await fs.writeFile(filePath, result, "utf-8");
}

async function executeCommands(toolResObj, cmd, args) {
  cmd = args.command;
  toolResObj.toolResponse += "[command used]: " + cmd;
  let response = await executeCmd(cmd);
  await fs.writeFile(filePath, response, "utf-8");
}

async function readMessageDetails(toolResObj, cmd, args) {
  cmd = `gws gmail users messages get --params "{\\"userId\\": \\"me\\", \\"id\\": \\"${args.id}\\"}"`;
  output.write("\ntool command: " + cmd);
  toolResObj.toolResponse += "[command used]: " + cmd;
  cmd = cmd + " >output.txt";
  await executeCmd(cmd);
    try {
      await extractMailContent();
    } catch (error) {
      await executeCmd(`echo ${error} > output.txt`);
    }
}

async function listsMessages(toolResObj, cmd, args) {
  const params = `{ \\"userId\\": \\"${args.userId}\\", \\"q\\": \\"${args.q}\\", \\"maxResults\\": \\"5\\" }`;
  //command to list unread messages: gws gmail users messages list --params "{\"userId\": \"me\", \"q\": \"is:unread\", \"maxResults\": \"2\", \"pageToken\": \"18101350643833213025\"}"
  cmd = `gws gmail users messages list --params "${params}"`;
  output.write("\ntool command: " + cmd);
  toolResObj.toolResponse += "[command used]: " + cmd;
  cmd = cmd + " >output.txt";
  await executeCmd(cmd);
}

async function sendMails(toolResObj, cmd, args) {
  let mailStr = "";
  let len = args.mailList.length - 1;
  for (let i = 0; i < len; i++) {
    mailStr = mailStr + args.mailList[i] + ",";
  }
  mailStr = mailStr + args.mailList[len];
  cmd = `gws gmail +send --to ${mailStr} --subject "${args.subject}" --body "${args.body}" --html`;
  output.write("tool command: " + cmd);
  toolResObj.toolResponse += "[command used]: " + cmd;
  cmd = cmd + " >output.txt";
  await executeCmd(cmd);
}

async function trashGmailMessage(toolResObj, cmd, args) {
  cmd = `gws gmail users messages trash --params "{\\"userId\\":\\"me\\",\\"id\\":\\"${args.id}\\"}"`;
  output.write("\ntool command: " + cmd);
  toolResObj.toolResponse += "[command used]: " + cmd;
  cmd = cmd + " >output.txt";
  await executeCmd(cmd);
}

async function saveContact(toolResObj, cmd, args) {
  cmd = `echo {"name":"${args.name}","mailAddress":"${args.mailAddress}"} >> contacts.txt`;
  output.write("\ntool command: " + cmd);
  toolResObj.toolResponse += "[command used]: " + cmd;
  await executeCmd(cmd);
  await executeCmd(`type Nul > output.txt`);
}

async function readContactsList(toolResObj, cmd, args) {
  cmd = `type contacts.txt`;
  output.write("\ntool command: " + cmd);
  toolResObj.toolResponse += "[command used]: " + cmd;
  cmd = cmd + " >output.txt";
  await executeCmd(cmd);
}

async function trashAutomation(toolResObj, cmd, args) {
  cmd = `gws gmail users messages list --params "{\\"userId\\": \\"me\\", \\"q\\": \\"all\\"}" >output.txt`;
  await executeCmd(cmd);
  let filePath = "E:/SampleAgent/output.txt";
  let msgListStr = await fs.readFile(filePath, "utf-8");
  let msgList = JSON.parse(msgListStr).messages;
  for (let i = 0; i < msgList.length; i++) {
    cmd = `gws gmail users messages get --params "{\\"userId\\": \\"me\\", \\"id\\": \\"${msgList[i].id}\\"}" > output.txt`;
    await executeCmd(cmd);
    output.write(`\nmessageId: ${msgList[i].id}`);
    try {
      await extractMailContent();
    } catch (error) {
      output.write(`error: ${error}`);
      continue;
    }
    let input = await fs.readFile(filePath, "utf-8");
    output.write(`\n input: ${input}\n`);
    let response = await generateResponse(input, categorizerPrompt, [
      categoryToolDeclaration,
    ]);
    if (response.functionCalls?.length > 0) {
      let category = response.functionCalls[0].args.category;
      output.write(`\ncategory: ${category}, : ${i} \n\n`);
      if (category === "Other") continue;
      cmd = `gws gmail users messages trash --params "{\\"userId\\":\\"me\\",\\"id\\":\\"${msgList[i].id}\\"}" >output.txt`;
      await executeCmd(cmd);
    }
  }
  await executeCmd(`type Nul > output.txt`);
}

async function saveScratchPad(toolResObj,cmd,args){
    output.write(`scratchpad from llm: ${args.content}`);
    await setScratchPad(args.content);
    await executeCmd(`echo "updated scratchpad successfully." > output.txt`);
}
const taskItems = [];
async function appendTask(toolResObj,cmd,args){
  const item = {id:args.id,taskDescription:args.task_description,status:args.status};
  taskItems.push(item);
  await executeCmd(`echo "appended task successfully of id: ${args.id}" > output.txt`);
}

async function updateTask(toolResObj,cmd,args){
    for(let item of taskItems){
        if(item.id === args.id){
            if(args?.task_description){item.taskDescription = args.task_description;}
            if(args?.status){item.status = args.status;}
        }
    }
    await executeCmd(`echo "updated task successfully of id: ${args.id} to ${args.status}" > output.txt`);
}

async function readTasks(toolResObj,cmd,args){
    let taskList = "";
    for(let item of taskItems){
        taskList += "id: "+item.id;
        taskList += "task_description: "+ item.taskDescription;
        taskList += "status: "+ item.status + "\n";
    }
    await fs.writeFile(filePath,taskList,"utf-8");
}

const toolFnMap = new Map([
  ["execute_commands", executeCommands],
  ["read_message_details", readMessageDetails],
  ["lists_messages", listsMessages],
  ["send_mails", sendMails],
  ["trash_gmail_message", trashGmailMessage],
  ["save_contact", saveContact],
  ["read_contacts_list", readContactsList],
  ["trash_automation", trashAutomation],
  ["save_scratchpad", saveScratchPad],
  ["append_task", appendTask],
  ["update_task", updateTask],
  ["read_tasks", readTasks]
]);

async function executeTool(toolCall) {
  let cmd = "";
  const toolResObj = {
    toolResponse: "",
  };
  const { name, args } = toolCall;
  output.write(`\n[tool call]: ${name}`);
  //calls corresponding functions.
  await toolFnMap.get(name)(toolResObj, cmd, args);

  toolResObj.toolResponse += await executeCmd("type output.txt");
  //console.log(toolResponse);
  return toolResObj.toolResponse;
}

export { executeTool };
