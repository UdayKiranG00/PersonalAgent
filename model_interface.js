//import { calendarToolDeclaration } from "./tooldesc.js";
import { gmailToolDeclaration } from "./tooldesc.js";
import { GoogleGenAI } from "@google/genai";

async function generateResponse(query) {
  const ai = new GoogleGenAI({});
  const prompt = `you are an expert gmail manager understands user query, plans and executes actions if necessary and gets tools responses,
  you will also get a summary of previous chat history of user intent and action executed along with latest user query/tool response,
  chat history is where the work got paused and can be referred for details, its imperative to read it before taking any action,
  calling a single tool if no response in <3 tries stop and inform user.
  Your instructions as gmail manager for different operations:
   - Mail display instructions:
     1. use the following structure From,Subject, Body(decode if encoded), messageId.
   - Delete Instructions is only when user query asks "delete rejection mails" or something similar(execution tool to delete: trash_gmail_message):
     Delete Execution process:
        1. get a single unread mail. 2. analyse the intent of the mail body. 3. confirm the user with message id and content and delete if it is job application rejection.
  Following is the chat. ${query}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemma-4-31b-it", //"gemini-3.5-flash","gemini-2.5-flash"
      contents: prompt,
      config: {
        tools: [gmailToolDeclaration],
      },
    });
    return response;
  } catch (error) {
    return "Error communicating with Gemini API:";
  }
}

async function chatSummariser(query) {
const ai = new GoogleGenAI({});
  const prompt = `You are a professional chat history summarizer. Analyze the provided chat history,
   which consists of user queries and the corresponding tool/function responses mediated by an LLM.
   The function data may vary in format (e.g., text, JSON, tables).
   For all interaction turns, analyze the data carefully and output a clear, concise, step-by-step summary
   detailing:User Intent: stating the user's query.
   Action Carried Out: The result of specific operations performed or data retrieved by the function.
   Ensure the output is highly structured so that another LLM can easily interpret the sequential context.
   Here is the chat history: ${query}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemma-4-31b-it", //,"gemini-2.5-flash"
      contents: prompt,
    });
    return response;
  } catch (error) {
    return "Error communicating with Gemini API:";
  }
}
export { generateResponse, chatSummariser };
