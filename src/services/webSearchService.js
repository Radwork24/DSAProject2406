/**
 * Web Search Service
 * Calls the local API endpoint which logs to the IDE terminal
 */

/**
 * Get web context for a question by calling the server-side API
 * @param {string} question - The user's DSA question
 * @returns {Promise<{context: string, sources: array}>} - Context and sources for LLM and citation
 */
export async function getContextForQuestion(question) {
    console.log('🔎 Sending search request to server...');

    try {
        const response = await fetch('/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ question })
        });

        if (!response.ok) {
            console.warn('Search API failed:', response.status);
            return { context: '', sources: [] };
        }

        const data = await response.json();

        if (data.context) {
            console.log('✅ Received context from server (' + data.context.length + ' chars)');
            console.log('📚 Received sources:', data.sources?.length || 0);
            return {
                context: data.context,
                sources: data.sources || []
            };
        }

        return { context: '', sources: [] };
    } catch (error) {
        console.error('Error calling search API:', error);
        return { context: '', sources: [] }; // Return empty object on error
    }
}

/**
 * Get YouTube videos for a topic from the server
 * @param {string} topic - The topic to find videos for
 * @returns {Promise<Array>} - List of video objects
 */
export async function getYouTubeVideos(topic) {
    console.log('📹 Sending video search request to server...');

    try {
        const response = await fetch('/api/videos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ topic })
        });

        if (!response.ok) {
            console.warn('Video API failed:', response.status);
            return [];
        }

        const data = await response.json();

        if (data.videos) {
            console.log('✅ Received ' + data.videos.length + ' videos from server');
            return data.videos;
        }

        return [];
    } catch (error) {
        console.error('Error calling video API:', error);
        return [];
    }
}
