const { GoogleGenAI, Modality } = require('@google/genai');
const fs = require('fs');
const config = require('../config/config.js');
const logger = require('./logger.js');

// Initialize Gemini AI client
const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY || config.GEMINI_API_KEY || "" 
});

/**
 * Ask Gemini AI a question and get a text response
 * @param {string} question - The question to ask
 * @returns {Promise<string>} - The AI response
 */
async function askGemini(question) {
    try {
        if (!question || question.trim().length === 0) {
            throw new Error('Question cannot be empty');
        }

        const prompt = `You are a helpful AI assistant integrated into a Discord bot. 
        Please provide a clear, informative, and engaging response to the following question.
        Keep your response conversational but informative. If the question requires a long answer, 
        structure it with appropriate formatting.
        
        Question: ${question}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.7,
                topP: 0.9,
                maxOutputTokens: 2048,
            }
        });

        if (!response || !response.text) {
            throw new Error('Empty response from Gemini AI');
        }

        return response.text.trim();

    } catch (error) {
        logger.error('Error in askGemini:', error);
        
        if (error.message.includes('API_KEY')) {
            throw new Error('Gemini API key is not configured or invalid');
        } else if (error.message.includes('403')) {
            throw new Error('API access forbidden - check your API key permissions');
        } else if (error.message.includes('429')) {
            throw new Error('API quota exceeded - too many requests');
        } else if (error.message.includes('safety')) {
            throw new Error('Content was blocked by safety filters');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
            throw new Error('Network error - please try again');
        } else {
            throw new Error(`Gemini AI error: ${error.message}`);
        }
    }
}

/**
 * Generate an image using Gemini AI
 * @param {string} prompt - The image description prompt
 * @param {string} imagePath - Path where the image should be saved
 * @returns {Promise<void>}
 */
async function generateImage(prompt, imagePath) {
    try {
        if (!prompt || prompt.trim().length === 0) {
            throw new Error('Image prompt cannot be empty');
        }

        logger.info(`Generating image with prompt: ${prompt}`);

        // Enhanced prompt for better image generation
        const enhancedPrompt = `Create a high-quality, detailed image of: ${prompt}. 
        The image should be visually appealing, well-composed, and suitable for general audiences.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-preview-image-generation",
            contents: [{ role: "user", parts: [{ text: enhancedPrompt }] }],
            config: {
                responseModalities: [Modality.TEXT, Modality.IMAGE],
                temperature: 0.8,
            }
        });

        const candidates = response.candidates;
        if (!candidates || candidates.length === 0) {
            throw new Error('No image candidates generated');
        }

        const content = candidates[0].content;
        if (!content || !content.parts) {
            throw new Error('No content parts in response');
        }

        let imageGenerated = false;
        let textResponse = '';

        for (const part of content.parts) {
            if (part.text) {
                textResponse += part.text;
                logger.info(`Image generation text response: ${part.text}`);
            } else if (part.inlineData && part.inlineData.data) {
                try {
                    const imageData = Buffer.from(part.inlineData.data, 'base64');
                    fs.writeFileSync(imagePath, imageData);
                    logger.info(`Image saved successfully to: ${imagePath}`);
                    imageGenerated = true;
                } catch (saveError) {
                    logger.error('Error saving image:', saveError);
                    throw new Error('Failed to save generated image');
                }
            }
        }

        if (!imageGenerated) {
            if (textResponse.toLowerCase().includes('cannot') || 
                textResponse.toLowerCase().includes('unable') || 
                textResponse.toLowerCase().includes('inappropriate')) {
                throw new Error('Image generation was blocked by content filters');
            }
            throw new Error('No image data received from Gemini AI');
        }

    } catch (error) {
        logger.error('Error in generateImage:', error);
        
        if (error.message.includes('API_KEY')) {
            throw new Error('Gemini API key is not configured or invalid');
        } else if (error.message.includes('403')) {
            throw new Error('API access forbidden - check your API key permissions');
        } else if (error.message.includes('429')) {
            throw new Error('API quota exceeded - too many requests');
        } else if (error.message.includes('safety') || error.message.includes('blocked')) {
            throw new Error('Image prompt was blocked by content safety filters');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
            throw new Error('Network error - please try again');
        } else if (error.message.includes('model')) {
            throw new Error('Image generation model is currently unavailable');
        } else {
            throw new Error(`Image generation error: ${error.message}`);
        }
    }
}

/**
 * Analyze sentiment of text using Gemini AI
 * @param {string} text - Text to analyze
 * @returns {Promise<Object>} - Sentiment analysis result
 */
async function analyzeSentiment(text) {
    try {
        const systemPrompt = `You are a sentiment analysis expert. 
        Analyze the sentiment of the text and provide a rating
        from 1 to 5 stars and a confidence score between 0 and 1.
        Respond with JSON in this format: 
        {'rating': number, 'confidence': number, 'summary': 'brief description'}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: {
                    type: "object",
                    properties: {
                        rating: { type: "number" },
                        confidence: { type: "number" },
                        summary: { type: "string" }
                    },
                    required: ["rating", "confidence", "summary"],
                },
            },
            contents: text,
        });

        const rawJson = response.text;
        
        if (rawJson) {
            const data = JSON.parse(rawJson);
            return data;
        } else {
            throw new Error("Empty response from sentiment analysis model");
        }
    } catch (error) {
        logger.error('Error in analyzeSentiment:', error);
        throw new Error(`Sentiment analysis error: ${error.message}`);
    }
}

module.exports = {
    askGemini,
    generateImage,
    analyzeSentiment
};
