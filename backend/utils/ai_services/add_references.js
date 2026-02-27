import References from '../../models/References.js'

const addReferences = async ({interaction, quiz, similaritySearchResults}) => {
    if ((!interaction && !quiz) || !similaritySearchResults) {
        throw new Error('Reference field is required')        
    }
    
    let references = similaritySearchResults?.map( async (doc) => {
        let reference = await References.create({
            interactionId: interaction?._id,
            quizId: quiz?._id,
            bookId: doc?.metadata?.bookId?.toString(),
            quotedText: doc?.pageContent,
            pageNumber: doc?.metadata?.loc?.pageNumber,
            lineFrom: doc?.metadata?.loc?.lines?.from,
            lineTo: doc?.metadata?.loc?.lines?.to
        })
        return await reference.populate('bookId', 'subject gradeLevel yearOfPublish filePath')
    })

    return await Promise.all(references)
}

export default addReferences