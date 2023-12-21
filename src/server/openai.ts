import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * This accepts a prompt and returns the result.
 * This function does not generate the prompt.
 * @param prompt Prompt
 */
export const generateCompletion = async (prompt: string) => {
  return await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant designed to output JSON.",
      },
      { role: "user", content: prompt },
    ],
    model: "gpt-3.5-turbo-1106",

    response_format: { type: "json_object" },
  });
};
