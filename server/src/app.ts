import express from 'express';
import cors from "cors";
import dotenv from 'dotenv';
import path from 'path';
import routes from './routes/index';
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { PineconeClient } from '@pinecone-database/pinecone';

dotenv.config({ path: path.resolve(__dirname, "../config.env") });

const app = express();

const loader = new DirectoryLoader(
    path.resolve(__dirname, "../emails"),
    {
      ".json": (path) => new JSONLoader(path),
      ".pdf": (path) => new PDFLoader(path, { splitPages: false }),
    }
)

async function loadEmails() {
    const emails = await loader.load();
    const client = new PineconeClient();
    await client.init({ 
      apiKey: process.env.PINECONE_API_KEY!, 
      environment: process.env.PINECONE_ENVIRONMENT!,
     });
    const pineconeIndex = client.Index(process.env.PINECONE_INDEX!);
    const prevIndexStats = await pineconeIndex.describeIndexStats({describeIndexStatsRequest: {}});
    if (prevIndexStats.totalVectorCount !== emails.length) {
      await PineconeStore.fromDocuments(emails, new OpenAIEmbeddings(), { pineconeIndex, });
    }
    else {
      console.log("Pinecone index already up to date.");
    }
}

const corsOptions = {
    origin: "http://localhost:3000",
    allowedHeaders:
      "Content-Type, Authorization, Origin, X-Requested-With, Accept",
    allowedMethods: "GET, POST, PUT, DELETE, OPTIONS",
  };

app.use(cors(corsOptions));
app.use(express.json());
app.use("/", routes);
loadEmails();

app.listen(8080, () => {
    console.log("Server running on port 8080");
});

