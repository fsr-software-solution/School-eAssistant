import { ChatOllama } from '@langchain/ollama'
import { search as articleSearch } from 'ddg-search'
import { imageSearch } from '@mudbill/duckduckgo-images-api'
import { YouTube as youtubeSearch } from 'youtube-sr'
import * as z from 'zod'
import Resources from '../../models/Resources.js'


const addResources = async ({section, interaction}) => {
    if (!section && !interaction) {
        throw new Error("No section or interaction");
    }

    let llm = new ChatOllama({model: 'gemma3:4b'})
    llm = llm.withStructuredOutput(z.object({
        queryForImage: z.string().describe('Query for searching images'),
        queryForArticle: z.string().describe('Query for searching articles'),
        queryForYouTubeVideo: z.string().describe('Query for searching youtube videos')
    }))

    let topic = section?.title || interaction?.studentQuestion || "";
    let response = await llm.invoke(`
        You are an expert search query generator.

        Given the topic below, generate three optimized search queries:

        1. queryForImage:
        - Suitable for image search engines
        - Focus on visual, descriptive keywords
        - Avoid full sentences

        2. queryForArticle:
        - Suitable for academic or high-quality informational articles
        - Include relevant technical terms if appropriate
        - Optimized for depth and credibility

        3. queryForYouTubeVideo:
        - Suitable for YouTube search
        - Focus on tutorial, explainer, or educational phrasing
        - Optimized for engagement and clarity

        Topic:
        "${topic}"

        Return only the structured output and must be culturally valid. Do not include explanations.
    `.trim())
    
    await new Promise(resolve => setTimeout(resolve, 5000))
    const [articles, images, videos] = await Promise.all([
        articleSearch(response.queryForArticle, {maxPages: 1}),
        imageSearch({query: response.queryForImage}),
        youtubeSearch.search(response.queryForYouTubeVideo)
    ])


    articles?.results?.slice(0, 5)?.map( async (article) => {
        await Resources.create({
            sectionId: section?._id,
            interactionId: interaction?._id,
            title: article.title,
            description: article.description,
            type: 'article',
            link: article.url
        })
    })
    
    images?.slice(0, 5)?.map( async (image) => {
        await Resources.create({
            sectionId: section?._id,
            interactionId: interaction?._id,
            title: image.title,
            description: image.title,
            type: 'image',
            link: image.image
        })
    })

    videos?.slice(0, 5)?.map( async (video) => {
        await Resources.create({
            sectionId: section?._id,
            interactionId: interaction?._id,
            title: video.title,
            description: video.title,
            type: 'youtube',
            link: `https://www.youtube.com/watch?v=${video.id}`
        })        
    })
}


export default addResources