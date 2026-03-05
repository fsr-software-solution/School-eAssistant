import { ChatMistralAI } from '@langchain/mistralai'

export const summarizer = async ({book, unit, section, interaction, quiz}) => {
    if (!book && !unit && !section && !interaction && !quiz) {
        throw new Error("No book, unit, section, interaction or quiz");        
    }

    let llm = new ChatMistralAI({ model: 'mistral-small-latest' })
    let response = await llm.invoke(`
        Summarize the following information in single paragraph:
        ${book? 'SUBJECT: ' + book.subject : ''}
        ${book? 'GRADE LEVEL: ' + book.gradeLevel : ''}
        ${unit? 'UNIT: ' + unit.title : ''}
        ${section? 'TOPIC: ' + section.title : ''}
        ${interaction? 'QUESTION: ' + interaction.studentQuestion : ''}
        ${quiz? 'QUIZ: ' + quiz.question : ''}
        SUMMARY:
        `.trim())
    return response.content.trim()
}

export const clarifier = async ({section}) => {
    if (!section) {
        throw new Error("No section");
    }

    let llm = new ChatMistralAI({ model: 'mistral-small-latest' })
    let response = await llm.invoke(`
        Clarify the following content on topic ${section.title}:
        CONTENT: ${section.content}
        CLARIFICATION:
        `.trim())
    return response.content.trim()
}