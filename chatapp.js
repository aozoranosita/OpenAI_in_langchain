import { ChatOpenAI } from "@langchain/openai";
import { BufferMemory } from "langchain/memory";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import fetch from "node-fetch";
import readline from "readline";
import dotenv from "dotenv";
import chalk from "chalk";

// .envから環境変数を読み込む
dotenv.config();

// --- 検索機能の実装 --- //
async function performSearch(query) {
  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CX;
  if (!apiKey || !cx) {
    throw new Error("Missing GOOGLE_API_KEY or GOOGLE_CX in .env");
  }
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.items && data.items.length > 0) {
    // 最初の検索結果のスニペットを返す
    console.log(data.items[0].snippet);
    return data.items[0].snippet;
  } else {
    return "検索結果は見つかりませんでした。";
  }
}

// --- ツールの定義 --- //
// Tool クラスではなく、プレーンなオブジェクトとして定義する
const searchTool = {
  name: "GoogleSearch",
  description: "Web上の情報を検索して、質問に答えるためのツール。",
  func: async (query) => {
    return await performSearch(query);
  },
};

// --- LLM と永続化メモリのセットアップ --- //
const llm = new ChatOpenAI({
  modelName: "gpt-4o-mini", // 必要に応じて他のモデルを選択
  //modelName: "o1-mini",
  temperature: 0.5,
  maxTokens: 10000,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// BufferMemory を利用して対話履歴を保持（Persistence の考え方）
const memory = new BufferMemory({
  returnMessages: true,
  memoryKey: "chat_history",
});

// --- エージェントの初期化 --- //
const agentExecutor = await initializeAgentExecutorWithOptions(
  [searchTool], // ツール配列（プレーンオブジェクト）
  llm,
  {
    agentType: "zero-shot-react-description",
    memory: memory,
  }
);

// --- ターミナル入力の受付 --- //
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function promptUser() {
  rl.question(chalk.blue("You: "), async (input) => {
    try {
      const response = await agentExecutor.call({ input });
      console.log(chalk.green("AI:"), response.output);
    } catch (error) {
      console.error(chalk.red("Error:"), error);
    }
    promptUser();
  });
}

promptUser();

