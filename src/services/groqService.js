import Groq from 'groq-sdk';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const MODEL = 'llama-3.3-70b-versatile';

// New API Key and Model for Hint Mode
const HINT_API_KEY = import.meta.env.VITE_HINT_API_KEY;
const HINT_MODEL = 'openai/gpt-oss-120b';
const CODE_GEN_API_KEY = import.meta.env.VITE_CODE_GEN_API_KEY;

const groq = new Groq({
    apiKey: GROQ_API_KEY,
    dangerouslyAllowBrowser: true // Required for client-side usage
});

const groqHints = new Groq({
    apiKey: HINT_API_KEY,
    dangerouslyAllowBrowser: true
});

const groqCodeGen = new Groq({
    apiKey: CODE_GEN_API_KEY,
    dangerouslyAllowBrowser: true
});

/**
 * Generate explanation for a DSA problem using Groq API
 * @param {string} problemText - The DSA problem text
 * @param {Function} onChunk - Callback function to handle streaming chunks
 * @param {string} webContext - Optional scraped web context for enhanced accuracy
 * @returns {Promise<string>} - The complete AI-generated explanation
 */
export async function generateExplanation(problemText, onChunk = null, webContext = '') {
    const prompt = `You are an expert DSA (Data Structures and Algorithms) tutor. A student has provided you with a DSA problem. Please provide a comprehensive explanation following this structure:

**Problem Summary:**

*Statement Explanation:*
Directly explain what the problem asks in plain, simple terms using a practical analogy. Avoid generic introductory phrases like "This is a classic problem" or "In simpler terms". Be crisp and to-the-point.

*Numerical Example:*
Provide a concrete example with specific values to illustrate the concept. Clearly show:
- Input values
- The decision-making process
- Expected output with explanation

**Concepts Included:**
List and briefly explain the key DSA concepts, data structures, and algorithms that are relevant to solving this problem.
${webContext ? `
**Reference Context from Web Sources (use this to enhance accuracy of your explanation):**
${webContext}
` : ''}
Here is the problem:

${problemText}

Please provide a clear, educational explanation. Remember: be direct and concise, and always structure the Problem Summary with the two subsections above.`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: MODEL,
            temperature: 0.7,
            max_completion_tokens: 2048,
            top_p: 1,
            stream: true,
            stop: null
        });

        let fullResponse = '';

        for await (const chunk of chatCompletion) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                fullResponse += content;
                if (onChunk) {
                    onChunk(content, fullResponse);
                }
            }
        }

        return fullResponse;
    } catch (error) {
        console.error('Error calling Groq API:', error);
        throw error;
    }
}

/**
 * Generate a concept explanation for Teach Me Concept Mode
 * @param {string} topic - The concept topic
 * @param {Function} onChunk - Callback for streaming
 * @param {string} webContext - Scraped web context
 * @returns {Promise<string>}
 */
export async function generateConceptExplanation(topic, onChunk = null, webContext = '') {
    const systemPrompt = `You are an expert Computer Science professor.

IMPORTANT INSTRUCTIONS:
1. You MUST NOT include a "Problem Summary" section.
2. You MUST NOT include "Statement Explanation" or "Numerical Example" sections.
3. Start your response IMMEDIATELY with the header "## Concept Overview".
4. Provide a detailed, engaging explanation of the concept.
5. Use the provided Web Context to ensure accuracy.

Structure:
1. **Concept Overview**: What/Why/Analogy.
2. **Key Characteristics**
3. **How it Works**
4. **Real-world Applications**
5. **Complexity Analysis**
6. **Pros & Cons**

Tone: Encouraging, clear, educational.`;

    const userPrompt = `Teach me about: "${topic}"

${webContext ? `
Web Context to use:
${webContext}
` : ''}`;

    console.log('--------------------------------------------------');
    console.log('🤖 [GroqService] System Prompt:', systemPrompt);
    console.log('🤖 [GroqService] User Prompt:', userPrompt);
    console.log('--------------------------------------------------');

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: userPrompt
                }
            ],
            model: MODEL, // using the model constant (llama-3.3-70b-versatile)
            temperature: 0.7,
            max_completion_tokens: 2048,
            top_p: 1,
            stream: true,
            stop: null
        });

        let fullResponse = '';

        for await (const chunk of chatCompletion) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                fullResponse += content;
                if (onChunk) {
                    onChunk(content, fullResponse);
                }
            }
        }

        return fullResponse;
    } catch (error) {
        console.error('Error calling Groq API for concept:', error);
        throw error;
    }
}

/**
 * Generate structured hints for Hint Mode
 * @param {string} problemText - The DSA problem
 * @returns {Promise<Object>} - JSON object containing hints and methods
 */
export async function generateHintContent(problemText) {
    const prompt = `You are an expert DSA tutor.A student is working on this problem:
    "${problemText}"

Please provide structured hints and solutions in a STRICT JSON format.Do NOT include markdown formatting(like \`\`\`json). Just return the raw JSON object.

The JSON must follow this exact schema:
{
  "hintCardResponses": {
    "Hint 1": {
      "title": "Data Structure",
      "icon": "1",
      "description": "Brief hint about which data structure to use (e.g. HashMap, Heap, etc.)"
    },
    "Hint 2": {
      "title": "Pattern Recognition",
      "icon": "2",
      "description": "Brief hint about the algorithmic pattern (e.g. Sliding Window, Two Pointers)"
    },
    "Hint 3": {
      "title": "Edge Cases",
      "icon": "3",
      "description": "Important edge cases to consider (e.g. empty input, duplicates)"
    }
  },
  "hintResponses": {
    "Method 1": {
      "title": "Brute Force",
      "dataStructure": "Name of DS",
      "timeComplexity": "O(...)",
      "spaceComplexity": "O(...)",
      "description": "**Brute Force Approach:**\\n\\nExplain the naive solution steps.\\n\\n1. **Step 1**...\\n2. **Step 2**...\\n\\n💡 Pros/Cons"
    },
    "Method 2": {
      "title": "Optimized",
      "dataStructure": "Name of DS",
      "timeComplexity": "O(...)",
      "spaceComplexity": "O(...)",
      "description": "**Optimized Approach:**\\n\\nExplain the optimal solution steps.\\n\\n1. **Step 1**...\\n2. **Step 2**...\\n\\n💡 Why it is better"
    },
    "Method 3": {
      "title": "Alternative/Recursive",
      "dataStructure": "Name of DS",
      "timeComplexity": "O(...)",
      "spaceComplexity": "O(...)",
      "description": "**Alternative Approach:**\\n\\nExplain another valid approach (e.g. recursion or sorting).\\n\\n1. **Step 1**...\\n2. **Step 2**..."
    }
  }
}
`;

    try {
        const chatCompletion = await groqHints.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: HINT_MODEL,
            temperature: 0.5, // Lower temperature for consistent JSON
            max_completion_tokens: 2048,
            top_p: 1,
            stream: false, // No streaming for JSON data
            stop: null,
            response_format: { type: "json_object" } // Force JSON mode
        });

        const content = chatCompletion.choices[0]?.message?.content || '{}';
        return JSON.parse(content);

    } catch (error) {
        console.error('Error calling Groq API for hints:', error);
        throw error;
    }
}

/**
 * Generate answer for a follow-up doubt/question
 * @param {string} doubtText - The follow-up question
 * @param {string} originalProblem - The original problem for context
 * @param {Function} onChunk - Callback function to handle streaming chunks
 * @returns {Promise<string>} - The complete AI-generated answer
 */
export async function generateDoubtAnswer(doubtText, originalProblem = '', onChunk = null) {
    const prompt = originalProblem
        ? `Context: The student is working on this DSA problem: "${originalProblem}"

Student's doubt/question: ${doubtText}

Please provide a clear, concise answer to help the student understand better.`
        : `Student's question about DSA: ${doubtText}

Please provide a clear, helpful answer.`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: MODEL,
            temperature: 0.7,
            max_completion_tokens: 1024,
            top_p: 1,
            stream: true,
            stop: null
        });

        let fullResponse = '';

        for await (const chunk of chatCompletion) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                fullResponse += content;
                if (onChunk) {
                    onChunk(content, fullResponse);
                }
            }
        }

        return fullResponse;
    } catch (error) {
        console.error('Error calling Groq API:', error);
        throw error;
    }
}

/**
 * Generate examples for a DSA problem
 * @param {string} exampleRequest - The example request text
 * @param {string} originalProblem - The original problem for context
 * @param {Function} onChunk - Callback function to handle streaming chunks
 * @returns {Promise<string>} - The complete AI-generated examples
 */
export async function generateExample(exampleRequest, originalProblem = '', onChunk = null) {
    const prompt = originalProblem
        ? `Context: The student is working on this DSA problem: "${originalProblem}"

Student's request: ${exampleRequest}

Please provide similar examples, use cases, or variations of this problem. Include:
- Similar problem examples with different inputs/outputs
- Real-world use cases where this algorithm/data structure is applied
- Variations of the problem with slight modifications

Make it educational and help the student understand the broader applications.`
        : `Student's request for examples: ${exampleRequest}

Please provide relevant examples and use cases.`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: MODEL,
            temperature: 0.7,
            max_completion_tokens: 1024,
            top_p: 1,
            stream: true,
            stop: null
        });

        let fullResponse = '';

        for await (const chunk of chatCompletion) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                fullResponse += content;
                if (onChunk) {
                    onChunk(content, fullResponse);
                }
            }
        }

        return fullResponse;
    } catch (error) {
        console.error('Error calling Groq API:', error);
        throw error;
    }
}


/**
 * Generate code for a DSA problem in a specific language
 * @param {string} problemText - The problem description
 * @param {string} language - The target programming language
 * @param {Function} onChunk - Callback function to handle streaming chunks
 * @returns {Promise<string>} - The complete AI-generated code
 */
export async function generateCode(problemText, language) {
    console.log('[GroqService] Requesting code generation with model: openai/gpt-oss-120b');
    const prompt = `You are an expert ${language} programmer. A student needs the solution for this DSA problem:
"${problemText}"

Please provide TWO distinct approaches to solve this problem:
1. **Brute Force Approach**: The naive solution.
2. **Optimized Approach**: The most efficient solution (time/space complexity wise).

You must return the response in **STRICT JSON format**. Do NOT use markdown.
The JSON structure must be:
{
  "approaches": [
    {
      "title": "Brute Force Approach",
      "code": "Full ${language} code here... (MUST use \\n for newlines)"
    },
    {
      "title": "Optimized Approach",
      "code": "Full ${language} code here... (MUST use \\n for newlines)"
    }
  ]
}

IMPORTANT: The "code" field MUST be a single string with \\n characters for line breaks. Do NOT return it as a list of lines. Do NOT return it as a single long line without \\n.
Example format: "import os\\n\\ndef foo():\\n    return 1"

For each "code" field:
- Include full, correct, well-commented code.
- Start with imports/class definitions.
- Include a driver code/example at the bottom.
`;

    try {
        const chatCompletion = await groqCodeGen.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: 'openai/gpt-oss-120b',
            temperature: 0.2,
            max_completion_tokens: 4096, // Increased for multiple solutions
            top_p: 1,
            stream: false, // JSON mode requires non-streaming usually for validity
            stop: null,
            response_format: { type: "json_object" }
        });

        const content = chatCompletion.choices[0]?.message?.content || '{"approaches": []}';
        return JSON.parse(content);

    } catch (error) {
        console.error('Error calling Groq API for code gen:', error);
        throw error;
    }
}

/**
 * Debug code and find errors using Groq API
 * @param {string} userCode - The code submitted by the user
 * @returns {Promise<Object>} - JSON object containing user code, corrected code, and errors
 */
export async function debugCode(userCode) {
    console.log('[GroqService] Requesting code debugging with model: openai/gpt-oss-120b');
    const prompt = `You are an expert code debugger and programming tutor. A student has submitted code that may contain errors. Your task is to:

1. Analyze the code for syntax errors, logical errors, and bugs
2. Identify the exact line numbers where errors occur
3. Provide the corrected version of the code
4. Explain each error clearly

Here is the student's code:

\`\`\`
${userCode}
\`\`\`

You must return the response in **STRICT JSON format**. Do NOT use markdown.
The JSON structure must be:
{
  "userCode": "The exact code the user provided (preserve formatting with \\n for newlines)",
  "correctedCode": "The fully corrected version of the code (with \\n for newlines)",
  "errors": [
    {
      "line": 3,
      "message": "Clear explanation of what's wrong and how to fix it"
    }
  ]
}

IMPORTANT RULES:
- The "userCode" field should be the EXACT code provided by the user
- The "correctedCode" field should have ALL errors fixed
- The "errors" array should list EVERY error found, with accurate line numbers (1-indexed)
- Line numbers should match the line numbers in the original code
- Each error message should be clear, educational, and explain both the problem and the solution
- Use \\n characters for line breaks in code strings
- If no errors are found, return an empty errors array []

Analyze the code carefully and provide accurate debugging information.`;

    try {
        const chatCompletion = await groqCodeGen.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: 'openai/gpt-oss-120b',
            temperature: 0.1,
            max_completion_tokens: 4096,
            top_p: 1,
            stream: false,
            stop: null,
            response_format: { type: "json_object" }
        });

        const content = chatCompletion.choices[0]?.message?.content || '{"userCode": "", "correctedCode": "", "errors": []}';
        return JSON.parse(content);

    } catch (error) {
        console.error('Error calling Groq API for code debugging:', error);
        throw error;
    }
}

/**
 * Generate a high-quality interactive visualization for DSA concepts
 * @param {string} userCode - The user's code to analyze for concepts
 * @returns {Promise<Object>} - JSON object containing structured data for the VizEngine
 */
export async function generateVisualization(userCode) {
    console.log('[GroqService] Requesting visualization data with model: openai/gpt-oss-120b');
    const prompt = `You are a Visualization Data Engine.
    
Your task is to analyze the following code, identify the core Data Structure state (Tree or Array), and return a **STRICT JSON OBJECT** containing the DATA required to render it.

Student Code:
\`\`\`
${userCode}
\`\`\`

**CRITICAL RULE: GENERATE MOCK DATA**
- Do **NOT** try to trace the user's code with their exact inputs if they are complex.
- **ALWAYS generate your own CLEAN, SMALL, EDUCATIONAL dataset** (Mock Data) that best demonstrates the concept.
- **Arrays**: Must be **5 to 8 integers** (e.g., [10, 5, 20, 8, 15]). No huge numbers. ALL values must be between 0 and 99.
- **Trees**: Must be a balanced tree with **3 to 7 nodes**. Values between 0 and 99.
- If the user uses huge numbers (e.g. 100000), ignore them and use small numbers (e.g. 10, 20).


**CLASSIFICATION HINT**:
- If code contains \`class Node\`, \`struct Node\`, \`.left\`, \`.right\`, \`root\` -> **FORCE TYPE: "tree"**
- If code contains \`arr[i]\`, \`swap\`, \`nums\`, \`sorting\`, \`partition\`, \`pivot\`, \`quicksort\` -> **FORCE TYPE: "array"**

**RESPONSE FORMAT**:
You must determine if the code uses a **Binary Tree/BST** or an **Array/List**.

---

### SCENARIO 1: TREE (Binary Tree, BST, Heap)
Return this JSON:
{
  "concept": "Name of concept",
  "title": "Title of visualization",
  "description": "Brief explanation",
  "type": "tree",
  "root": {
    "value": "RootVal",
    "left": { "value": "LeftVal", "left": null, "right": null },
    "right": { "value": "RightVal", ... }
  },
  "active": ["Values currently being active/compared (e.g. 50)"],
  "visited": ["Values already visited"]
}

---

### SCENARIO 2: ARRAY (Sorting, Searching, Two Pointers)
Return this JSON:
{
  "concept": "Name of concept",
  "title": "Title of visualization",
  "description": "Brief explanation",
  "type": "array",
  "values": [10, 50, 30, 20, 15, 8], 
  "highlights": [0, 2]  // Array of INDICES (integers) to highlight. e.g. [0, 1] means highlight indices 0 and 1.
}
*Constraints: "values" must be an array of numbers. "highlights" must be an array of INDICES.*

---

**Provide ONLY Valid JSON.** No markdown, no text.`;

    try {
        const chatCompletion = await groqCodeGen.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: 'openai/gpt-oss-120b',
            temperature: 0.2, // Low temperature for valid JSON structure
            max_completion_tokens: 4096,
            top_p: 1,
            stream: false,
            stop: null,
            response_format: { type: "json_object" }
        });

        const content = chatCompletion.choices[0]?.message?.content || '{}';
        return JSON.parse(content);

    } catch (error) {
        console.error('Error calling Groq API for visualization:', error);
        return null; // Return null so UI handles it gracefully
    }
}

/**
 * Generate a dynamic DSA problem using Groq API
 * @param {string} topic - The topic (e.g., "Linked List")
 * @param {number} level - The difficulty level (1-25)
 * @returns {Promise<Object>} - JSON object containing problem details
 */
export async function generateProblem(topic, level) {
    console.log(`[GroqService] Generating ${topic} problem for Level ${level}`);
    const difficulty = level <= 5 ? 'Easy' : (level <= 15 ? 'Medium' : 'Hard');

    const prompt = `Generate a unique, high-quality Data Structures and Algorithms problem about "${topic}".
    Difficulty Level: ${difficulty} (Level ${level}/25).
    
    Return the response in **STRICT JSON format**.
    The schema must be:
    {
      "id": ${level},
      "title": "Problem Title",
      "difficulty": "${difficulty}",
      "description": "Full html-formatted description of the problem. Use <p>, <code>, <strong> etc.",
      "examples": [
        {
          "input": "n = 5",
          "output": "15",
          "explanation": "Explanation here..."
        }
      ],
      "constraints": ["n <= 100", "node.val <= 1000"],
      "starterCode": {
        "java": "MUST be complete code with data structures AND function with parameters",
        "python": "MUST be complete code with data structures AND function with parameters",
        "cpp": "MUST be complete code with data structures AND function with parameters",
        "javascript": "MUST be complete code with data structures AND function with parameters",
        "csharp": "MUST be complete code with data structures AND function with parameters"
      }
    }
    
    ═══════════════════════════════════════════════════════════════════
    ⚠️ CRITICAL MANDATORY RULES FOR starterCode (FAILURE = REJECTION):
    ═══════════════════════════════════════════════════════════════════
    
    ❌ FORBIDDEN PATTERNS (Never generate these):
    - void solve()                    ← NO PARAMETERS = WRONG!
    - public void solve()             ← NO PARAMETERS = WRONG!
    - def solve(self):                ← NO PROBLEM PARAMETERS = WRONG!
    - function solve() {}             ← NO PARAMETERS = WRONG!
    
    ✅ REQUIRED PATTERN (Always generate like this):
    - int blackHeight(TreeNode* root)           ← HAS PARAMETER ✓
    - ListNode reverseList(ListNode head)       ← HAS PARAMETER ✓
    - def findKthLargest(self, nums, k):        ← HAS PARAMETERS ✓
    - bool isValidBST(TreeNode* root)           ← HAS PARAMETER ✓
    
    ═══════════════════════════════════════════════════════════════════
    
    **MANDATORY REQUIREMENTS:**
    
    1. ✅ Function name MUST be specific to the problem (e.g., "blackHeight", "reverseList", "isValidBST")
       ❌ Never use generic names like "solve" or "solution"
    
    2. ✅ Function MUST have AT LEAST ONE parameter based on problem input
       ❌ Empty parentheses () are FORBIDDEN
       Example inputs to consider:
       - Tree problems → TreeNode* root, TreeNode root
       - List problems → ListNode* head, ListNode head  
       - Array problems → int[] nums, vector<int>& nums, List<int> nums
       - Graph problems → int[][] graph, vector<vector<int>>& graph
       - String problems → String s, string s, char* s
       - Multiple inputs → (TreeNode* root, int k), (int[] nums, int target)
    
    3. ✅ Return type MUST match expected output (NOT void unless problem truly returns nothing)
       Examples: int, bool, ListNode*, TreeNode*, vector<int>, String, etc.
    
    4. ✅ If problem uses custom data structures (Node, TreeNode, ListNode), MUST include:
       - Complete struct/class definition
       - Multiple constructors
       - Commented out with /** */ or // style
    
    ═══════════════════════════════════════════════════════════════════
    📝 COMPLETE EXAMPLES (Copy this pattern exactly):
    ═══════════════════════════════════════════════════════════════════
    
    🌳 TREE PROBLEM - C++:
    \`\`\`cpp
    /**
     * Definition for a binary tree node.
     * struct TreeNode {
     *     int val;
     *     TreeNode *left;
     *     TreeNode *right;
     *     TreeNode() : val(0), left(nullptr), right(nullptr) {}
     *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
     *     TreeNode(int x, TreeNode *l, TreeNode *r) : val(x), left(l), right(r) {}
     * };
     */
    class Solution {
    public:
        int blackHeight(TreeNode* root) {
            
        }
    };
    \`\`\`
    
    🔗 LINKED LIST PROBLEM - Java:
    \`\`\`java
    /**
     * Definition for singly-linked list.
     * public class ListNode {
     *     int val;
     *     ListNode next;
     *     ListNode() {}
     *     ListNode(int val) { this.val = val; }
     *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
     * }
     */
    class Solution {
        public ListNode reverseList(ListNode head) {
            
        }
    }
    \`\`\`
    
    📊 ARRAY PROBLEM - Python:
    \`\`\`python
    from typing import List

    class Solution:
        def findKthLargest(self, nums: List[int], k: int) -> int:
            pass
    \`\`\`
    
    🔗 LINKED LIST PROBLEM - JavaScript:
    \`\`\`javascript
    /**
     * Definition for singly-linked list.
     * function ListNode(val, next) {
     *     this.val = (val===undefined ? 0 : val)
     *     this.next = (next===undefined ? null : next)
     * }
     */
    /**
     * @param {ListNode} head
     * @return {ListNode}
     */
    var reverseList = function(head) {
        
    };
    \`\`\`
    
    🌳 TREE PROBLEM - C#:
    \`\`\`csharp
    /**
     * Definition for a binary tree node.
     * public class TreeNode {
     *     public int val;
     *     public TreeNode left;
     *     public TreeNode right;
     *     public TreeNode(int val=0, TreeNode left=null, TreeNode right=null) {
     *         this.val = val;
     *         this.left = left;
     *         this.right = right;
     *     }
     * }
     */
    public class Solution {
        public bool IsValidBST(TreeNode root) {
            
        }
    }
    \`\`\`
    
    ═══════════════════════════════════════════════════════════════════
    🎯 YOUR TASK:
    ═══════════════════════════════════════════════════════════════════
    Generate starter code for ALL 5 languages following the exact pattern above.
    Each language MUST have:
    ✓ Data structure definition (if using Node/TreeNode/etc)
    ✓ Problem-specific function name (based on what the problem asks)
    ✓ AT LEAST ONE parameter matching the problem input
    ✓ Correct return type (not void unless truly needed)
    
    Remember: Empty functions like solve() are FORBIDDEN!
    `;

    try {
        const chatCompletion = await groqCodeGen.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'openai/gpt-oss-120b',
            temperature: 0.8,
            max_completion_tokens: 2048,
            stream: false,
            response_format: { type: "json_object" }
        });

        const content = chatCompletion.choices[0]?.message?.content || '{}';
        return JSON.parse(content);
    } catch (error) {
        console.error('Error generating problem:', error);
        return null; // Handle fallback in UI
    }
}

/**
 * Evaluate user submission using Groq API
 * @param {string} code - User's solution code
 * @param {Object} problem - The problem object being solved
 * @param {string} language - Programming language
 * @returns {Promise<Object>} - JSON report
 */
export async function evaluateSubmission(code, problem, language) {
    console.log('[GroqService] Evaluating submission...');
    const prompt = `You are an Algorithm Judge (Online Judge).
    
    The Problem:
    Title: ${problem.title}
    Description: ${problem.description}
    
    The Student's Code (${language}):
    \`\`\`${language}
    ${code}
    \`\`\`
    
    Task: Evaluate the solution for correctness, efficiency, and code quality.
    
    Return a **STRICT JSON** report:
    {
      "status": "Accepted" | "Wrong Answer" | "Time Limit Exceeded" | "Compilation Error",
      "stats": {
        "runtime": "e.g., 2ms",
        "memory": "e.g., 40MB",
        "timeComplexity": "O(n)",
        "spaceComplexity": "O(1)"
      },
      "feedback": [
        "Point 1 about correctness...",
        "Point 2 about efficiency...",
        "Point 3 about style..."
      ],
      "optimizationTips": "Specific advice to improve the solution."
    }
    
    Note: Be strict but helpful. If the code is logically correct but inefficient, mark as Accepted but mention it in feedback.
    `;

    try {
        const chatCompletion = await groqCodeGen.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'openai/gpt-oss-120b',
            temperature: 0.2,
            max_completion_tokens: 2048,
            stream: false,
            response_format: { type: "json_object" }
        });

        const content = chatCompletion.choices[0]?.message?.content || '{}';
        return JSON.parse(content);
    } catch (error) {
        console.error('Error evaluating submission:', error);
        return {
            status: "Error",
            stats: {},
            feedback: ["AI Evaluation Failed. Please try again."],
            optimizationTips: ""
        };
    }
}
