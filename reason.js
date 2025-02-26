import OpenAI from "openai";
const openai = new OpenAI();
// openAI api key is rewuired as an environment variable
const prompt = `
Write a bash script that takes a matrix represented as a string with 
format '[1,2],[3,4],[5,6]' and prints the transpose in the same format.
`;
 
const completion = await openai.chat.completions.create({
  model: "o3-mini",
  reasoning_effort: "medium",
  messages: [
    {
      role: "user", 
      content: prompt
    }
  ],
  store: true,
});

console.log(completion.choices[0].message.content);
