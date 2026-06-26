import { exec } from "child_process";
import fs from "fs/promises";
import { stdin as input, stdout as output } from "node:process";
import * as cheerio from "cheerio";
import { generateResponse,categorizerPrompt } from "./model_interface.js";
import { categoryToolDeclaration } from "./tooldesc.js";

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

async function extractMailContent(){
 let filePath = "E:/SampleAgent/output.txt";
 let jsonStr = await fs.readFile(filePath,"utf-8");
 let mail = JSON.parse(jsonStr);
 let result = "";
 let headers = mail.payload.headers;
 result += headers[17].name +": "+headers[17].value+"\n";
 result += headers[20].name +": "+headers[20].value+"\n";
 result += "mailAddress" +": "+headers[21].value+"\n";
 result += headers[22].name +": "+headers[22].value+"\n";
 let decodedData =  Buffer.from(mail.payload.parts[1].body.data,"base64").toString("utf-8");
 let extractHtml = await cheerio.load(decodedData);
 //output.write("cheerio extraction: "+extractHtml);
 result += "Data: " + await extractHtml.text() +"\n";
 await fs.writeFile(filePath,result,"utf-8");
}


async function executeTool(toolCall) {
  let toolResponse = "";
  let cmd = "";
  const { name, args } = toolCall;
  output.write("tool name: " + name);
  if (name === "execute_commands") {
    cmd = args.command;
    output.write("tool command: " + cmd);
    cmd = cmd + " >output.txt";
    await executeCmd(cmd);
  } else if (name === "read_message_details") {
    cmd = `gws gmail users messages get --params "{\\"userId\\": \\"me\\", \\"id\\": \\"${args.id}\\"}"`;
    output.write("tool command: " + cmd);
    cmd = cmd + " >output.txt";
    await executeCmd(cmd);
    await extractMailContent();
  } else if (name === "lists_messages") {
    const params = `{ \\"userId\\": \\"${args.userId}\\", \\"q\\": \\"${args.q}\\", \\"maxResults\\": \\"1\\" }`;
    //command to list unread messages: gws gmail users messages list --params "{\"userId\": \"me\", \"q\": \"is:unread\", \"maxResults\": \"2\", \"pageToken\": \"18101350643833213025\"}"
    cmd = `gws gmail users messages list --params "${params}"`;
    output.write("tool command: " + cmd);
    cmd = cmd + " >output.txt";
    await executeCmd(cmd);
  } else if (name === "sendMails") {
    let mailStr = "";
    let len = args.mailList.length - 1;
    for (let i = 0; i < len; i++) {
      mailStr = mailStr + args.mailList[i] + ",";
    }
    mailStr = mailStr + args.mailList[len];
    cmd = `gws gmail +send --to ${mailStr} --subject "${args.subject}" --body "${args.body}" --html`;
    output.write("tool command: " + cmd);
    cmd = cmd + " >output.txt";
    await executeCmd(cmd);
  } else if (name === "trash_gmail_message") {
    cmd = `gws gmail users messages trash --params "{\\"userId\\":\\"me\\",\\"id\\":\\"${args.id}\\"}"`;
    output.write("tool command: " + cmd);
    cmd = cmd + " >output.txt";
    await executeCmd(cmd);
  }else if (name === "save_contact") {
    cmd = `echo {"name":"${args.name}","mailAddress":"${args.mailAddress}"} >> contacts.txt`;
    output.write("tool command: " + cmd);
    await executeCmd(cmd);
    await executeCmd(`type Nul > output.txt`);
  }else if (name === "read_contacts_list") {
    cmd =  `type contacts.txt`;
    output.write("tool command: " + cmd);
    cmd = cmd + " >output.txt";
    await executeCmd(cmd);
  }else if (name === "trash_automation") {

       cmd = `gws gmail users messages list --params "{\\"userId\\": \\"me\\", \\"q\\": \\"all\\"}" >output.txt`;
       await executeCmd(cmd);
       let filePath = "E:/SampleAgent/output.txt";
       let msgListStr = await fs.readFile(filePath,"utf-8");
       let msgList = JSON.parse(msgListStr).messages;
       output.write(`\n\nmsgList length: ${msgList.length}`);
       for(let i=0;i<msgList.length;i++){
         cmd = `gws gmail users messages get --params "{\\"userId\\": \\"me\\", \\"id\\": \\"${msgList[i].id}\\"}" > output.txt`;
         await executeCmd(cmd);
         output.write(`\nmessageId: ${msgList[i].id}`);
         try{
            await extractMailContent();
         }catch(error){
           output.write(`error: ${error}`);
           continue;
         }
         let input = await fs.readFile(filePath,"utf-8");
         output.write(`\n input: ${input}\n`);
         let response = await generateResponse(input,categorizerPrompt,[categoryToolDeclaration]);
         if(response.functionCalls?.length>0){
            let category = response.functionCalls[0].args.category;
            output.write(`\ncategory: ${category}, : ${i} \n\n`);
            if(category === "Other") continue;
            cmd = `gws gmail users messages trash --params "{\\"userId\\":\\"me\\",\\"id\\":\\"${msgList[i].id}\\"}" >output.txt`;
            let trashautoresponse = await executeCmd(cmd);
         }
       }
       await executeCmd(`type Nul > output.txt`);
  }

  toolResponse = await executeCmd("type output.txt");
  toolResponse += "command used: "+cmd;
  //console.log(toolResponse);
  return toolResponse;
}

export { executeTool };
