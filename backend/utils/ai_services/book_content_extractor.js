import {StateGraph, START, END} from '@langchain/langgraph'
import { BookState, TOCSchema, UnitState, SectionState, SubsectionState } from './states.js'
import { ChatOllama } from '@langchain/ollama'
import {ChatGroq} from '@langchain/groq'
import {readFile, writeFile} from 'fs/promises'
import splitAndExtract from '../split_and_extract_pdf.js'
import Books from '../../models/Books.js'
import Units from '../../models/Units.js'
import Sections from '../../models/Sections.js'


const bookContentExtractor = async (file, {gradeLevel, subject, version, filePath, tocStartingPage, tocEndingPage}) => {
    try {
        console.log('Starting book content extraction...');
        
        // Initialize LLM
        let llm = new ChatOllama({model: 'smollm2:135m'})
        llm = llm.withStructuredOutput(TOCSchema)

        // Extract PDF content
        console.log('Extracting PDF content...');
        let splittedBook = await splitAndExtract(file)
        let rawToc = splittedBook.slice(tocStartingPage - 1, tocEndingPage).map(page => page.content).join('\n\n')
        let allContent = splittedBook.slice(tocEndingPage).map(page => page.content).join('\n\n')
        
        // Extract TOC using AI or use mock data for development
        let book;
        try {
            // console.log('Extracting structured TOC...');
            // book = await llm.invoke(`
            //     Extract structured table of contents from the content.
            //     Focus on identifying unit numbers, section numbers, titles, and page numbers.
            //     CONTENT: ${rawToc}
            // `.trim())
            throw new Error('Extracting structured TOC...');            
        } catch (error) {
            console.log('AI extraction failed, using mock data:', error.message);
            // For development purpose
            let data = await readFile('/home/yope/.projects/code/School-eAssistant/backend/utils/ai_services/mock_toc.json', 'utf-8')
            book = JSON.parse(data)
        }

        // Create book record
        console.log('Creating book record...');
        let newBook = await Books.create({
            gradeLevel,
            subject,
            totalPages: splittedBook.length,
            toc: book,
            filePath,
            version
        })

        // Process units and sections
        console.log('Processing units and sections...');
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

            // Process sections recursively
            if (unit.sections && unit.sections.length > 0) {
                await processSections(unit.sections, newUnit._id, null, allContent, splittedBook, tocEndingPage)
            }
        }

        console.log('Book content extraction completed successfully');
        return { success: true, bookId: newBook._id }

    } catch (error) {
        console.error('Error in bookContentExtractor:', error)
        throw error
    }
}

/**
 * Recursively process sections and subsections
 */
const processSections = async (sections, unitId, parentSectionId, allContent, splittedBook, tocEndingPage) => {
    for (let i = 0; i < sections.length; i++) {
        const section = sections[i]
        const nextSection = sections[i + 1]
        
        // Calculate heading level based on section number depth
        const headingLevel = (section.sectionNumber.match(/\./g) || []).length + 1
        
        // Calculate page boundaries
        const startingPage = section.startingPage || 1
        const endingPage = getNextSectionStartingPage(section, nextSection, sections, i)
        
        // Extract content for this section
        const content = extractSectionContent(
            section, 
            nextSection, 
            sections, 
            i, 
            allContent, 
            splittedBook, 
            tocEndingPage
        )

        // Create section record
        let newSection = await Sections.create({
            unitId,
            sectionNumber: section.sectionNumber,
            parentSectionId,
            headingLevel,
            title: section.title,
            startingPage,
            endingPage,
            content
        })

        // Process subsections recursively
        if (section.subsections && section.subsections.length > 0) {
            await processSections(section.subsections, unitId, newSection._id, allContent, splittedBook, tocEndingPage)
        }
    }
}

/**
 * Validate and normalize section data
 */
const validateSectionData = (section) => {
    if (!section.sectionNumber || !section.title) {
        throw new Error(`Invalid section data: missing sectionNumber or title`)
    }
    
    // Ensure section number is properly formatted
    section.sectionNumber = section.sectionNumber.toString().trim()
    section.title = section.title.toString().trim()
    
    if (section.startingPage) {
        section.startingPage = parseInt(section.startingPage, 10)
        if (isNaN(section.startingPage) || section.startingPage < 1) {
            section.startingPage = 1
        }
    }
    
    return section
}

/**
 * Get the starting page of the next section at the same level
 */
const getNextSectionStartingPage = (currentSection, nextSection, sections, currentIndex) => {
    // If there's a next section at the same level
    if (nextSection) {
        return nextSection.startingPage
    }
    
    // If this is the last section, find the next section at any level
    for (let i = currentIndex + 1; i < sections.length; i++) {
        if (sections[i].startingPage) {
            return sections[i].startingPage
        }
    }
    
    // Default fallback
    return 1000
}

/**
 * Extract content for a specific section using regex patterns
 */
const extractSectionContent = (section, nextSection, sections, currentIndex, allContent, splittedBook, tocEndingPage) => {
    try {
        // Build regex pattern to find section content
        const sectionPattern = escapeRegExp(section.sectionNumber)
        const sectionTitlePattern = escapeRegExp(section.title)
        
        let endPattern = ''
        
        // Determine the end pattern based on next section or subsection
        if (nextSection) {
            endPattern = `(?=${escapeRegExp(nextSection.sectionNumber)}[\\s\\S]{0,10}${escapeRegExp(nextSection.title)})`
        } else {
            // Look for any next section at the same or higher level
            for (let i = currentIndex + 1; i < sections.length; i++) {
                if (sections[i].sectionNumber && sections[i].title) {
                    endPattern = `(?=${escapeRegExp(sections[i].sectionNumber)}[\\s\\S]{0,10}${escapeRegExp(sections[i].title)})`
                    break
                }
            }
            
            // If no next section found, use end of content
            if (!endPattern) {
                endPattern = '$'
            }
        }
        
        const pattern = new RegExp(
            `${sectionPattern}[\\s\\S]{0,10}${sectionTitlePattern}[\\s\\S]+?${endPattern}`,
            'ig'
        )
        
        const match = allContent.match(pattern)
        if (match && match[0]) {
            const longest = match
                .filter(str => typeof str === "string")
                .reduce((max, str) => str.length > max.length ? str : max, "")
            return longest.trim()
        }
        
        // Fallback: extract by page range if regex fails
        return extractByPageRange(section, nextSection, sections, currentIndex, splittedBook, tocEndingPage)
        
    } catch (error) {
        console.error(`Error extracting content for section ${section.sectionNumber}:`, error)
        return `Content extraction failed for section ${section.sectionNumber}: ${error.message}`
    }
}

/**
 * Extract content based on page ranges as fallback
 */
const extractByPageRange = (section, nextSection, sections, currentIndex, splittedBook, tocEndingPage) => {
    try {
        const sectionStartPage = section.startingPage || 1
        const sectionEndPage = getNextSectionStartingPage(section, nextSection, sections, currentIndex)
        
        // Convert to 0-based index and adjust for TOC offset
        const startIndex = Math.max(0, sectionStartPage - 1)
        const endIndex = Math.min(splittedBook.length, sectionEndPage - 1)
        
        const pages = splittedBook.slice(startIndex, endIndex)
        return pages.map(page => page.content).join('\n\n').trim()
        
    } catch (error) {
        console.error('Error extracting by page range:', error)
        return `Page range extraction failed: ${error.message}`
    }
}

/**
 * Escape special regex characters in a string
 */
const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}


export default bookContentExtractor