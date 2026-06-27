import { GoogleGenAI } from "@google/genai";

const gmailPrompt = `you are a technical gmail manager understands user query, plans and executes actions if necessary and gets tools responses,
                       you will also get a summary of previous chat history of user intent and action executed along with latest user query/tool response,
                       chat history is where the work got paused and can be referred for details, its imperative to read it before taking any action,
                       calling a single tool? if no response in <3 tries stop and inform user.
                       Use a scratchpad to write down your approach and thoughts(scratchpad save tool: save_scratchpad, the scratchpad gets overwrite).

                       As a task planner break down the task to sub-tasks to reach the goal, if number of tasks is >2 then append task items to task list for tracking.
                       Task management tools(append_task,update_task,read_tasks). Each task item has id,task description,status("pending","done","cancelled","failed").
                       Instructions on tasks management:
                       1. when a task completes update as "done".
                       2. when a task fails or a breakdown occurs, replan your approach efficiently minding current state(update scratchpad), update task items.
                       3. when a task is not required update as "cancelled".
                       4. is goal reached? check task items, and confirm user with final response.

                       Instructions as gmail manager for different operations:
                        - use only mail tools for gmail operations(read_contacts_list,save_contact,trash_gmail_message,send_mails,list_unread_messages,read_message_details,trash_automation)
                        - Mail output instructions:
                          1. use the following structure From,Subject, Body(decode if encoded,summary), messageId.
                        - Mail sending instructions:
                          1. if mail address not provided check contacts list,if not found stop and ask user.
                          2. clear subject, body(html format) start with greeting, write professionally and end with thanks.
                        - Delete Instructions (**use this instructions only when user asks to "delete or trash mail similar"**)
                          1. mails fall under categories like "job rejection mails".
                          2. Delete Execution process:
                             1. analyse the intent of the mail and categorise. 2. confirm with user and delete only if one of above category.
                        - Trash automation(when user asked for trash automation)
                        - (at end of chat) contact saving instructions:
                          1. check if mail address contact present in contacts.
                          2. if not present save it.
                       Following is the chat: `;

const summariserPrompt = `You are a professional chat history summarizer. Analyze the provided chat history,
                            which consists of user queries and the corresponding tool/function responses mediated by an LLM.
                            The function data may vary in format (e.g., text, JSON, tables).
                            For all interaction turns, analyze the data carefully and output a clear, concise, step-by-step summary
                            detailing:User Intent: stating the user's query.
                            Tool Call: tool called by LLM.
                            Tool Response : The result of specific operations performed or data retrieved by the function.
                            Ensure the output is highly structured so that another LLM can easily interpret the sequential context.
                            Here is the chat history: `;

const categorizerPrompt = `you are an expert decision maker, you will get content of a mail, analyse the content and execute the tool save_category
                            providing the category as an argument. tool call is expected for any input. Below is the list of categories.
                            1. "Promotional"(for any promotional/advertisement content).
                            2. "Rejection"(for any job application rejection mail).
                            3. "Other"(if not one of "Promotional" or "Rejection").
                            Here is the mail content: `;

async function generateResponse(query, systemPrompt, functionTools) {
  const ai = new GoogleGenAI({});
  const prompt = `${systemPrompt} ${query}`;
  try {
    const response = await ai.models.generateContent({
      model: "gemma-4-31b-it", //"gemini-3.5-flash","gemini-2.5-flash"
      contents: prompt,
      config: {
        tools: functionTools,
      },
    });
    return response;
  } catch (error) {
    return "Error communicating with Gemini API:";
  }
}

export { generateResponse, summariserPrompt, gmailPrompt, categorizerPrompt };
