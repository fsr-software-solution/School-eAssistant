import {StateGraph, START, END} from '@langchain/langgraph'
import { BookState, TOCSchema, UnitState } from './states.js'
import { ChatOllama } from '@langchain/ollama'
import {ChatGroq} from '@langchain/groq'
import {readFile, writeFile} from 'fs/promises'
import splitAndExtract from '../split_and_extract_pdf.js'
import Books from '../../models/Books.js'
import Units from '../../models/Units.js'
import Sections from '../../models/Sections.js'


const bookContentExtractor = async (file, {gradeLevel, subject, version, filePath, tocStartingPage, tocEndingPage}) => {    
    let llm = new ChatOllama({model: 'smollm2:135m'})
    // let llm = new ChatGroq({
    //     model: 'llama-3.3-70b-versatile',
    //     apiKey: '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'
    // })
    llm = llm.withStructuredOutput(TOCSchema)

    
    let splittedBook = await splitAndExtract(file)
    let rawToc = splittedBook.slice(tocStartingPage - 1, tocEndingPage).map(page => page.content).join('\n\n')
    let allContent = splittedBook.slice(tocEndingPage).map(page => page.content).join('\n\n')
    
    
    // let book = await llm.invoke(`
    //     extract structured table of contents from the content
    //     CONTENT: ${rawToc}
    // `.trim())

    // For development purpose
    let data = await readFile('/home/yope/.projects/code/School-eAssistant/backend/utils/ai_services copy/mock_toc.json', 'utf-8')
    let book = JSON.parse(data)    

    let newBook = await Books.create({
        gradeLevel,
        subject,
        totalPages: splittedBook.length,
        toc: book,
        filePath,
        version
    })
    

    for (let i = 0; i < book.units?.length || 0; i++) {
        const unit = book.units[i]
        const nextUnit = book.units[i+1]

        let newUnit = await Units.create({
            bookId: newBook._id,
            unitNumber: unit.unitNumber,
            title: unit.title,
            startingPage: unit?.startingPage,
            endingPage: nextUnit?.startingPage || splittedBook.length - tocEndingPage
        })
        

        for (let j = 0; j < unit.sections?.length || 0; j++) {
            const section_h1 = unit.sections[j]
            const nextSection_h1 = unit.sections[j+1]          

            let newSection1 = await Sections.create({
                unitId: newUnit._id,
                sectionNumber: section_h1.sectionNumber,
                parentSectionId: null,
                headingLevel: 1,
                title: section_h1.title,
                startingPage: section_h1?.startingPage,
                endingPage: (section_h1.subsections??[])[0]?.startingPage || nextSection_h1?.startingPage || 1000,
                content: allContent.match(new RegExp(`
                        ${section_h1.sectionNumber}[\s\S]{0,5}${section_h1.title}[\s\S]+(?=${(section_h1.subsections??[])[0].sectionNumber || nextSection_h1.sectionNumber || nextUnit.unitNumber}[\s\S]{0,5}${(section_h1.subsections??[])[0].title || nextSection_h1.title || nextUnit.title})
                    `.trim(), 'i'))[0]
            })


            for (let k = 0; k < section_h1.subsections?.length || 0; k++) {
                const section_h2 = section_h1.subsections[k];
                const nextSection_h2 = section_h1.subsections[k+1]

                let newSection2 = await Sections.create({
                    unitId: newUnit._id,
                    sectionNumber: section_h2.sectionNumber,
                    parentSectionId: newSection1._id,
                    headingLevel: 2,
                    title: section_h2.title,
                    startingPage: section_h2?.startingPage,
                    endingPage: (section_h2.subsections??[])[0]?.startingPage || nextSection_h2?.startingPage || 1000,
                    content: '.....2'
                })                


                for (let l = 0; l < section_h2.subsections?.length || 0; l++) {
                    const section_h3 = section_h2.subsections[l];
                    const nextSection_h3 = section_h2.subsections[l+1]

                    let newSection3 = await Sections.create({
                        unitId: newUnit._id,
                        sectionNumber: section_h3.sectionNumber,
                        parentSectionId: newSection2._id,
                        headingLevel: 3,
                        title: section_h3.title,
                        startingPage: section_h3?.startingPage,
                        endingPage: (section_h3.subsections??[])[0]?.startingPage || nextSection_h3?.startingPage || 1000,
                        content: '.....3'
                    })


                    for (let m = 0; m < section_h3.subsections?.length || 0; m++) {
                        const section_h4 = section_h3.subsections[m];
                        const nextSection_h4 = section_h3.subsections[m+1]

                        let newSection4 = await Sections.create({
                            unitId: newUnit._id,
                            sectionNumber: section_h4.sectionNumber,
                            parentSectionId: newSection3._id,
                            headingLevel: 4,
                            title: section_h4.title,
                            startingPage: section_h4?.startingPage,
                            endingPage: (section_h4.subsections??[])[0]?.startingPage || nextSection_h4?.startingPage || 1000,
                            content: '.....4'
                        })


                        for (let n = 0; n < section_h4.subsections?.length || 0; n++) {
                            const section_h5 = section_h4.subsections[n];
                            const nextSection_h5 = section_h4.subsections[n+1]

                            let newSection5 = await Sections.create({
                                unitId: newUnit._id,
                                sectionNumber: section_h5.sectionNumber,
                                parentSectionId: newSection4._id,
                                headingLevel: 5,
                                title: section_h5.title,
                                startingPage: section_h5?.startingPage,
                                endingPage: (section_h5.subsections??[])[0]?.startingPage || nextSection_h5?.startingPage || 1000,
                                content: '.....5'
                            })


                            for (let o = 0; k < section_h5.subsections?.length || 0; o++) {
                                const section_h6 = section_h5.subsections[o];
                                const nextSection_h6 = section_h5.subsections[o+1]

                                await Sections.create({
                                    unitId: newUnit._id,
                                    sectionNumber: section_h6.sectionNumber,
                                    parentSectionId: newSection5._id,
                                    headingLevel: 6,
                                    title: section_h6.title,
                                    startingPage: section_h6?.startingPage,
                                    endingPage: (section_h6.subsections??[])[0]?.startingPage || nextSection_h6?.startingPage || 1000,
                                    content: '.....6'
                                })
                            }
                        }
                    }
                }
            }
        }
    }
}





export default bookContentExtractor