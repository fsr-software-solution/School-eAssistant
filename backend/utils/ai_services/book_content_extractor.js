import { TOCSchema } from './states.js'
import { ChatOllama } from '@langchain/ollama'
import {ChatGroq} from '@langchain/groq'
import {readFile, writeFile} from 'fs/promises'
import splitAndExtract from '../split_and_extract_pdf.js'
import Books from '../../models/Books.js'
import Units from '../../models/Units.js'
import Sections from '../../models/Sections.js'


const bookContentExtractor = async (file, {gradeLevel, subject, yearOfPublish, filePath, tocStartingPage, tocEndingPage}) => {
    let llm = new ChatOllama({model: 'smollm2:135m'})
    // let llm = new ChatGroq({
    //     model: 'llama-3.3-70b-versatile',
    //     apiKey: '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'
    // })
    llm = llm.withStructuredOutput(TOCSchema)

    let splittedBook = await splitAndExtract(file)
    let rawToc = splittedBook.slice(tocStartingPage - 1, tocEndingPage).map(page => page.content).join('\n\n')

    // let toc = await llm.invoke(`
    //     Extract structured table of contents from the content.
    //     Focus on identifying unit numbers, section numbers, titles, and page numbers.
    //     CONTENT: ${rawToc}
    // `.trim())

    let data = await readFile('/home/yope/.projects/code/School-eAssistant/backend/utils/ai_services/mock_toc.json', 'utf-8')
    let toc = JSON.parse(data)    

    let tocList = []
    toc.units?.map(unit => {
        tocList.push({
            type: 'unit',
            unitNumber: unit.unitNumber,
            title: unit.title,
            startingPage: unit.startingPage
        })

        unit.sections?.map(section => {
            tocList.push({
                type: 'section',
                headingLevel: 1,
                sectionNumber: section.sectionNumber,
                title: section.title,
                startingPage: section.startingPage
            })

            section.subsections?.map(section => {
                tocList.push({
                    type: 'subsection',
                    headingLevel: 2,
                    sectionNumber: section.sectionNumber,
                    title: section.title,
                    startingPage: section.startingPage
                })

                section.subsections?.map(section => {
                    tocList.push({
                        type: 'subsection',
                        headingLevel: 3,
                        sectionNumber: section.sectionNumber,
                        title: section.title,
                        startingPage: section.startingPage
                    })

                    section.subsections?.map(section => {
                        tocList.push({
                            type: 'subsection',
                            headingLevel: 4,
                            sectionNumber: section.sectionNumber,
                            title: section.title,
                            startingPage: section.startingPage
                        })

                        section.subsections?.map(section => {
                            tocList.push({
                                type: 'subsection',
                                headingLevel: 5,
                                sectionNumber: section.sectionNumber,
                                title: section.title,
                                startingPage: section.startingPage
                            })

                            section.subsections?.map(section => {
                                tocList.push({
                                    type: 'subsection',
                                    headingLevel: 6,
                                    sectionNumber: section.sectionNumber,
                                    title: section.title,
                                    startingPage: section.startingPage
                                })
                            })
                        })
                    })
                })
            })
        })
    })
   

    let unit = null
    let section = null
    let book = await Books.create({
        gradeLevel,
        subject,
        totalPages: splittedBook.length,
        toc,
        filePath,
        yearOfPublish
    })


    for (let i=0; i<tocList.length; i++) {
        let prev = tocList[i-1]
        let current = tocList[i]
        let next = tocList[i+1]
        let lastPage = splittedBook.length - tocEndingPage
        
        if (current.type == 'unit') {
            unit = await Units.create({
                bookId: book?._id,
                unitNumber: current.unitNumber,
                title: current.title,
                startingPage: current.startingPage,
                endingPage: next?.startingPage || lastPage
            })
        } else if (current.type == 'section') {
            section = await Sections.create({
                unitId: unit?._id,
                sectionNumber: current.sectionNumber,
                parentSectionId: null,
                headingLevel: current.headingLevel,
                title: current.title,
                startingPage: current.startingPage,
                endingPage: next?.startingPage || lastPage,
                content: extractSectionContent(splittedBook, current?.title, next?.title, current.startingPage, next?.startingPage || lastPage, tocEndingPage - 1)
            })
        } else if (current.type == 'subsection') {
            section = await Sections.create({
                unitId: unit?._id,
                sectionNumber: current.sectionNumber,
                parentSectionId: section?._id,
                headingLevel: current.headingLevel,
                title: current.title,
                startingPage: current.startingPage,
                endingPage: next?.startingPage || lastPage,
                content: extractSectionContent(splittedBook, current?.title, next?.title, current.startingPage, next?.startingPage || lastPage, tocEndingPage - 1)
            })
        }
    }
}


const extractSectionContent = (splittedBook, startMark, endMark, startingPage, endingPage, pageDiff) => {
    let text = ''
    if (startingPage == endingPage)
        text = splittedBook[startingPage + pageDiff].content
    else
        text = splittedBook.slice(startingPage + pageDiff, endingPage + pageDiff + 1).map(page => page.content).join('\n\n')
    
    let matchedTexts = text.match(new RegExp(`${startMark}.*(?=${endMark})?`, 'isg')) ?? [text]

    const longestString = matchedTexts
        .filter(item => item !== null)
        .reduce((longest, current) => current.length > longest.length ? current : longest, '');
    
    return longestString
}

export default bookContentExtractor


////// For testing
// await bookContentExtractor('./G9-Biology-STB-2023-web.pdf', {
//     gradeLevel: 'G-9',
//     subject: 'Biology',
//     yearOfPublish: '2023',
//     filePath: '.',
//     tocStartingPage: 6,
//     tocEndingPage: 7
// })