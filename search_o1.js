import { ChatOpenAI } from "@langchain/openai";
import fetch from "node-fetch";  // Node.js 18以降ではグローバルfetchも利用可
import chalk from 'chalk';
import dotenv from 'dotenv';
import { marked } from 'marked';
import TerminalRenderer from 'marked-terminal';

dotenv.config();
// markedにカスタムレンダラーを設定
marked.setOptions({
  renderer: new TerminalRenderer(),
});
/**
 * Google カスタム検索 API を呼び出して、指定クエリの検索結果を取得する関数
 * @param {string} query - 検索クエリ
 * @returns {Promise<Object>} - API のレスポンス(JSON)
 */
async function googleSearch(query) {
  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CX;
  if (!apiKey || !cx) {
    throw new Error("Missing GOOGLE_API_KEY or GOOGLE_CX environment variables");
  }
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

(async () => {
  // ユーザーの問い合わせ内容
  const query = "simplest way to add memory function to chatapp using CPT's API on node.js";

  try {
    // ① Google カスタム検索 API で検索
    const searchResults = await googleSearch(query);

    // ② 最初の結果からスニペットを取得（なければ代替文言）
    let searchSnippet = "";
    if (searchResults.items && searchResults.items.length > 0) {
      searchSnippet = searchResults.items[0].snippet;
    } else {
      searchSnippet = "No search results found.";
    }

    // ③ 検索結果を踏まえて、LLM に問い合わせるためのプロンプトを作成
    const prompt = `You are given the following query: "${query}".
Based on the search result snippet below, provide a detailed and accurate answer with reasoning and references where appropriate.

Search result snippet: "${searchSnippet}"

Answer:`;

    // ④ ChatOpenAI (o1-mini モデル) を利用する設定
    const llm = new ChatOpenAI({
      modelName: "o1-mini",
      temperature: 1,
      maxTokens: 10000,
      openAIApiKey: process.env.OPENAI_API_KEY || "",
    });

    // ⑤ LLM へ問い合わせ
    const response = await llm.invoke(prompt);
    // contentフィールドのMarkdownをHTMLに変換
    const formattedContent = marked(response.content);
    console.log(chalk.green.bold("=== AI Response ==="));
    console.log(formattedContent);
    console.log(chalk.green.bold("==================="));
  } catch (error) {
    console.error("Error:", error);
  }
})();

