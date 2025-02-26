import { ChatOpenAI } from "@langchain/openai";

// o3-miniを利用するための設定を行い、APIキーとモデル名を指定
const llm = new ChatOpenAI({
  modelName: "o1-mini",
  temperature: 1,
  maxTokens: 10000,
  openAIApiKey: process.env.OPENAI_API_KEY || "",
});

// o3-miniへ問い合わせを行い、結果を出力する処理
(async () => {
  try {
    const response = await llm.invoke("simplest way to add memory function to chatapp using CPT's API on node.js");
    console.log(response);
  } catch (error) {
    console.error("Error:", error);
  }
})();

