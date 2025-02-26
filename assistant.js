import dotenv from "dotenv";
import OpenAI from "openai";

// .envから環境変数を読み込む
dotenv.config();

const openai = new OpenAI();

async function main() {
  const myAssistant = await openai.beta.assistants.create({
    instructions:
      "You are a personal math tutor. When asked a question, write and run Python code to answer the question.",
    name: "Math Tutor",
    tools: [{ type: "code_interpreter" }],
    model: "gpt-4o-mini",
  });

  console.log(myAssistant);
}

main();
