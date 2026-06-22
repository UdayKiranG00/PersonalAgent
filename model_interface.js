import { calendarToolDeclaration } from "./tooldesc.js";
import { commandToolDeclaration } from "./tooldesc.js";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

async function generateResponse(query) {
  const prompt = `you are an expert agent understands user query and calls function tools if necessary
  and gets function responses, you will also get a summary of previous queries and responses along with latest messages,
  so carefully understand and carry out the further actions very carefully. Do not get struck on calling single function tool if no response in <3 tries
  try relative alternate functions. To interact with specific services read and use commands from corresponding files, below are list of
  services and corresponding commands files.
  1. Calendar - 'gwsCal.txt' 2. GMail - 'gwsMail.txt'.
  Following is the chat. ${query}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemma-4-31b-it", //"gemini-3.5-flash","gemini-2.5-flash"
      contents: prompt,
      config: {
        tools: [commandToolDeclaration],
      },
    });

    return response;
  } catch (error) {
    return "Error communicating with Gemini API:";
  }
}

async function chatSummariser(query) {
  const prompt = `You are a professional chat history summarizer. Analyze the provided chat history,
   which consists of user queries and the corresponding tool/function responses mediated by an LLM.
   The function data may vary in format (e.g., text, JSON, tables).
   For all interaction turns, analyze the data carefully and output a clear, concise, step-by-step summary
   detailing:User Intent: The goal of the user's query.
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
