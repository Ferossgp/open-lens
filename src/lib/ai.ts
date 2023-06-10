import { IMessage, IResponseData } from "@/pages/api/types";

export async function getOpenAICompletion({ conversation }: { conversation: IMessage[] }): Promise<string> {
  const url = "https://api.openai.com/v1/chat/completions";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_KEY}`
    },
    body: JSON.stringify({
      "model": "gpt-3.5-turbo",
      messages: conversation,
      temperature: 0.2,
      n: 1,
    }),
  });

  const data: IResponseData = await response.json();
  const assistant = data.choices?.filter((choice) => choice.message.role === 'assistant').map((choice) => choice.message.content).join('\n');
  return assistant
}
