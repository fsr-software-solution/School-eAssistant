import { ChatOllama } from '@langchain/ollama'
import Interactions from '../../models/Interactions.js'
import addReferences from './add_references.js'
import { similaritySearch } from './embeddings.js'
import * as z from 'zod'

const resolveInteraction = async ({sectionId, chatSessionId, studentId, studentQuestion, histories, section}) => {
    let llm = new ChatOllama({model: 'llama3.2:3b'})
    let standaloneQuestion = await llm.invoke(`
            Extract standalone question from the following question:
            QUESTION: ${studentQuestion}
            STANDALONE QUESTION:
        `.trim())

    let similaritySearchResults = await similaritySearch(standaloneQuestion.content)
    let context = similaritySearchResults?.map(doc => doc.pageContent).join('\n\n')
    let history = histories?.map(his => `STUDENT QUESTION: ${his.studentQuestion}\nAI ANSWER: ${his.aiAnswer}`).join('\n\n')

    let structuredLLM = llm.withStructuredOutput(z.object({
        answer: z.string(),
        confidenceScore: z.number()
    }))
    let response = await structuredLLM.invoke(`
            Answer the following question based on the following context, history (is any).
            and set confidence score between 0 to 1:
            ${section? 'TOPIC: ' + section.aiClarification : ''}
            CONTEXT: ${context}
            HISTORY: ${history}
            QUESTION: ${studentQuestion}
            ANSWER:
        `.trim())

    let interaction = await Interactions.create({
        sectionId,
        chatSessionId,
        studentId,
        studentQuestion,
        aiAnswer: response.answer,
        confidenceScore: response.confidenceScore
    })
    await addReferences({interaction, similaritySearchResults})
    return interaction
}

export default resolveInteraction