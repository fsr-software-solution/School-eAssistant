import {StateGraph, START, END} from '@langchain/langgraph'
import { BookState, TOCSchema, UnitState } from './states.js'
import { ChatOllama } from '@langchain/ollama'
import {ChatGroq} from '@langchain/groq'
import {readFile, writeFile} from 'fs/promises'
import unitApp from './unit_graph.js'
import splitAndExtract from '../split_and_extract_pdf.js'


const tocExtractorNode = async (state) => {    
    // let llm = new ChatOllama({model: 'smollm2:135m'})
    // let llm = new ChatGroq({
    //     model: 'llama-3.3-70b-versatile',
    //     apiKey: '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'
    // })
    // llm = llm.withStructuredOutput(TOCSchema)

    // let extractedToc = await llm.invoke(`
    //     extract structured table of contents from the content
    //     CONTENT: ${state.rawToc}
    // `.trim())



    let data = await readFile('./mock_toc.json', 'utf-8')
    let extractedToc = JSON.parse(data)

    state.rawToc = state.splittedBook.slice(state.tocStartingPage - 1, state.tocEndingPage).map(page => page.content).join('\n\n')
    state.toc = extractedToc
    state.pageDiff = state.tocEndingPage
    return state
}

const unitProcessNode = async (state) => {
    // state.splittedBook = 'pass' // Comment
    // state.rawToc = 'pass'      // Comment

    const unitInitialStates = new Array()
    for (let i = 0; i < state.toc.units.length; i++) {
        unitInitialStates.push(
            {
                unitNumber: state.toc.units[i].unitNumber,
                title: state.toc.units[i].title,
                startingPage: state.toc.units[i].startingPage,
                endingPage: state.toc.units[i+1]?.startingPage || state.totalPage,
                startingPageIndex: state.toc.units[i].startingPage + state.pageDiff - 1,
                endingPageIndex: state.toc.units[i+1]?.startingPage + state.pageDiff - 1 || state.totalPage - state.pageDiff,
                splittedBook: state.splittedBook,
                pageDiff: state.pageDiff,
                toc: state.toc.units[i]
            }
        )        
    }

    const unitFinalStates = await Promise.all(
        unitInitialStates.map(u => unitApp.invoke(u))
    )
    state.units = unitFinalStates
    return state
}

const finalBookNode = async (state) => {
    // console.log(state)
    await writeFile('./final_book.json', JSON.stringify(state))
}


const workflow = new StateGraph(BookState)
const TOC_EXTRACTOR = 'toc_extractor_node'
const UNIT_PROCESS = 'unit_process_node'
const FINAL_BOOK = 'final_book_node'

workflow.addNode(TOC_EXTRACTOR, tocExtractorNode)
workflow.addNode(UNIT_PROCESS, unitProcessNode)
workflow.addNode(FINAL_BOOK, finalBookNode)

workflow.addEdge(START, TOC_EXTRACTOR)
workflow.addEdge(TOC_EXTRACTOR, UNIT_PROCESS)
workflow.addEdge(UNIT_PROCESS, FINAL_BOOK)
workflow.addEdge(FINAL_BOOK, END)

const bookApp = workflow.compile()

const splittedBook = await splitAndExtract('./G9-Biology-STB-2023-web.pdf')

const finalResult = await bookApp.invoke({
    gradeLevel: 'G-9',
    subject: 'Biology',
    totalPage: splittedBook.length,
    version: 'v-1.0.0',
    filePath: './G9-Biology-STB-2023-web.pdf',
    splittedBook: splittedBook,
    tocStartingPage: 6,
    tocEndingPage: 7
})

console.log(JSON.stringify(finalResult));
export default bookApp