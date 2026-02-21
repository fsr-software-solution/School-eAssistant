import References from '../../models/References.js'

const addReferences = async ({interaction, quiz, similaritySearchResults}) => {
    if ((!interaction && !quiz) || !similaritySearchResults) {
        throw new Error('Reference field is required')        
    }
    
    similaritySearchResults?.map( async (doc) => {
        await References.create({
            interactionId: interaction?._id,
            quizId: quiz?._id,
            bookId: doc?.metadata?.bookId,
            quotedText: doc?.pageContent,
            pageNumber: doc?.metadata?.loc?.pageNumber,
            lineFrom: doc?.metadata?.loc?.lines?.from,
            lineTo: doc?.metadata?.loc?.lines?.to
        })
    })
}

export default addReferences