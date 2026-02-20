import {PDFLoader} from '@langchain/community/document_loaders/fs/pdf'
import {RecursiveCharacterTextSplitter} from '@langchain/textsplitters'
import {OllamaEmbeddings} from '@langchain/ollama'
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb"
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config({path: '../../.env'})

let embeddings = new OllamaEmbeddings({model: 'all-minilm:22m'})

const client = new MongoClient(process.env.MONGODB_ATLAS_URI || "");
const collection = client
  .db(process.env.MONGODB_ATLAS_DB_NAME)
  .collection(process.env.MONGODB_ATLAS_COLLECTION_NAME);

const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
  collection,
  indexName: "vector_index",
  textKey: "text",
  embeddingKey: "embedding",
});

let embedDocument = async (pdfBytes, bookId) => {
    let loader = new PDFLoader(pdfBytes)
    let docs = await loader.load()

    let splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 50
    })

    let splittedDocs = await splitter.splitDocuments(docs)
    splittedDocs = splittedDocs.map(doc => {
        return {...doc, metadata: {...doc.metadata, bookId}}
    })
    await vectorStore.addDocuments(splittedDocs)
    return splittedDocs.length
}

const similaritySearch = async (query, limit) => await vectorStore.similaritySearch(query, limit);


export {embedDocument, similaritySearch}

// Test
// test 1 => pass
// await embedDocument('./G9-Biology-STB-2023-web.pdf', 'bio-1')

// test 2
console.log(
    await similaritySearch('What is light microscope?', 4)
);
