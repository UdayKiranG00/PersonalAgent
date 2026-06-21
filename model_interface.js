import {calendarToolDeclaration} from './tooldesc.js';
import {commandToolDeclaration} from './tooldesc.js';
import { GoogleGenAI } from "@google/genai";

async function generateResponse(query) {

  const ai = new GoogleGenAI({});

  const prompt = `you are an expert agent understands user query and calls function tools if necessary
  and gets function responses, you will get a summary of queries and responses so carefully understand
  and carry out the further actions. Do not get struck on calling single function tool if no response in <3 tries
  try relative functions.${query}`;

  try {

    const response = await ai.models.generateContent({
      model: "gemma-4-31b-it", //"gemini-3.5-flash","gemini-2.5-flash"
      contents: prompt,
      config: {
        tools: [commandToolDeclaration]
      }
    });

    return response;

  } catch (error) {
    return "Error communicating with Gemini API:";
  }
}

export {generateResponse};