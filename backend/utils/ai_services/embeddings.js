import {PDFLoader} from '@langchain/community/document_loaders/fs/pdf'
import {RecursiveCharacterTextSplitter} from '@langchain/textsplitters'
import { MistralAIEmbeddings } from '@langchain/mistralai'
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb"
import { MongoClient } from "mongodb"
import dotenv from 'dotenv'

dotenv.config()
let embeddings = new MistralAIEmbeddings({model: 'mistral-embed'})

const client = new MongoClient(process.env.MONGODB_ATLAS_URI || "")
const collection = client
  .db(process.env.MONGODB_ATLAS_DB_NAME)
  .collection(process.env.MONGODB_ATLAS_COLLECTION_NAME)

const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
  collection,
  indexName: "vector_index",
  textKey: "text",
  embeddingKey: "embedding",
})

const embedDocument = async (pdfBytes, bookId) => {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    let loader = new PDFLoader(blob)
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

const similaritySearch = async (query, limit=5) => await vectorStore.similaritySearch(query, limit)

const selectRandomDocuments = async (limit = 5) =>
  await collection
    .aggregate([
      { $sample: { size: limit } },
      { $project: { embedding: 0 } }
    ])
    .toArray()

const deleteEmbeddedBook = async (bookId) => await collection.deleteMany({"bookId": bookId})

    
export default embedDocument
export {embedDocument, similaritySearch, selectRandomDocuments, deleteEmbeddedBook}