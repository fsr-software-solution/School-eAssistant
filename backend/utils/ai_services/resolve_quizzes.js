import { ChatOllama } from '@langchain/ollama'
import { selectRandomDocuments, similaritySearch } from './embeddings.js'
import References from '../../models/References.js'
import Quizzes from '../../models/Quizzes.js'
import * as z from 'zod'


const choiceKeySchema = z.enum(["a", "b", "c", "d", "e"])
const questionSchema = z.object({
  question: z.string().describe("The multiple choice question text"),
  choices: z.object({
    a: z.string().describe("Choice A"),
    b: z.string().describe("Choice B"),
    c: z.string().describe("Choice C"),
    d: z.string().describe("Choice D"),
    e: z.string().optional().describe("Optional Choice E")
  }),
  answer: choiceKeySchema.describe("The correct answer key. Must be one of: a, b, c, d, or e" ),
  explanation: z.string().describe("Short explanation why the answer is correct")
})
// const structuredSchema = z.object({
//   quizzes: z.array(questionSchema).describe("List of multiple choice questions")
// })



const resolveQuizzes = async ({chatSessionId, baseIdea, numberOfQuestions}) => {
    let llm = new ChatOllama({model: 'smollm2:135m'})
    let structuredLLM = llm.withStructuredOutput(questionSchema)

    let similaritySearchResults = []
    if (baseIdea) {
        similaritySearchResults = await similaritySearch(baseIdea, numberOfQuestions)
    } else {
        similaritySearchResults = await selectRandomDocuments(numberOfQuestions)
    }

    let generatedQuizzes = similaritySearchResults?.map( async (doc) => {
        let response = await structuredLLM.invoke(`
                Generate multiple choice question based on the following context:
                CONTEXT: ${doc?.text}
                QUESTIONS:
            `.trim())

        let quiz = await Quizzes.create({
            chatSessionId,
            question: response.question,
            choices: response.choices,
            answer: response.answer,
            explanation: response.explanation
        })

        await References.create({
            quizId: quiz?._id,
            bookId: doc?.bookId?.toString() || doc?.metadata?.bookId?.toString(),
            quotedText: doc?.text || doc?.pageContent,
            pageNumber: doc?.loc?.pageNumber || doc?.metadata?.loc?.pageNumber,
            lineFrom: doc?.loc?.lines?.from || doc?.metadata?.loc?.lines?.from,
            lineTo: doc?.loc?.lines?.to || doc?.metadata?.loc?.lines?.to
        })
        
        return quiz
    })   

    return await Promise.all(generatedQuizzes)
}

export default resolveQuizzes