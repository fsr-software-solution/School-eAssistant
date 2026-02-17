import {StateGraph, START, END} from '@langchain/langgraph'
import {SectionState} from './states.js'

const sectionInfoExtractorNode = async (state) => {
    // console.log(state.toc.subsections)

    if (state.toc.subsections) {

        for (let i = 0; i < state.toc.subsections.length; i++) {
            let subsection = {
                    sectionNumber: state.toc.subsections[i].sectionNumber,
                    headingLevel: state.toc.subsections[i].sectionNumber.split('.').length - 1,
                    title: state.toc.subsections[i].title,
                    startingPage: state.toc.subsections[i].startingPage,
                    endingPage: state.toc.subsections[i+1]?.startingPage || state.endingPage,
                    startingPageIndex: state.toc.subsections[i].startingPage + state.pageDiff - 1,
                    endingPageIndex: state.toc.subsections[i+1]?.startingPage + state.pageDiff - 1 || state.endingPage + state.pageDiff,
                    splittedBook: state.splittedBook,
                    pageDiff: state.pageDiff,
                    toc: state.toc.subsections[i]
                }
            state.subsections = await sectionInfoExtractorNode(subsection)
        }

    }
    else {
        let rawContent = state.splittedBook.slice(state.startingPageIndex, state.endingPageIndex + 1)
            .map(c => c.content).join('\n\n')

        // let current_section = state.toc.title
        // let next_section = state.toc.subsections?.title
        // let content = rawContent.match(new RegExp(`${current_section}[\s\S]*(?=${next_section})`, 'i')) ?? []
        // console.log(rawContent)
        state.content = rawContent
    }

    return state
}


const workflow = new StateGraph(SectionState)
const SECTION_INFO_EXTRACTOR = 'section_info_extractor_node'

workflow.addNode(SECTION_INFO_EXTRACTOR, sectionInfoExtractorNode)

workflow.addEdge(START, SECTION_INFO_EXTRACTOR)
workflow.addEdge(SECTION_INFO_EXTRACTOR, END)

const sectionApp = workflow.compile()
export default sectionApp