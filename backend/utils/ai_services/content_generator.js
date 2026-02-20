import {ChatOllama} from '@langchain/ollama'

export const summarizer = async ({book, unit, section}) => {
    if (!book && !unit && !section) {
        throw new Error("No book, unit or section");        
    }

    let llm = new ChatOllama({model: 'smollm2:135m'})
    let response = await llm.invoke(`
        Summarize the following information in single paragraph:
        ${book? 'SUBJECT: ' + book.subject : ''}
        ${book? 'GRADE LEVEL: ' + book.gradeLevel : ''}
        ${unit? 'UNIT: ' + unit.title : ''}
        ${section? 'TOPIC: ' + section.title : ''}
        SUMMARY:
        `.trim())
    return response.content.trim()
}

export const clarifier = async ({section}) => {
    if (!section) {
        throw new Error("No section");
    }

    let llm = new ChatOllama({model: 'smollm2:135m'})
    let response = await llm.invoke(`
        Clarify the following content on topic ${section.title}:
        CONTENT: ${section.content}
        CLARIFICATION:
        `.trim())
    return response.content.trim()
}