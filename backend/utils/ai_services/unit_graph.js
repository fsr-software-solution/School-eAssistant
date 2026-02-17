import {StateGraph, START, END} from '@langchain/langgraph'
import {UnitState} from './states.js'
import sectionApp from './section_graph.js'


const sectionProcessNode = async (state) => {
    // console.log(state.toc.sections[0], '\n\n\n')

    const sectionInitialStates = new Array()
    for (let i = 0; i < state.toc.sections.length; i++) {
        sectionInitialStates.push(
            {
                sectionNumber: state.toc.sections[i].sectionNumber,
                headingLevel: state.toc.sections[i].sectionNumber.split('.').length - 1,
                title: state.toc.sections[i].title,
                startingPage: state.toc.sections[i].startingPage,
                endingPage: state.toc.sections[i+1]?.startingPage || state.endingPage,
                startingPageIndex: state.toc.sections[i].startingPage + state.pageDiff - 1,
                endingPageIndex: state.toc.sections[i+1]?.startingPage + state.pageDiff - 1 || state.endingPage + state.pageDiff,
                splittedBook: state.splittedBook,
                pageDiff: state.pageDiff,
                toc: state.toc.sections[i]
            }
        )
    }

    // console.log({sectionInitialStates})
    const sectionFinalState = await Promise.all(
        sectionInitialStates.map(s => sectionApp.invoke(s))
    )
    state.sections = sectionFinalState
}

const workflow = new StateGraph(UnitState)
const SECTION_PROCESS = 'section_process_node'

workflow.addNode(SECTION_PROCESS, sectionProcessNode)

workflow.addEdge(START, SECTION_PROCESS)
workflow.addEdge(SECTION_PROCESS, END)

const unitApp = workflow.compile()
export default unitApp