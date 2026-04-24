import Groq from 'groq-sdk';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const MODEL = 'llama-3.3-70b-versatile';

const groq = new Groq({
    apiKey: GROQ_API_KEY,
    dangerouslyAllowBrowser: true
});

// ═══════════════════════════════════════════════════════════════
//  QUESTION GENERATION
// ═══════════════════════════════════════════════════════════════

/**
 * Generate interview questions tailored to company and role
 * @param {string} companyName - Target company
 * @param {string} roleTitle - Target role (e.g., "Software Engineer")
 * @param {number} questionCount - Number of questions to generate
 * @returns {Promise<Array>} Array of question objects
 */
export async function generateInterviewQuestions(companyName = '', roleTitle = 'Software Engineer', questionCount = 5) {
    const prompt = `You are an expert technical interviewer at ${companyName || 'a top tech company'}.
Generate exactly ${questionCount} interview questions for a "${roleTitle}" position.

Mix of question types:
- 2-3 DSA/Coding questions (increasing difficulty)
- 1 System Design question (if applicable)
- 1 Behavioral question

Return STRICT JSON (no markdown):
{
  "questions": [
    {
      "id": 1,
      "type": "dsa" | "system_design" | "behavioral",
      "difficulty": "easy" | "medium" | "hard",
      "question": "The full question text the interviewer would speak aloud",
      "expectedTopics": ["arrays", "hash map"],
      "followUpHints": ["What's the time complexity?", "Can you optimize it?"],
      "maxTimeMinutes": 5
    }
  ],
  "greeting": "A natural, warm greeting to start the interview (1-2 sentences). Mention the company name if provided and the role."
}`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: MODEL,
            temperature: 0.7,
            max_completion_tokens: 2048,
            response_format: { type: 'json_object' }
        });

        const content = chatCompletion.choices[0]?.message?.content || '{}';
        return JSON.parse(content);
    } catch (error) {
        console.error('[InterviewService] Error generating questions:', error);
        // Fallback questions
        return {
            greeting: `Hello! Welcome to your mock interview for the ${roleTitle} role${companyName ? ` at ${companyName}` : ''}. I'll be your interviewer today. Let's get started!`,
            questions: [
                {
                    id: 1,
                    type: 'behavioral',
                    difficulty: 'easy',
                    question: 'Tell me about yourself and why you are interested in this role.',
                    expectedTopics: ['experience', 'motivation'],
                    followUpHints: ['What excites you most about this field?'],
                    maxTimeMinutes: 3
                },
                {
                    id: 2,
                    type: 'dsa',
                    difficulty: 'easy',
                    question: 'Given an array of integers, find two numbers that add up to a specific target. Can you explain your approach and its time complexity?',
                    expectedTopics: ['arrays', 'hash map', 'two sum'],
                    followUpHints: ['Can you do it in one pass?'],
                    maxTimeMinutes: 5
                },
                {
                    id: 3,
                    type: 'dsa',
                    difficulty: 'medium',
                    question: 'How would you detect if a linked list has a cycle? Walk me through your thinking.',
                    expectedTopics: ['linked list', 'two pointers', 'Floyd\'s cycle detection'],
                    followUpHints: ['What if you also need to find where the cycle begins?'],
                    maxTimeMinutes: 7
                },
                {
                    id: 4,
                    type: 'dsa',
                    difficulty: 'hard',
                    question: 'Given a binary tree, find the lowest common ancestor of two given nodes. How would you approach this?',
                    expectedTopics: ['binary tree', 'recursion', 'LCA'],
                    followUpHints: ['What if it\'s a BST instead?'],
                    maxTimeMinutes: 8
                },
                {
                    id: 5,
                    type: 'behavioral',
                    difficulty: 'medium',
                    question: 'Tell me about a challenging technical problem you faced and how you resolved it.',
                    expectedTopics: ['problem solving', 'teamwork'],
                    followUpHints: ['What would you do differently?'],
                    maxTimeMinutes: 4
                }
            ]
        };
    }
}


// ═══════════════════════════════════════════════════════════════
//  ANSWER EVALUATION
// ═══════════════════════════════════════════════════════════════

/**
 * Evaluate user's answer and decide next action
 * @param {Object} question - Current question object
 * @param {string} userAnswer - Transcribed user answer
 * @param {Array} conversationHistory - Previous Q&A pairs for context
 * @returns {Promise<Object>} Evaluation result with feedback and next action
 */
export async function evaluateAnswer(question, userAnswer, conversationHistory = []) {
    const historyContext = conversationHistory
        .map(entry => `Q: ${entry.question}\nA: ${entry.answer}`)
        .join('\n\n');

    const prompt = `You are an expert technical interviewer evaluating a candidate's answer.

${historyContext ? `Previous conversation:\n${historyContext}\n\n` : ''}Current question: "${question.question}"
Question type: ${question.type}
Expected topics: ${question.expectedTopics?.join(', ') || 'general'}

Candidate's answer: "${userAnswer}"

Evaluate the answer and respond in STRICT JSON (no markdown):
{
  "score": 1-10,
  "strengths": ["brief strength 1", "brief strength 2"],
  "weaknesses": ["brief weakness 1"],
  "needsFollowUp": true/false,
  "followUpQuestion": "A follow-up question if needed (null if not)",
  "spokenFeedback": "A brief, natural spoken response (1-2 sentences) that an interviewer would say before moving on. Be encouraging but honest. If asking a follow-up, phrase it naturally."
}

Rules:
- If the answer is too short/vague/off-topic, set needsFollowUp=true and ask a clarifying follow-up
- If the answer is satisfactory, set needsFollowUp=false
- Keep spokenFeedback concise (will be spoken via TTS)
- Maximum 1 follow-up per question`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: MODEL,
            temperature: 0.5,
            max_completion_tokens: 1024,
            response_format: { type: 'json_object' }
        });

        const content = chatCompletion.choices[0]?.message?.content || '{}';
        return JSON.parse(content);
    } catch (error) {
        console.error('[InterviewService] Error evaluating answer:', error);
        return {
            score: 5,
            strengths: ['Good attempt'],
            weaknesses: ['Could not fully evaluate'],
            needsFollowUp: false,
            followUpQuestion: null,
            spokenFeedback: "Thank you for your answer. Let's move on to the next question."
        };
    }
}


// ═══════════════════════════════════════════════════════════════
//  FEEDBACK REPORT
// ═══════════════════════════════════════════════════════════════

/**
 * Generate comprehensive post-interview feedback
 * @param {Array} allResults - Array of {question, answer, evaluation} objects
 * @param {string} roleTitle - Target role
 * @returns {Promise<Object>} Detailed feedback report
 */
export async function generateFeedbackReport(allResults, roleTitle = 'Software Engineer') {
    const qaData = allResults.map((r, i) => (
        `Question ${i + 1} (${r.question.type}, ${r.question.difficulty}): ${r.question.question}
Answer: ${r.answer}
Score: ${r.evaluation?.score || 'N/A'}/10`
    )).join('\n\n');

    const prompt = `You are an expert career coach reviewing a mock interview for a "${roleTitle}" position.

Interview Results:
${qaData}

Generate a comprehensive feedback report in STRICT JSON (no markdown):
{
  "overallScore": 1-100,
  "overallGrade": "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "F",
  "summary": "2-3 sentence overall summary",
  "categoryScores": {
    "technicalKnowledge": 1-10,
    "problemSolving": 1-10,
    "communication": 1-10,
    "codeQuality": 1-10
  },
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "areasToImprove": ["area 1", "area 2", "area 3"],
  "recommendations": ["actionable tip 1", "actionable tip 2"],
  "closingMessage": "An encouraging 1-2 sentence closing message"
}`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: MODEL,
            temperature: 0.6,
            max_completion_tokens: 1500,
            response_format: { type: 'json_object' }
        });

        const content = chatCompletion.choices[0]?.message?.content || '{}';
        return JSON.parse(content);
    } catch (error) {
        console.error('[InterviewService] Error generating feedback:', error);
        return {
            overallScore: 50,
            overallGrade: 'C',
            summary: 'Interview completed. Unable to generate detailed feedback.',
            categoryScores: { technicalKnowledge: 5, problemSolving: 5, communication: 5, codeQuality: 5 },
            strengths: ['Completed the interview'],
            areasToImprove: ['Practice more'],
            recommendations: ['Keep practicing mock interviews'],
            closingMessage: 'Keep practicing! Every interview makes you better.'
        };
    }
}


// ═══════════════════════════════════════════════════════════════
//  TEXT-TO-SPEECH (via server route)
// ═══════════════════════════════════════════════════════════════

/**
 * Convert text to speech using Groq Orpheus TTS
 * @param {string} text - Text to speak
 * @param {string} voice - Voice to use
 * @returns {Promise<HTMLAudioElement>} Audio element that can be played
 */
export async function textToSpeech(text, voice = 'troy') {
    try {
        const response = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, voice })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ error: 'TTS request failed' }));
            throw new Error(err.error || `TTS failed with status ${response.status}`);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        return audio;
    } catch (error) {
        console.error('[InterviewService] TTS Error:', error);
        throw error;
    }
}

let currentAudioElement = null;

/**
 * Speak text and return a promise that resolves when done
 * @param {string} text - Text to speak
 * @param {Function} onStart - Called when audio starts playing
 * @param {Function} onEnd - Called when audio finishes
 * @returns {Promise<void>}
 */
export async function speakText(text, onStart = null, onEnd = null) {
    // Stop any existing speech before starting new
    stopAllSpeech();
    
    const audio = await textToSpeech(text);
    currentAudioElement = audio;

    return new Promise((resolve, reject) => {
        audio.onplay = () => {
            if (onStart) onStart();
        };

        audio.onended = () => {
            URL.revokeObjectURL(audio.src);
            if (onEnd) onEnd();
            resolve();
        };

        audio.onerror = (e) => {
            URL.revokeObjectURL(audio.src);
            if (onEnd) onEnd();
            reject(new Error('Audio playback failed'));
        };

        audio.play().catch(reject);
    });
}

/**
 * Stop any currently playing speech audio immediately
 */
export function stopAllSpeech() {
    if (currentAudioElement) {
        currentAudioElement.pause();
        currentAudioElement.currentTime = 0;
        currentAudioElement = null;
    }
}


// ═══════════════════════════════════════════════════════════════
//  SPEECH-TO-TEXT (via server route)
// ═══════════════════════════════════════════════════════════════

/**
 * Convert audio blob to text using Groq Whisper
 * @param {Blob} audioBlob - Recorded audio blob
 * @returns {Promise<string>} Transcribed text
 */
export async function speechToText(audioBlob) {
    try {
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');

        const response = await fetch('/api/stt', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ error: 'STT request failed' }));
            throw new Error(err.error || `STT failed with status ${response.status}`);
        }

        const data = await response.json();
        return data.text || '';
    } catch (error) {
        console.error('[InterviewService] STT Error:', error);
        throw error;
    }
}
