import express from "express";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { BufferMemory } from "langchain/memory";
import { ConversationChain, VectorDBQAChain } from "langchain/chains";
import dotenv from 'dotenv';
import { ChatPromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder, SystemMessagePromptTemplate } from "langchain/prompts";
import path from "path";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { PineconeClient } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

dotenv.config({ path: path.resolve(__dirname, "../../config.env") });
const submitPrompt = express.Router();

const chat = new ChatOpenAI( {openAIApiKey: process.env.OPENAI_API_KEY, temperature: 0.7, modelName: 'gpt-3.5-turbo' });
const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(
      "The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know."
    ),
    new MessagesPlaceholder("history"),
    HumanMessagePromptTemplate.fromTemplate("{query}"),
  ]);
const memory = new BufferMemory({ returnMessages: true, memoryKey: "history" });

const client = new PineconeClient();

export async function getChatbotResponse(prompt: string): Promise<string> {
    if (!prompt) {
        throw new Error("No prompt provided");
    }
    await client.init({
        apiKey: process.env.PINECONE_API_KEY!,
        environment: process.env.PINECONE_ENVIRONMENT!,
      });
    const pineconeIndex = client.Index(process.env.PINECONE_INDEX!);
    const vectorStore = await PineconeStore.fromExistingIndex( new OpenAIEmbeddings(), { pineconeIndex, });

    const memoryChain = new ConversationChain({llm: chat, prompt: chatPrompt, memory: memory, });
    const chain = VectorDBQAChain.fromLLM(chat, vectorStore, memoryChain);

    const answer = await chain.call({query: prompt});
    return answer.text;
}

submitPrompt.post("/", async (req: express.Request, res: express.Response) => {
    try {
        const prompt: string = req.body.prompt;
        const answer = await getChatbotResponse(prompt);
        res.status(200).send(answer);
    } catch (err: any) {
        console.error(err.message, err.stack);
        if (err.message === "No prompt provided") {
            res.status(400).send("No prompt provided");
        }
        else {
            res.status(500).send(err.message);
        }
    }
});


export default submitPrompt;