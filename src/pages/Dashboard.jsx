import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { generateExplanation, generateDoubtAnswer, generateExample, generateHintContent, generateCode, debugCode, generateVisualization, generateConceptExplanation } from '../services/groqService';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, orderBy, getDocs, addDoc, updateDoc, increment, deleteDoc } from 'firebase/firestore';
import { getContextForQuestion, getYouTubeVideos } from '../services/webSearchService';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import VizEngine from '../components/VizEngine';
import LevelTransition from '../components/LevelTransition';

function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [doubtPopups, setDoubtPopups] = useState([]);
  const [minimizedTiles, setMinimizedTiles] = useState([]);
  const [examplePopups, setExamplePopups] = useState([]);
  const [minimizedExampleTiles, setMinimizedExampleTiles] = useState([]);
  const [userName, setUserName] = useState('User');
  const [greeting, setGreeting] = useState('');

  // YouTube Videos State
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [hasInitialResponse, setHasInitialResponse] = useState(false);
  const [doubtCounter, setDoubtCounter] = useState(0);
  const [exampleCounter, setExampleCounter] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [credits, setCredits] = useState(0);
  const [plan, setPlan] = useState('Free'); // User plan state
  const [isPremium, setIsPremium] = useState(false); // Valid premium subscription state
  const [lastResetDate, setLastResetDate] = useState(''); // Store last reset date
  const [originalProblem, setOriginalProblem] = useState('');
  const [searchedTopic, setSearchedTopic] = useState(''); // Store the searched topic for problem generation
  const [citationSources, setCitationSources] = useState([]); // Store sources for citation display
  const [addedConceptLinks, setAddedConceptLinks] = useState({});
  const [conceptsExpanded, setConceptsExpanded] = useState({});

  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const currentChatIdRef = useRef(null); // Ref for up-to-date ID in closures
  const [currentUser, setCurrentUser] = useState(null);
  const [chatToDelete, setChatToDelete] = useState(null); // Custom modal state
  const [showCreditsModal, setShowCreditsModal] = useState(false); // Insufficient credits modal state
  // Mode selection and Hint Mode state
  const [selectedMode, setSelectedMode] = useState('Explanation Mode');
  const [selectedLanguage, setSelectedLanguage] = useState('Python');
  const [hintButtons, setHintButtons] = useState(['Method 1', 'Method 2', 'Method 3']);
  const [hintCardButtons, setHintCardButtons] = useState(['Hint 1', 'Hint 2', 'Hint 3']);
  const [revealedHints, setRevealedHints] = useState([]);
  const [revealedHintCards, setRevealedHintCards] = useState([]);
  const [expandedHints, setExpandedHints] = useState({}); // Track which hints are expanded
  const [expandedHintCards, setExpandedHintCards] = useState({}); // Track which hint cards are expanded
  const [hintQuestion, setHintQuestion] = useState('');

  // Code Generation Mode state
  const [codeGenQuestion, setCodeGenQuestion] = useState('');
  const [generatedApproaches, setGeneratedApproaches] = useState([]);
  const [currentApproachIndex, setCurrentApproachIndex] = useState(0);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  // Debugging Mode state
  const [debugQuestion, setDebugQuestion] = useState('');
  const [debugResponse, setDebugResponse] = useState(null);
  const [isDebugging, setIsDebugging] = useState(false);
  const [isErrorsExpanded, setIsErrorsExpanded] = useState(true);

  // Hint Mode @ mention state
  const [showHintMentionDropdown, setShowHintMentionDropdown] = useState(false);
  const [hintMentionFilter, setHintMentionFilter] = useState('');
  const [selectedHintContext, setSelectedHintContext] = useState(null);
  const secondInputRef = useRef(null);

  // Hint Card responses (general hints) - NOW IN STATE
  const [hintCardResponses, setHintCardResponses] = useState({
    'Hint 1': {
      title: 'Data Structure',
      icon: '1',
      description: 'Think about what data structure would help you store and retrieve information efficiently. Consider **HashMap** for O(1) lookups or **Array** for sequential access.'
    },
    'Hint 2': {
      title: 'Pattern Recognition',
      icon: '2',
      description: 'This problem follows a common pattern. Look for **Two Pointer**, **Sliding Window**, or **Hash-based** approaches that are frequently used in similar problems.'
    },
    'Hint 3': {
      title: 'Edge Cases',
      icon: '3',
      description: 'Don\'t forget edge cases: **empty input**, **single element**, **duplicates**, **negative numbers**, and **no valid solution**. Handle these before implementing the main logic.'
    }
  });

  // Method responses with multiple approaches including TC/SC - NOW IN STATE
  const [hintResponses, setHintResponses] = useState({
    'Method 1': {
      title: 'Brute Force',
      dataStructure: 'Array',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)',
      description: '**Brute Force Approach:**\n\nUse nested loops to compare each element with every other element.\n\n1. **Outer loop**: Iterate through each element\n2. **Inner loop**: Check all remaining elements for the target\n3. Return indices when found\n\n💡 Simple to implement but not efficient for large inputs.'
    },
    'Method 2': {
      title: 'Optimized',
      dataStructure: 'HashMap',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      description: '**Optimized Approach (Hash Map):**\n\nUse a hash map to store seen elements for O(1) lookups.\n\n1. **Single pass**: Iterate through the array once\n2. **Store complement**: For each element, check if complement exists in map\n3. **Add to map**: Store current element and index\n\n💡 Trade space for time - most efficient solution!'
    },
    'Method 3': {
      title: 'Two Pointer',
      dataStructure: 'Sorted Array',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(1)',
      description: '**Two Pointer Approach:**\n\nSort the array and use two pointers from both ends.\n\n1. **Sort**: First sort the array (costs O(n log n))\n2. **Two pointers**: One at start, one at end\n3. **Converge**: Move pointers based on sum comparison\n\n💡 Good when you need to preserve space and sorting is acceptable.'
    }
  });

  // Calculate greeting and fetch user name
  useState(() => {
    const greetings = {
      morning: [
        "Ready to solve some problems?",
        "Fresh start for new algorithms!",
        "Time to optimize your day!",
        "O(1) morning routine loaded.",
        "Let's debug the day ahead.",
        "Rise and code!"
      ],
      afternoon: [
        "Keep the momentum going!",
        "Time for a binary search break?",
        "Optimizing afternoon productivity.",
        "Conquering complexities?",
        "Don't let the bugs bite!",
        "Stay focused, stay sorted."
      ],
      evening: [
        "Unwinding with some LeetCode?",
        "Evening complexity analysis?",
        "Reviewing today's code?",
        "Refactoring mode: ON.",
        "Sunset and syntax errors.",
        "Wrapping up with big O notation."
      ],
      night: [
        "Hello Night Owl",
        "Late night coding session!",
        "O(log n) sleep schedule?",
        "Debugging dreams?",
        "Burning the midnight algorithm.",
        "Quiet hours, clearer logic."
      ]
    };

    // Track last time period using a closure variable
    let lastPeriod = null;

    const updateGreeting = () => {
      const hour = new Date().getHours();
      let period = '';

      if (hour >= 5 && hour < 12) period = 'morning';
      else if (hour >= 12 && hour < 17) period = 'afternoon';
      else if (hour >= 17 && hour < 21) period = 'evening';
      else period = 'night';

      // Update if period changed or if it's the first run (lastPeriod is null)
      if (period !== lastPeriod) {
        const options = greetings[period];
        const randomGreeting = options[Math.floor(Math.random() * options.length)];
        setGreeting(randomGreeting);
        lastPeriod = period;
      }
    };

    updateGreeting();
    // Update greeting every minute to be accurate
    const interval = setInterval(updateGreeting, 60000);

    // Auth listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        // Try to get name and credits from Firestore first
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.name) setUserName(data.name);
            else if (user.displayName) setUserName(user.displayName);

            // Handle Credits and Plan Initialization
            const today = new Date().toLocaleDateString('en-CA'); // 'YYYY-MM-DD' local time

            // Evaluate if user is currently premium and has an active subscription
            let currentPlan = data.plan || 'Free';
            let currentIsPremium = data.isPremium || currentPlan === 'Premium';

            if (currentIsPremium && data.subscriptionEndDate) {
              // If the subscription is expired, reset to free
              if (data.subscriptionEndDate.toDate() < new Date()) {
                currentIsPremium = false;
                currentPlan = 'Free';
                await updateDoc(docRef, { isPremium: false, plan: 'Free' });
              }
            }

            setPlan(currentPlan);
            setIsPremium(currentIsPremium);

            if (data.credits !== undefined) {
              if (data.lastResetDate !== today) {
                // Determine reset amount based on premium status
                const resetAmount = currentIsPremium ? 1000 : 10;
                await updateDoc(docRef, { credits: resetAmount, lastResetDate: today });
                setCredits(resetAmount);
                setLastResetDate(today);
              } else {
                setCredits(data.credits);
                setLastResetDate(data.lastResetDate);
              }
            } else {
              // Existing user but no credits assigned yet
              const resetAmount = currentIsPremium ? 1000 : 10;
              await updateDoc(docRef, { credits: resetAmount, lastResetDate: today });
              setCredits(resetAmount);
              setLastResetDate(today);
            }
          } else {
            // New user, create document with initial credits and plan
            const today = new Date().toLocaleDateString('en-CA');
            if (user.displayName) setUserName(user.displayName);
            await setDoc(docRef, {
              name: user.displayName || 'User',
              email: user.email,
              credits: 10,
              plan: 'Free',
              isPremium: false,
              lastResetDate: today,
              createdAt: new Date().toISOString()
            });
            setCredits(10);
            setPlan('Free');
            setIsPremium(false);
            setLastResetDate(today);
          }

          // Load user's chat history
          loadUserChats(user.uid);
        } catch (error) {
          console.error("Error fetching user data:", error);
          if (user.displayName) setUserName(user.displayName);
        }
      } else {
        setUserName('User');
        setCurrentUser(null);
        setChatHistory([]);
        setCredits(0);
      }
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  // Helper to load chat history
  const loadUserChats = async (userId) => {
    try {
      const chatsRef = collection(db, "users", userId, "chats");
      const q = query(chatsRef, orderBy("updatedAt", "desc"));
      const querySnapshot = await getDocs(q);

      const chats = [];
      querySnapshot.forEach((doc) => {
        chats.push({ id: doc.id, ...doc.data() });
      });

      setChatHistory(chats);
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  };

  // Helper to save current chat
  const saveChatToFirebase = async (messagesToSave, mode, originalProb, isNewChat = false) => {
    if (!currentUser || messagesToSave.length === 0) return;

    try {
      const title = originalProb || messagesToSave[0]?.text || 'New Chat';
      const shortTitle = title.length > 40 ? title.substring(0, 40) + '...' : title;

      const chatData = {
        title: shortTitle,
        updatedAt: new Date().toISOString(),
        messages: messagesToSave,
        mode: mode,
        originalProblem: originalProb
      };

      if (isNewChat || !currentChatIdRef.current) {
        // Create new chat document
        chatData.createdAt = new Date().toISOString();
        const docRef = await addDoc(collection(db, "users", currentUser.uid, "chats"), chatData);
        setCurrentChatId(docRef.id);
        currentChatIdRef.current = docRef.id;

        // Update local chat history state
        setChatHistory(prev => [{ id: docRef.id, ...chatData }, ...prev]);
      } else {
        // Update existing chat document
        const chatRef = doc(db, "users", currentUser.uid, "chats", currentChatIdRef.current);
        await updateDoc(chatRef, chatData);

        // Update local chat history state
        setChatHistory(prev => prev.map(chat =>
          chat.id === currentChatIdRef.current ? { ...chat, ...chatData } : chat
        ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
      }
    } catch (error) {
      console.error("Error saving chat:", error);
      if (error.code === 'permission-denied') {
        alert("Firestore Permission Denied!\nYour Firebase Security Rules may not allow creating or updating documents in the 'chats' subcollection.\n\nPlease go to Firebase Console > Firestore Database > Rules, and ensure you have something like this replacing your old rules:\n\nrules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /users/{userId} {\n      allow read, write: if request.auth != null && request.auth.uid == userId;\n      match /chats/{chatId} {\n        allow read, write: if request.auth != null && request.auth.uid == userId;\n      }\n    }\n  }\n}");
      } else {
        alert(`Error saving chat to Firebase: ${error.message}`);
      }
    }
  };

  // Helper function to get user initials
  const getInitials = (name) => {
    if (!name || name === 'User') return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleConcepts = (messageId) => {
    setConceptsExpanded(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  // Handle hint button click - reveal hint and remove button
  const handleHintReveal = (hintType) => {
    // Add the revealed hint with its response
    setRevealedHints(prev => [...prev, {
      type: hintType,
      response: hintResponses[hintType]
    }]);

    // Set the hint as expanded by default
    setExpandedHints(prev => ({ ...prev, [hintType]: true }));

    // Remove the clicked button from available buttons
    setHintButtons(prev => prev.filter(btn => btn !== hintType));
  };

  // Handle hint card click - reveal hint card and remove button
  const handleHintCardReveal = (hintType) => {
    // Add the revealed hint card with its response
    setRevealedHintCards(prev => [...prev, {
      type: hintType,
      response: hintCardResponses[hintType]
    }]);

    // Set the hint card as expanded by default
    setExpandedHintCards(prev => ({ ...prev, [hintType]: true }));

    // Remove the clicked button from available buttons
    setHintCardButtons(prev => prev.filter(btn => btn !== hintType));
  };

  // Toggle hint expand/collapse
  const toggleHintExpand = (hintType) => {
    setExpandedHints(prev => ({ ...prev, [hintType]: !prev[hintType] }));
  };

  // Toggle hint card expand/collapse
  const toggleHintCardExpand = (hintType) => {
    setExpandedHintCards(prev => ({ ...prev, [hintType]: !prev[hintType] }));
  };

  // Reset hint mode state for new question
  const resetHintMode = () => {
    setHintButtons(['Method 1', 'Method 2', 'Method 3']);
    setHintCardButtons(['Hint 1', 'Hint 2', 'Hint 3']);
    setRevealedHints([]);
    setRevealedHintCards([]);
    setExpandedHints({});
    setExpandedHintCards({});
    setHintQuestion('');
    setShowHintMentionDropdown(false);
    setHintMentionFilter('');
    setSelectedHintContext(null);
  };

  // Reset code generation mode state for new question
  const resetCodeGenMode = () => {
    setCodeGenQuestion('');
    setGeneratedApproaches([]);
    setCurrentApproachIndex(0);
    setIsGeneratingCode(false);
  };

  // Reset debugging mode state for new question
  const resetDebugMode = () => {
    setDebugQuestion('');
    setDebugResponse(null);
    setIsDebugging(false);
    setIsErrorsExpanded(true);
  };

  // Load a chat from history
  const loadChat = (chat) => {
    setMessages(chat.messages || []);
    setCurrentChatId(chat.id);
    currentChatIdRef.current = chat.id;
    setOriginalProblem(chat.originalProblem || '');
    setHasInitialResponse(true);

    const loadedMode = chat.mode || 'Explanation Mode';
    setSelectedMode(loadedMode);

    // Reset all old popup states
    setDoubtPopups([]);
    setMinimizedTiles([]);
    setExamplePopups([]);
    setMinimizedExampleTiles([]);

    // Clear and restore mode-specific states based on the chat mode
    resetHintMode();
    resetCodeGenMode();
    resetDebugMode();

    if (loadedMode === 'Hint Mode') {
      setHintQuestion(chat.originalProblem || '');
    } else if (loadedMode === 'Code Generation Mode') {
      setCodeGenQuestion(chat.originalProblem || '');
    } else if (loadedMode === 'Debugging Mode') {
      setDebugQuestion(chat.originalProblem || '');
      // If we saved debug response or errors, we'd restore them here. 
      // For now, setting the question brings back the UI, though actual errors are lost unless 
      // they were saved in chat.messages or chat.debugResponse.
    }
  };

  // Trigger delete modal
  const deleteChat = (e, chatId) => {
    e.stopPropagation(); // prevent triggering loadChat
    setChatToDelete(chatId);
  };

  // Cancel deletion
  const cancelDeleteChat = () => {
    setChatToDelete(null);
  };

  // Confirm deletion
  const confirmDeleteChat = async () => {
    if (!chatToDelete) return;

    try {
      if (currentUser) {
        const chatRef = doc(db, "users", currentUser.uid, "chats", chatToDelete);
        await deleteDoc(chatRef);
      }

      // Update local state
      setChatHistory(prev => prev.filter(chat => chat.id !== chatToDelete));

      // If we deleted the currently active chat, clear the UI
      if (currentChatIdRef.current === chatToDelete) {
        setMessages([]);
        setCurrentChatId(null);
        currentChatIdRef.current = null;
        setOriginalProblem('');
        setHasInitialResponse(false);
        setInputValue('');
        resetHintMode();
        resetCodeGenMode();
        resetDebugMode();
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      alert("Failed to delete chat. Please try again.");
    } finally {
      setChatToDelete(null);
    }
  };

  // Generate dummy debugging response
  const generateDummyDebugResponse = (userCode) => {
    // Dummy user code with errors
    const dummyUserCode = `def binary_search(arr, target):
    left = 0
    right = len(arr)
    
    while left <= right:
        mid = (left + right) / 2
        
        if arr[mid] = target:
            return mid
        elif arr[mid] < target:
            left = mid
        else:
            right = mid
    
    return -1`;

    // Corrected version
    const correctedCode = `def binary_search(arr, target):
    left = 0
    right = len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1`;

    // Error locations: [lineNumber, errorMessage]
    const errors = [
      { line: 3, message: 'Missing -1: should be len(arr) - 1' },
      { line: 6, message: 'Use // for integer division, not /' },
      { line: 8, message: 'Use == for comparison, not =' },
      { line: 11, message: 'Should be mid + 1, not mid' },
      { line: 13, message: 'Should be mid - 1, not mid' }
    ];

    return {
      userCode: dummyUserCode,
      correctedCode: correctedCode,
      errors: errors
    };
  };

  // Detect programming language from code
  const detectLanguage = (code) => {
    if (!code) return 'javascript';

    // Python detection
    if (/\bdef\b|\bimport\b|\bfrom\b.*\bimport\b|\bclass\b.*:|\bif\b.*:|\bfor\b.*:|\bwhile\b.*:/i.test(code)) {
      return 'python';
    }
    // C++ detection
    if (/#include|std::|cout|cin|namespace|template\s*<|vector<|map</i.test(code)) {
      return 'cpp';
    }
    // Java detection
    if (/\bpublic\s+class\b|\bprivate\s+\w+\b|\bprotected\s+\w+\b|System\.out\.println|public\s+static\s+void\s+main/i.test(code)) {
      return 'java';
    }
    // JavaScript/TypeScript detection
    if (/\bconst\b|\blet\b|\bvar\b|function\s*\(|=>\s*{|console\.log|require\(|import\s+.*\s+from/i.test(code)) {
      return 'javascript';
    }

    // Default to javascript
    return 'javascript';
  };

  // Helper function to get the correct language identifier for syntax highlighter
  const getLanguageForHighlighter = (language) => {
    const languageMap = {
      'Python': 'python',
      'C++': 'cpp',
      'Java': 'java',
      'JavaScript': 'javascript'
    };
    return languageMap[language] || 'javascript';
  };

  // Code templates for different languages
  const codeTemplates = {
    'Python': `def twoSum(nums, target):
    """
    Find two numbers in the array that add up to target.
    
    Args:
        nums: List of integers
        target: Target sum
    
    Returns:
        List of two indices
    """
    # Create a hash map to store value -> index
    seen = {}
    
    # Iterate through the array
    for i, num in enumerate(nums):
        # Calculate the complement
        complement = target - num
        
        # Check if complement exists in hash map
        if complement in seen:
            return [seen[complement], i]
        
        # Store current number and its index
        seen[num] = i
    
    # No solution found
    return []

# Example usage
nums = [2, 7, 11, 15]
target = 9
result = twoSum(nums, target)
print(f"Indices: {result}")  # Output: [0, 1]`,

    'C++': `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    /**
     * Find two numbers in the array that add up to target.
     * 
     * @param nums Vector of integers
     * @param target Target sum
     * @return Vector of two indices
     */
    vector<int> twoSum(vector<int>& nums, int target) {
        // Create a hash map to store value -> index
        unordered_map<int, int> seen;
        
        // Iterate through the array
        for (int i = 0; i < nums.size(); i++) {
            // Calculate the complement
            int complement = target - nums[i];
            
            // Check if complement exists in hash map
            if (seen.find(complement) != seen.end()) {
                return {seen[complement], i};
            }
            
            // Store current number and its index
            seen[nums[i]] = i;
        }
        
        // No solution found
        return {};
    }
};

// Example usage
int main() {
    Solution solution;
    vector<int> nums = {2, 7, 11, 15};
    int target = 9;
    vector<int> result = solution.twoSum(nums, target);
    // Output: [0, 1]
    return 0;
}`,

    'Java': `import java.util.HashMap;
import java.util.Map;

class Solution {
    /**
     * Find two numbers in the array that add up to target.
     * 
     * @param nums Array of integers
     * @param target Target sum
     * @return Array of two indices
     */
    public int[] twoSum(int[] nums, int target) {
        // Create a hash map to store value -> index
        Map<Integer, Integer> seen = new HashMap<>();
        
        // Iterate through the array
        for (int i = 0; i < nums.length; i++) {
            // Calculate the complement
            int complement = target - nums[i];
            
            // Check if complement exists in hash map
            if (seen.containsKey(complement)) {
                return new int[] { seen.get(complement), i };
            }
            
            // Store current number and its index
            seen.put(nums[i], i);
        }
        
        // No solution found
        return new int[] {};
    }
    
    // Example usage
    public static void main(String[] args) {
        Solution solution = new Solution();
        int[] nums = {2, 7, 11, 15};
        int target = 9;
        int[] result = solution.twoSum(nums, target);
        // Output: [0, 1]
    }
}`,

    'JavaScript': `/**
 * Find two numbers in the array that add up to target.
 * 
 * @param {number[]} nums - Array of integers
 * @param {number} target - Target sum
 * @return {number[]} - Array of two indices
 */
function twoSum(nums, target) {
    // Create a hash map to store value -> index
    const seen = new Map();
    
    // Iterate through the array
    for (let i = 0; i < nums.length; i++) {
        // Calculate the complement
        const complement = target - nums[i];
        
        // Check if complement exists in hash map
        if (seen.has(complement)) {
            return [seen.get(complement), i];
        }
        
        // Store current number and its index
        seen.set(nums[i], i);
    }
    
    // No solution found
    return [];
}

// Example usage
const nums = [2, 7, 11, 15];
const target = 9;
const result = twoSum(nums, target);
console.log(\`Indices: \${result}\`);  // Output: [0, 1]`
  };

  // Handle @ mention input detection in second input area (Hint Mode)
  const handleHintInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    // Detect @ symbol for mentioning hints
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1 && (revealedHints.length > 0 || revealedHintCards.length > 0)) {
      const textAfterAt = value.substring(lastAtIndex + 1);
      // Check if we're still typing after @
      if (!textAfterAt.includes(' ') || textAfterAt.length === 0) {
        setHintMentionFilter(textAfterAt.toLowerCase());
        setShowHintMentionDropdown(true);
      } else {
        setShowHintMentionDropdown(false);
      }
    } else {
      setShowHintMentionDropdown(false);
    }
  };

  // Insert selected hint mention into input
  const insertHintMention = (hintType) => {
    const lastAtIndex = inputValue.lastIndexOf('@');
    const beforeAt = inputValue.substring(0, lastAtIndex);
    const newValue = `${beforeAt}@${hintType} `;
    setInputValue(newValue);
    setShowHintMentionDropdown(false);

    // Find context in either hints or hint cards
    const allHints = [...revealedHints, ...revealedHintCards];
    setSelectedHintContext(allHints.find(h => h.type === hintType));

    // Focus back on input
    if (secondInputRef.current) {
      secondInputRef.current.focus();
    }
  };

  // Get filtered hints for dropdown
  const getFilteredHints = () => {
    const allHints = [...revealedHints, ...revealedHintCards];
    return allHints.filter(hint =>
      hint.type.toLowerCase().includes(hintMentionFilter)
    );
  };

  // Concept mapping for clickable links
  const conceptMap = {
    'Array': '/concepts/array',
    'Arrays': '/concepts/array',
    'Graph': '/concepts/graph',
    'Graphs': '/concepts/graph',
    'Hashing': '/concepts/hashing',
    'Hash': '/concepts/hashing',
    'Hash Table': '/concepts/hashing',
    'Hash Map': '/concepts/hashing',
    'Heap': '/concepts/heap',
    'Heaps': '/concepts/heap',
    'Priority Queue': '/concepts/heap',
    'Linked List': '/concepts/linkedlist',
    'LinkedList': '/concepts/linkedlist',
    'Queue': '/concepts/queue',
    'Queues': '/concepts/queue',
    'Stack': '/concepts/stack',
    'Stacks': '/concepts/stack',
    'String': '/concepts/string',
    'Strings': '/concepts/string',
    'Tree': '/concepts/tree',
    'Trees': '/concepts/tree',
    'Binary Tree': '/concepts/tree',
    'BST': '/concepts/tree',
  };

  // Function to add Learn More links to concept titles in markdown text
  const addLearnMoreLinks = (text, messageId) => {
    const conceptKeywords = Object.keys(conceptMap);
    const sortedKeywords = conceptKeywords.sort((a, b) => b.length - a.length);

    // Track which concepts we've already added links for
    const addedConcepts = new Set();

    // Process each line
    const lines = text.split('\n');
    const processedLines = lines.map((line, lineIndex) => {

      // Check if line contains bold text (concept titles)
      const hasBoldText = /\*\*([^*]+)\*\*/.test(line);

      if (!hasBoldText) {
        return line;
      }

      // Find bold text patterns like **Concept Name:** or **Concept Name**
      const boldPattern = /\*\*([^*]+)\*\*/g;
      let processedLine = line;
      let match;

      while ((match = boldPattern.exec(line)) !== null) {
        const boldText = match[1];

        // Check if this bold text contains a concept keyword
        for (const keyword of sortedKeywords) {
          const regex = new RegExp(`\\b${keyword}\\b`, 'i');
          if (regex.test(boldText)) {
            const conceptKey = `${messageId}-${keyword}`;

            // Only add link if we haven't added one for this concept yet
            if (!addedConcepts.has(conceptKey)) {
              addedConcepts.add(conceptKey);

              // Add the Learn More link right after the bold text
              const learnMoreLink = ` [Learn More ↗](${conceptMap[keyword]})`;
              processedLine = processedLine.replace(
                `**${boldText}**`,
                `**${boldText}**${learnMoreLink}`
              );
              break; // Only add one link per line
            }
          }
        }
      }

      return processedLine;
    });

    const result = processedLines.join('\n');
    return result;
  };

  // Custom markdown components for Learn More links
  const markdownComponentsWithLearnMore = {
    a: ({ href, children }) => {
      // Check if this is a Learn More link
      if (children && children.toString().includes('Learn More')) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="concept-citation"
            onClick={(e) => {
              e.preventDefault();
              window.open(href, '_blank');
            }}
          >
            Learn More
            <svg
              width="8"
              height="8"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="concept-citation-icon"
            >
              <path d="M10 1L1 10M10 1H4M10 1V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        );
      }
      // Regular link
      return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
    },
  };

  // Regular markdown components without concept linking (for rest of response)
  const markdownComponents = {};

  // Helper function to render citations
  const renderCitations = () => {
    if (!citationSources || citationSources.length === 0) return null;

    return (
      <div className="citation-section">
        <div className="citation-header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          Sources
        </div>
        <div className="citation-grid">
          {citationSources.map((source, index) => {
            let hostname = '';
            try {
              hostname = new URL(source.url).hostname;
            } catch (e) {
              hostname = 'source';
            }
            return (
              <a key={index} href={source.url} target="_blank" rel="noopener noreferrer" className="citation-card">
                <img
                  src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
                  alt=""
                  className="citation-icon"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className="citation-content">
                  <div className="citation-title">{source.title}</div>
                  <div className="citation-url">{hostname}</div>
                </div>
                <svg className="citation-external-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            );
          })}
        </div>
      </div>
    );
  };

  // Custom component to render AI response with collapsible concepts
  const AIResponseContent = ({ text, messageId }) => {
    // Split the response into parts: before concepts, concepts section, and after
    const conceptsRegex = /\*\*Concepts Included:\*\*/i;
    const parts = text.split(conceptsRegex);

    if (parts.length === 1) {
      // No concepts section found, render normally WITHOUT concept links
      return (
        <>
          <ReactMarkdown components={markdownComponents}>{text}</ReactMarkdown>
          {renderCitations()}
          {selectedMode === 'Teach Me Concept Mode' && <LevelTransition topic={searchedTopic} userName={userName} />}
        </>
      );
    }

    const beforeConcepts = parts[0];
    const conceptsAndAfter = parts[1];

    // Find where the concepts section ends (next ## or end of text)
    const nextSectionRegex = /\n##[^#]/;
    const nextSectionMatch = conceptsAndAfter.match(nextSectionRegex);

    let conceptsContent, afterConcepts;
    if (nextSectionMatch) {
      const splitIndex = nextSectionMatch.index;
      conceptsContent = conceptsAndAfter.substring(0, splitIndex);
      afterConcepts = conceptsAndAfter.substring(splitIndex);
    } else {
      conceptsContent = conceptsAndAfter;
      afterConcepts = '';
    }

    // Add Learn More links to the concepts content
    const conceptsWithLinks = addLearnMoreLinks(conceptsContent, messageId);

    return (
      <>
        <ReactMarkdown components={markdownComponents}>{beforeConcepts}</ReactMarkdown>

        {/* Collapsible Concepts Section - Hide in Teach Me Concept Mode */}
        {selectedMode !== 'Teach Me Concept Mode' && (
          <div className="concepts-section">
            <div
              className="concepts-toggle"
              onClick={() => toggleConcepts(messageId)}
            >
              <span className="concepts-toggle-text">
                Concepts required in these kind of questions
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`concepts-toggle-icon ${conceptsExpanded[messageId] ? 'expanded' : ''}`}
              >
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {conceptsExpanded[messageId] && (
              <div className="concepts-content">
                <ReactMarkdown components={markdownComponentsWithLearnMore}>{conceptsWithLinks}</ReactMarkdown>
              </div>
            )}
          </div>
        )}


        {afterConcepts && <ReactMarkdown components={markdownComponents}>{afterConcepts}</ReactMarkdown>}

        {renderCitations()}

        {/* Level Animation for Teach Me Concept Mode */}
        {selectedMode === 'Teach Me Concept Mode' && (
          <LevelTransition topic={searchedTopic} userName={userName} />
        )}
      </>
    );
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const today = new Date().toLocaleDateString('en-CA');

    // Premium plan: Unlimited requests, no need to check or deduct
    if (!isPremium) {
      // Check if daily reset is needed at the time of submission
      let currentCredits = credits;
      if (lastResetDate && lastResetDate !== today) {
        const resetAmount = 10;
        currentCredits = resetAmount;
        setCredits(resetAmount);
        setLastResetDate(today);
        if (currentUser) {
          const userRef = doc(db, "users", currentUser.uid);
          await updateDoc(userRef, { credits: resetAmount, lastResetDate: today });
        }
      }

      // Request logic: Check if user has free requests left (1 per request)
      if (currentCredits < 1) {
        setShowCreditsModal(true);
        return;
      }

      // Deduct local state immediately for fast UI update
      setCredits(prev => prev - 1);

      // Deduct in Firestore
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        updateDoc(userRef, {
          credits: increment(-1)
        }).catch(err => console.error("Failed to update requests in Firestore:", err));
      }
    }

    const userText = inputValue.trim();
    setInputValue('');

    // Handle Debugging Mode
    if (selectedMode === 'Debugging Mode') {
      // If no debug question yet, this is the initial code submission
      if (!debugQuestion) {
        resetDebugMode();
        setDebugQuestion(userText);
        setOriginalProblem(userText);

        setIsDebugging(true);

        // Call Groq API for code debugging
        try {
          // Step 1: Get debugging results first
          const response = await debugCode(userText);

          // Validate response structure
          if (response && response.userCode && response.correctedCode && Array.isArray(response.errors)) {
            setDebugResponse(response);

            // Step 2: If errors exist, fetch high-quality visualization separately
            if (response.errors.length > 0) {
              generateVisualization(userText)
                .then(vizResponse => {
                  if (vizResponse && vizResponse.type) {
                    setDebugResponse(prev => ({
                      ...prev,
                      visualization: vizResponse
                    }));
                  }
                })
                .catch(err => console.error("Visualization generation failed:", err));
            }
          } else {
            throw new Error("Invalid response format from AI");
          }

          setHasInitialResponse(true);
        } catch (error) {
          console.error("Failed to debug code:", error);
          // Fallback to error message
          setDebugResponse({
            userCode: userText,
            correctedCode: userText,
            errors: [{
              line: 1,
              message: `Error analyzing code: ${error.message}. Please try again.`
            }]
          });
          setHasInitialResponse(true);
        } finally {
          setIsDebugging(false);
          // Save the chat after debugging response
          const currentMsgs = [{ id: Date.now(), type: 'user', text: userText, timestamp: new Date() }];
          saveChatToFirebase(currentMsgs, 'Debugging Mode', originalProblem);
        }

        return;
      }

      // This is a follow-up query in Debugging Mode
      // Handle similar to other modes (create doubt/example popups)
      const lowerCaseQuery = userText.toLowerCase();
      const isExampleQuery =
        lowerCaseQuery.includes('example') ||
        lowerCaseQuery.includes('similar') ||
        lowerCaseQuery.includes('show me') ||
        lowerCaseQuery.includes('give me') ||
        lowerCaseQuery.includes('use case') ||
        lowerCaseQuery.includes('demonstrate');

      if (isExampleQuery) {
        // Create an example popup (green)
        const exampleId = Date.now();
        const newExampleNumber = exampleCounter + 1;
        setExampleCounter(newExampleNumber);

        const newPopup = {
          id: exampleId,
          exampleNumber: newExampleNumber,
          question: userText,
          answer: '',
          isMinimized: false,
          position: { x: window.innerWidth / 2 - 300, y: window.innerHeight / 2 - 200 },
          size: { width: 600, height: 400 }
        };

        setExamplePopups(prev => [...prev, newPopup]);

        // Call Groq API with streaming for example
        try {
          await generateExample(userText, originalProblem, (chunk, fullText) => {
            setExamplePopups(prev => prev.map(popup =>
              popup.id === exampleId
                ? { ...popup, answer: fullText }
                : popup
            ));
          });
        } catch (error) {
          console.error('Error generating example:', error);
          setExamplePopups(prev => prev.map(popup =>
            popup.id === exampleId
              ? { ...popup, answer: `Error: ${error.message}. Please try again.` }
              : popup
          ));
        }
      } else {
        // Create a doubt popup (orange)
        const doubtId = Date.now();
        const newDoubtNumber = doubtCounter + 1;
        setDoubtCounter(newDoubtNumber);

        const newPopup = {
          id: doubtId,
          doubtNumber: newDoubtNumber,
          question: userText,
          answer: '',
          isMinimized: false,
          position: { x: window.innerWidth / 2 - 300, y: window.innerHeight / 2 - 200 },
          size: { width: 600, height: 400 }
        };

        setDoubtPopups(prev => [...prev, newPopup]);

        // Call Groq API with streaming for doubt answer
        try {
          await generateDoubtAnswer(userText, originalProblem, (chunk, fullText) => {
            setDoubtPopups(prev => prev.map(popup =>
              popup.id === doubtId
                ? { ...popup, answer: fullText }
                : popup
            ));
          });
        } catch (error) {
          console.error('Error generating doubt answer:', error);
          setDoubtPopups(prev => prev.map(popup =>
            popup.id === doubtId
              ? { ...popup, answer: `Error: ${error.message}. Please try again.` }
              : popup
          ));
        }
      }
      return;
    }

    // Handle Code Generation Mode
    if (selectedMode === 'Code Generation Mode') {
      // If no code generation question yet, this is the initial question
      if (!codeGenQuestion) {
        resetCodeGenMode();
        setCodeGenQuestion(userText);
        setOriginalProblem(userText);

        setIsGeneratingCode(true);
        setIsGeneratingCode(true);

        try {
          // Call Groq API for code generation
          // Note: generateCode now returns a Promise<Object> with { approaches: [...] }
          // We await it completely since it's no longer streaming
          const response = await generateCode(userText, selectedLanguage);

          if (response && response.approaches && Array.isArray(response.approaches)) {
            setGeneratedApproaches(response.approaches);
            setCurrentApproachIndex(0);
          } else {
            throw new Error("Invalid response format from AI");
          }

          setHasInitialResponse(true);
        } catch (error) {
          console.error("Failed to generate code:", error);
          // Fallback error approach
          setGeneratedApproaches([{
            title: "Error",
            code: `// Error generating code: ${error.message}\n// Please try again.`
          }]);
          setCurrentApproachIndex(0);
          setHasInitialResponse(true);
        } finally {
          setIsGeneratingCode(false);
          // Save chat after code generation
          const currentMsgs = [{ id: Date.now(), type: 'user', text: userText, timestamp: new Date() }];
          saveChatToFirebase(currentMsgs, 'Code Generation Mode', originalProblem);
        }
        return;
      }

      // This is a follow-up query in Code Generation Mode
      // Handle similar to Explanation Mode (create doubt/example popups)
      const lowerCaseQuery = userText.toLowerCase();
      const isExampleQuery =
        lowerCaseQuery.includes('example') ||
        lowerCaseQuery.includes('similar') ||
        lowerCaseQuery.includes('show me') ||
        lowerCaseQuery.includes('give me') ||
        lowerCaseQuery.includes('use case') ||
        lowerCaseQuery.includes('demonstrate');

      if (isExampleQuery) {
        // Create an example popup (green)
        const exampleId = Date.now();
        const newExampleNumber = exampleCounter + 1;
        setExampleCounter(newExampleNumber);

        const newPopup = {
          id: exampleId,
          exampleNumber: newExampleNumber,
          question: userText,
          answer: '',
          isMinimized: false,
          position: { x: window.innerWidth / 2 - 300, y: window.innerHeight / 2 - 200 },
          size: { width: 600, height: 400 }
        };

        setExamplePopups(prev => [...prev, newPopup]);

        // Call Groq API with streaming for example
        try {
          await generateExample(userText, originalProblem, (chunk, fullText) => {
            setExamplePopups(prev => prev.map(popup =>
              popup.id === exampleId
                ? { ...popup, answer: fullText }
                : popup
            ));
          });
        } catch (error) {
          console.error('Error generating example:', error);
          setExamplePopups(prev => prev.map(popup =>
            popup.id === exampleId
              ? { ...popup, answer: `Error: ${error.message}. Please try again.` }
              : popup
          ));
        }
      } else {
        // Create a doubt popup (orange)
        const doubtId = Date.now();
        const newDoubtNumber = doubtCounter + 1;
        setDoubtCounter(newDoubtNumber);

        const newPopup = {
          id: doubtId,
          doubtNumber: newDoubtNumber,
          question: userText,
          answer: '',
          isMinimized: false,
          position: { x: window.innerWidth / 2 - 300, y: window.innerHeight / 2 - 200 },
          size: { width: 600, height: 400 }
        };

        setDoubtPopups(prev => [...prev, newPopup]);

        // Call Groq API with streaming for doubt answer
        try {
          await generateDoubtAnswer(userText, originalProblem, (chunk, fullText) => {
            setDoubtPopups(prev => prev.map(popup =>
              popup.id === doubtId
                ? { ...popup, answer: fullText }
                : popup
            ));
          });
        } catch (error) {
          console.error('Error generating doubt answer:', error);
          setDoubtPopups(prev => prev.map(popup =>
            popup.id === doubtId
              ? { ...popup, answer: `Error: ${error.message}. Please try again.` }
              : popup
          ));
        }
      }
      return;
    }

    // Handle Hint Mode differently
    if (selectedMode === 'Hint Mode') {
      // If no hint question yet, this is the initial question
      if (!hintQuestion) {
        resetHintMode();
        setHintQuestion(userText);
        setOriginalProblem(userText);

        setIsLoading(true);
        try {
          // Fetch dynamic hints from Groq API
          const dynamicHints = await generateHintContent(userText);

          if (dynamicHints.hintCardResponses) {
            setHintCardResponses(dynamicHints.hintCardResponses);
          }
          if (dynamicHints.hintResponses) {
            setHintResponses(dynamicHints.hintResponses);
          }

          setHasInitialResponse(true);
        } catch (error) {
          console.error("Failed to generate hints:", error);
          // Fallback to defaults or show error (optional)
          setHasInitialResponse(true); // Allow proceeding even if API fails (shows default dummy data)
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // This is a follow-up query in Hint Mode
      // Clear the dropdown
      setShowHintMentionDropdown(false);

      // Extract mentioned hint type from the query
      // Matches @Hint 1, @Method 1, etc.
      const mentionRegex = /@((Hint|Method) \d)/i;
      const mentionMatch = userText.match(mentionRegex);

      // Get the hint context - either from the @ mention or the selected context
      let hintContext = selectedHintContext;
      if (mentionMatch) {
        const mentionedType = mentionMatch[1];
        const allHints = [...revealedHints, ...revealedHintCards];
        hintContext = allHints.find(h => h.type.toLowerCase() === mentionedType.toLowerCase());
      }

      // Remove the @mention from the query text for cleaner API call
      const cleanQuery = userText.replace(mentionRegex, '').trim();

      // Determine if this is an example request or a doubt
      const lowerCaseQuery = cleanQuery.toLowerCase();
      const isExampleQuery =
        lowerCaseQuery.includes('example') ||
        lowerCaseQuery.includes('similar') ||
        lowerCaseQuery.includes('show me') ||
        lowerCaseQuery.includes('give me') ||
        lowerCaseQuery.includes('use case') ||
        lowerCaseQuery.includes('demonstrate');

      // Build context string from the hint
      const hintContextText = hintContext
        ? `The student is asking about this hint:\n\nHint Type: ${hintContext.type}\nHint Content: ${JSON.stringify(hintContext.response, null, 2)}\n\nFull Problem Statement: ${hintQuestion}`
        : `Full Problem Statement: ${hintQuestion}`;

      if (isExampleQuery) {
        // Create an example popup (green)
        const exampleId = Date.now();
        const newExampleNumber = exampleCounter + 1;
        setExampleCounter(newExampleNumber);

        const newPopup = {
          id: exampleId,
          exampleNumber: newExampleNumber,
          question: userText,
          answer: '',
          isMinimized: false,
          position: { x: window.innerWidth / 2 - 300, y: window.innerHeight / 2 - 200 },
          size: { width: 600, height: 400 }
        };

        setExamplePopups(prev => [...prev, newPopup]);

        // Call Groq API with streaming for example
        try {
          await generateExample(cleanQuery, hintContextText, (chunk, fullText) => {
            setExamplePopups(prev => prev.map(popup =>
              popup.id === exampleId
                ? { ...popup, answer: fullText }
                : popup
            ));
          });
        } catch (error) {
          console.error('Error generating example:', error);
          setExamplePopups(prev => prev.map(popup =>
            popup.id === exampleId
              ? { ...popup, answer: `Error: ${error.message}. Please try again.` }
              : popup
          ));
        }
      } else {
        // Create a doubt popup (orange)
        const doubtId = Date.now();
        const newDoubtNumber = doubtCounter + 1;
        setDoubtCounter(newDoubtNumber);

        const newPopup = {
          id: doubtId,
          doubtNumber: newDoubtNumber,
          question: userText,
          answer: '',
          isMinimized: false,
          position: { x: window.innerWidth / 2 - 300, y: window.innerHeight / 2 - 200 },
          size: { width: 600, height: 400 }
        };

        setDoubtPopups(prev => [...prev, newPopup]);

        // Call Groq API with streaming for doubt answer
        try {
          await generateDoubtAnswer(cleanQuery, hintContextText, (chunk, fullText) => {
            setDoubtPopups(prev => prev.map(popup =>
              popup.id === doubtId
                ? { ...popup, answer: fullText }
                : popup
            ));
          });
        } catch (error) {
          console.error('Error generating doubt answer:', error);
          setDoubtPopups(prev => prev.map(popup =>
            popup.id === doubtId
              ? { ...popup, answer: `Error: ${error.message}. Please try again.` }
              : popup
          ));
        }
      }

      // Reset selected context after use
      setSelectedHintContext(null);
      return;
    }

    // Handle Teach Me Concept Mode
    if (selectedMode === 'Teach Me Concept Mode') {
      console.log('➡️ Entering Teach Me Concept Mode Logic');
      // If this is the initial submission
      if (!hasInitialResponse) {
        console.log('✅ Initial Response Path - Calling generateConceptExplanation');
        const userMessage = {
          id: Date.now(),
          type: 'user',
          text: userText,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsSearching(true);
        setOriginalProblem(userText);
        setSearchedTopic(userText); // Save the searched topic for problem generation

        // Create a placeholder for the AI response
        const aiResponseId = Date.now() + 1;
        const aiResponse = {
          id: aiResponseId,
          type: 'ai',
          text: '',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiResponse]);
        setIsSearching(true);
        setRelatedVideos([]); // Clear previous videos

        try {
          // Parallel: Search for videos
          getYouTubeVideos(userText).then(videos => {
            setRelatedVideos(videos);
          });

          // Step 1: Search the web for context (GeeksForGeeks etc)
          let webContext = '';
          let sources = [];
          try {
            // Use the scraper service to get context and sources
            const result = await getContextForQuestion(userText);
            webContext = result.context || '';
            sources = result.sources || [];
            console.log('--------------------------------------------------');
            console.log('🌐 [Dashboard] Scraped Web Content:');
            console.log(webContext || '(No content found)');
            console.log('📚 [Dashboard] Sources:', sources.length);
            console.log('--------------------------------------------------');
            // Store sources for citation display
            setCitationSources(sources);
          } catch (searchError) {
            console.warn('Web search failed, proceeding without context:', searchError);
            webContext = '';
            sources = [];
          }

          let finalFullText = '';
          // Step 2: Call Groq API with streaming for concept explanation
          await generateConceptExplanation(userText, (chunk, fullText) => {
            // Force remove "Problem Summary" if it appears (as a failsafe)
            const cleanedText = fullText.replace(/##\s*Problem Summary[\s\S]*?(?=##\s*Concept Overview)/i, '')
              .replace(/\*\*Problem Summary\*\*[\s\S]*?(?=\*\*Concept Overview\*\*)/i, '')
              .trim();

            finalFullText = cleanedText || fullText;

            // Update the AI response with streaming content
            setMessages(prev => {
              const newMsgs = prev.map(msg =>
                msg.id === aiResponseId
                  ? { ...msg, text: finalFullText }
                  : msg
              );
              return newMsgs;
            });
          }, webContext);

          // Save chat when stream is done using closure variables
          const finalMessages = [
            ...messages,
            userMessage,
            { ...aiResponse, text: finalFullText }
          ];
          saveChatToFirebase(finalMessages, 'Teach Me Concept Mode', originalProblem);

          setHasInitialResponse(true);

        } catch (error) {
          console.error('Error generating concept explanation:', error);
          setMessages(prev => prev.map(msg =>
            msg.id === aiResponseId
              ? { ...msg, text: `I apologize, but I encountered an error while generating the explanation. Please try again. Error: ${error.message}` }
              : msg
          ));
        } finally {
          setIsSearching(false);
        }

        return;
      }

      // Follow-up queries in Teach Me Concept Mode will be handled by the default
      // fall-through logic below
    }

    // If this is the first query (no AI response yet), add to messages normally
    if (!hasInitialResponse) {
      const userMessage = {
        id: Date.now(),
        type: 'user',
        text: userText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setIsSearching(true);
      setOriginalProblem(userText);

      // Create a placeholder for the AI response
      const aiResponseId = Date.now() + 1;
      const aiResponse = {
        id: aiResponseId,
        type: 'ai',
        text: '',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);

      try {
        // Step 1: Search the web for context
        let webContext = '';
        try {
          webContext = await getContextForQuestion(userText);
        } catch (searchError) {
          console.warn('Web search failed, proceeding without context:', searchError);
        }

        setIsSearching(false);
        setIsLoading(true);

        let finalFullText = '';
        // Step 2: Call Groq API with streaming for explanation + web context
        await generateExplanation(userText, (chunk, fullText) => {
          finalFullText = fullText;
          // Update the AI response with streaming content
          setMessages(prev => {
            const newMsgs = prev.map(msg =>
              msg.id === aiResponseId
                ? { ...msg, text: fullText }
                : msg
            );
            return newMsgs;
          });
        }, webContext);

        // Save on stream completion using closure variables
        const finalMessages = [
          ...messages,
          userMessage,
          { ...aiResponse, text: finalFullText }
        ];
        saveChatToFirebase(finalMessages, 'Explanation Mode', originalProblem);

        setHasInitialResponse(true);
      } catch (error) {
        console.error('Error generating explanation:', error);
        setMessages(prev => prev.map(msg =>
          msg.id === aiResponseId
            ? { ...msg, text: `I apologize, but I encountered an error while generating the explanation. Please try again. Error: ${error.message}` }
            : msg
        ));
      } finally {
        setIsSearching(false);
        setIsLoading(false);
      }
    } else {
      // This is a follow-up query - determine if it's an example request or a doubt
      const lowerCaseQuery = userText.toLowerCase();
      const isExampleQuery =
        lowerCaseQuery.includes('example') ||
        lowerCaseQuery.includes('similar') ||
        lowerCaseQuery.includes('show me') ||
        lowerCaseQuery.includes('give me') ||
        lowerCaseQuery.includes('use case') ||
        lowerCaseQuery.includes('variation') ||
        lowerCaseQuery.includes('other problem');

      if (isExampleQuery) {
        // Create an example popup
        const exampleId = Date.now();
        const newExampleNumber = exampleCounter + 1;
        setExampleCounter(newExampleNumber);

        const newPopup = {
          id: exampleId,
          exampleNumber: newExampleNumber,
          question: userText,
          answer: '',
          isMinimized: false,
          position: { x: window.innerWidth / 2 - 300, y: window.innerHeight / 2 - 200 },
          size: { width: 600, height: 400 }
        };

        setExamplePopups(prev => [...prev, newPopup]);

        // Call Groq API with streaming for example
        try {
          await generateExample(userText, originalProblem, (chunk, fullText) => {
            // Update the popup with streaming content
            setExamplePopups(prev => prev.map(popup =>
              popup.id === exampleId
                ? { ...popup, answer: fullText }
                : popup
            ));
          });
        } catch (error) {
          console.error('Error generating example:', error);
          setExamplePopups(prev => prev.map(popup =>
            popup.id === exampleId
              ? { ...popup, answer: `Error: ${error.message}. Please try again.` }
              : popup
          ));
        }
      } else {
        // Create a doubt popup
        const doubtId = Date.now();
        const newDoubtNumber = doubtCounter + 1;
        setDoubtCounter(newDoubtNumber);

        const newPopup = {
          id: doubtId,
          doubtNumber: newDoubtNumber,
          question: userText,
          answer: '',
          isMinimized: false,
          position: { x: window.innerWidth / 2 - 300, y: window.innerHeight / 2 - 200 },
          size: { width: 600, height: 400 }
        };

        setDoubtPopups(prev => [...prev, newPopup]);

        // Call Groq API with streaming for doubt answer
        try {
          await generateDoubtAnswer(userText, originalProblem, (chunk, fullText) => {
            // Update the popup with streaming content
            setDoubtPopups(prev => prev.map(popup =>
              popup.id === doubtId
                ? { ...popup, answer: fullText }
                : popup
            ));
          });
        } catch (error) {
          console.error('Error generating doubt answer:', error);
          setDoubtPopups(prev => prev.map(popup =>
            popup.id === doubtId
              ? { ...popup, answer: `Error: ${error.message}. Please try again.` }
              : popup
          ));
        }
      }
    }


  };

  const closePopup = (popupId) => {
    setDoubtPopups(prev => prev.filter(p => p.id !== popupId));
  };

  const minimizePopup = (popupId) => {
    const popup = doubtPopups.find(p => p.id === popupId);
    if (popup) {
      setMinimizedTiles(prev => [...prev, popup]);
      setDoubtPopups(prev => prev.filter(p => p.id !== popupId));
    }
  };

  const restorePopup = (tileId) => {
    const tile = minimizedTiles.find(t => t.id === tileId);
    if (tile) {
      setDoubtPopups(prev => [...prev, { ...tile, isMinimized: false }]);
      setMinimizedTiles(prev => prev.filter(t => t.id !== tileId));
    }
  };

  const removeTile = (tileId) => {
    setMinimizedTiles(prev => prev.filter(t => t.id !== tileId));
  };

  const closeExamplePopup = (popupId) => {
    setExamplePopups(prev => prev.filter(p => p.id !== popupId));
  };

  const minimizeExamplePopup = (popupId) => {
    const popup = examplePopups.find(p => p.id === popupId);
    if (popup) {
      setMinimizedExampleTiles(prev => [...prev, popup]);
      setExamplePopups(prev => prev.filter(p => p.id !== popupId));
    }
  };

  const restoreExamplePopup = (tileId) => {
    const tile = minimizedExampleTiles.find(t => t.id === tileId);
    if (tile) {
      setExamplePopups(prev => [...prev, { ...tile, isMinimized: false }]);
      setMinimizedExampleTiles(prev => prev.filter(t => t.id !== tileId));
    }
  };

  const removeExampleTile = (tileId) => {
    setMinimizedExampleTiles(prev => prev.filter(t => t.id !== tileId));
  };

  return (
    <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open-container' : ''}`}>
      {/* Left Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-toggle" onClick={toggleSidebar}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4H16V16H4V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 8H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {sidebarOpen && <div className="sidebar-brand">AlgoZen</div>}
        </div>

        <div className="sidebar-content">
          {sidebarOpen ? (
            <div className="sidebar-nav">
              <div
                className="sidebar-nav-item active"
                onClick={() => {
                  setMessages([]);
                  setCurrentChatId(null);
                  currentChatIdRef.current = null;
                  setOriginalProblem('');
                  setHasInitialResponse(false);
                  setInputValue('');
                  resetHintMode();
                  resetCodeGenMode();
                  resetDebugMode();
                }}
              >
                <div className="icon-circle orange">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <span>New chat</span>
              </div>
              <div className="sidebar-nav-item">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 3C6.13401 3 3 6.13401 3 10C3 13.866 6.13401 17 10 17C13.866 17 17 13.866 17 10C17 6.13401 13.866 3 10 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 7V10M10 13H10.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Recent Chats</span>
              </div>
              {chatHistory.length > 0 && (
                <div className="chat-history-list" style={{ marginLeft: "10px", marginTop: "5px", marginBottom: "15px", display: "flex", flexDirection: "column", gap: "5px" }}>
                  {chatHistory.map((chat) => (
                    <div
                      key={chat.id}
                      className={`sidebar-history-item ${currentChatId === chat.id ? 'active' : ''}`}
                      onClick={() => loadChat(chat)}
                      style={{
                        padding: "8px 12px",
                        fontSize: "0.85rem",
                        color: currentChatId === chat.id ? "#fff" : "#9ca3af",
                        background: currentChatId === chat.id ? "linear-gradient(90deg, rgba(255, 126, 95, 0.15) 0%, transparent 100%)" : "transparent",
                        borderLeft: currentChatId === chat.id ? "2px solid #ff7e5f" : "2px solid transparent",
                        cursor: "pointer",
                        borderRadius: "4px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        transition: "all 0.2s ease",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                      title={chat.title}
                    >
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{chat.title}</span>
                      <div
                        onClick={(e) => deleteChat(e, chat.id)}
                        style={{ padding: "0 4px", cursor: "pointer", opacity: 0.6 }}
                        title="Delete chat"
                        onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                        onMouseOut={(e) => e.currentTarget.style.opacity = 0.6}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="5" r="2" fill="currentColor" />
                          <circle cx="12" cy="12" r="2" fill="currentColor" />
                          <circle cx="12" cy="19" r="2" fill="currentColor" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="sidebar-icons-collapsed">
              <div className="sidebar-icon active">
                <div className="icon-circle orange">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <div className="sidebar-icon">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 3C6.13401 3 3 6.13401 3 10C3 13.866 6.13401 17 10 17C13.866 17 17 13.866 17 10C17 6.13401 13.866 3 10 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 7V10M10 13H10.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          {sidebarOpen ? (
            <div className="sidebar-user-profile" onClick={handleLogout} title="Log Out">
              <div className="avatar-circle">{getInitials(userName)}</div>
              <div className="user-info">
                <div className="user-name">{userName.toUpperCase()}</div>
                <div className="user-plan" style={{ color: '#ff7e5f' }}>Log Out</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </div>
          ) : (
            <div className="avatar-circle" onClick={handleLogout} title="Log Out" style={{ cursor: 'pointer' }}>
              {getInitials(userName)}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        {/* Top Bar */}
        <div className="dashboard-topbar">
          <div className="upgrade-banner">
            <span className="upgrade-text">Requests Left: {isPremium ? 'Unlimited' : credits}</span>
            <span className="upgrade-text" style={{ marginLeft: '10px', backgroundColor: 'rgba(255, 126, 95, 0.2)', color: '#ff7e5f' }}>{plan} Plan</span>
          </div>

        </div>

        {/* Welcome Section */}
        {messages.length === 0 && !hintQuestion && !codeGenQuestion && !debugQuestion && (
          <div className="dashboard-welcome">
            <div className="dashboard-brand">AlgoZen V5.3</div>
            <h1 className="welcome-heading">
              <span className="greeting-text">{greeting}, </span>
              <span className="user-name-text">{userName}!</span>
            </h1>
          </div>
        )}

        {/* Hint Mode UI */}
        {selectedMode === 'Hint Mode' && hintQuestion && (
          <div className="hint-mode-container">
            {/* Question Display */}
            <div className="hint-question-section">
              <div className="hint-question-label">Your Question</div>
              <div className="hint-question-text">{hintQuestion}</div>
            </div>

            {/* Revealed Hints */}
            {revealedHints.length > 0 && (
              <div className="revealed-hints-section">
                {revealedHints.map((hint, index) => (
                  <div key={index} className={`revealed-hint ${expandedHints[hint.type] ? 'expanded' : 'collapsed'}`}>
                    <div
                      className="hint-type-label hint-toggle"
                      onClick={() => toggleHintExpand(hint.type)}
                    >
                      <span className="hint-title-text">
                        {hint.type} - {hint.response.title}
                      </span>
                      {/* Show TC/SC preview when collapsed */}
                      {!expandedHints[hint.type] && (
                        <span className="hint-preview-badges">
                          <span className="preview-badge">TC: {hint.response.timeComplexity}</span>
                          <span className="preview-badge">SC: {hint.response.spaceComplexity}</span>
                        </span>
                      )}
                      <span className="hint-toggle-icon">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          className={expandedHints[hint.type] ? 'rotated' : ''}
                        >
                          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </div>
                    {expandedHints[hint.type] && (
                      <>
                        <div className="revealed-hint-meta">
                          <span className="meta-item">
                            <span className="meta-label">Data Structure:</span> {hint.response.dataStructure}
                          </span>
                          <span className="meta-item">
                            <span className="meta-label">TC:</span> {hint.response.timeComplexity}
                          </span>
                          <span className="meta-item">
                            <span className="meta-label">SC:</span> {hint.response.spaceComplexity}
                          </span>
                        </div>
                        <div className="hint-response">
                          <ReactMarkdown>{hint.response.description}</ReactMarkdown>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Revealed Hint Cards */}
            {revealedHintCards.length > 0 && (
              <div className="revealed-hint-cards-section">
                {revealedHintCards.map((hint, index) => (
                  <div key={index} className={`revealed-hint-card ${expandedHintCards[hint.type] ? 'expanded' : 'collapsed'}`}>
                    <div
                      className="hint-card-header hint-toggle"
                      onClick={() => toggleHintCardExpand(hint.type)}
                    >
                      <span className="hint-card-icon">{hint.response.icon}</span>
                      <span className="hint-card-title-text">
                        {hint.type} - {hint.response.title}
                      </span>
                      <span className="hint-toggle-icon">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          className={expandedHintCards[hint.type] ? 'rotated' : ''}
                        >
                          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </div>
                    {expandedHintCards[hint.type] && (
                      <div className="hint-card-content">
                        <ReactMarkdown>{hint.response.description}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Hint Cards Buttons */}
            {hintCardButtons.length > 0 && (
              <div className="hint-cards-section">
                <div className="hint-cards-label">Need a hint? Click to reveal:</div>
                <div className="hint-cards-grid">
                  {hintCardButtons.map((hintType) => {
                    const hintData = hintCardResponses[hintType];
                    return (
                      <button
                        key={hintType}
                        className="hint-card-button"
                        onClick={() => handleHintCardReveal(hintType)}
                      >
                        <span className="hint-card-btn-icon">{hintData.icon}</span>
                        <span className="hint-card-btn-text">{hintType}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Approach Cards */}
            {hintButtons.length > 0 && (
              <div className="hint-buttons-section">
                <div className="hint-buttons-label">Choose an approach to reveal:</div>
                <div className="approach-cards-container">
                  {hintButtons.map((hintType) => {
                    const approachData = hintResponses[hintType];
                    return (
                      <button
                        key={hintType}
                        className="approach-card"
                        onClick={() => handleHintReveal(hintType)}
                      >
                        <div className="approach-card-header">
                          <span className="approach-number">{hintType}</span>
                          <span className="approach-title">{approachData.title}</span>
                        </div>
                        <div className="approach-card-details">
                          <div className="approach-detail">
                            <span className="detail-label">Data Structure</span>
                            <span className="detail-value">{approachData.dataStructure}</span>
                          </div>
                          <div className="approach-detail">
                            <span className="detail-label">Time Complexity</span>
                            <span className="detail-value complexity-value">{approachData.timeComplexity}</span>
                          </div>
                          <div className="approach-detail">
                            <span className="detail-label">Space Complexity</span>
                            <span className="detail-value complexity-value">{approachData.spaceComplexity}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All hints revealed message */}
            {hintButtons.length === 0 && (
              <div className="all-hints-revealed">
                <span className="check-icon">✓</span>
                All approaches revealed! Good luck with your solution!
              </div>
            )}
          </div>
        )}

        {/* Code Generation Mode UI */}
        {selectedMode === 'Code Generation Mode' && codeGenQuestion && (
          <div className="code-gen-container">
            {/* Question Display */}
            <div className="code-gen-question-section">
              <div className="code-gen-question-label">Your Question</div>
              <div className="code-gen-question-text">{codeGenQuestion}</div>
            </div>

            {/* Code Box */}
            {isGeneratingCode ? (
              <div className="code-gen-loading">
                <div className="loading-spinner"></div>
                Generating {selectedLanguage} code...
              </div>
            ) : generatedApproaches.length > 0 && (
              <div className="code-gen-carousel-wrapper">
                {/* Left Arrow (External) */}
                <div className="code-nav-container external">
                  {currentApproachIndex > 0 ? (
                    <button
                      className="code-nav-btn external-arrow"
                      onClick={() => setCurrentApproachIndex(prev => prev - 1)}
                      title="Previous Approach"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  ) : <div className="code-nav-placeholder external" />}
                </div>

                <div className="code-stack-container">
                  {generatedApproaches.map((approach, index) => {
                    let positionClass = 'hidden';
                    if (index === currentApproachIndex) positionClass = 'active';
                    else if (index === currentApproachIndex - 1) positionClass = 'prev';
                    else if (index === currentApproachIndex + 1) positionClass = 'next';

                    return (
                      <div key={index} className={`code-gen-code-box ${positionClass}`}>
                        <div className="code-gen-code-header">
                          {/* Title */}
                          <span className="code-header-title">
                            {approach.title} ({selectedLanguage})
                          </span>

                          {/* Copy Button */}
                          <button
                            className="code-copy-btn"
                            onClick={() => {
                              navigator.clipboard.writeText(approach.code);
                            }}
                            title="Copy code"
                            style={{ opacity: index === currentApproachIndex ? 1 : 0, pointerEvents: index === currentApproachIndex ? 'auto' : 'none' }}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M5.5 3.5H10.5C11.3284 3.5 12 4.17157 12 5V10C12 10.8284 11.3284 11.5 10.5 11.5H5.5C4.67157 11.5 4 10.8284 4 10V5C4 4.17157 4.67157 3.5 5.5 3.5Z" stroke="currentColor" strokeWidth="1.2" />
                              <path d="M2 6.5H1C0.447715 6.5 0 6.94772 0 7.5V13C0 13.5523 0.447715 14 1 14H6.5C7.05228 14 7.5 13.5523 7.5 13V12" stroke="currentColor" strokeWidth="1.2" />
                            </svg>
                            Copy
                          </button>
                        </div>

                        {index === currentApproachIndex ? (
                          <SyntaxHighlighter
                            language={getLanguageForHighlighter(selectedLanguage)}
                            style={vscDarkPlus}
                            customStyle={{
                              margin: 0,
                              padding: '20px',
                              backgroundColor: '#2a2d2a',
                              fontSize: '14px',
                              borderRadius: '0 0 12px 12px',
                            }}
                            showLineNumbers={true}
                            wrapLines={true}
                            lineNumberStyle={{
                              color: '#697098',
                              fontSize: '13px',
                              paddingRight: '16px',
                              minWidth: '2.5em',
                            }}
                          >
                            {approach.code.replace(/\\n/g, '\n')}
                          </SyntaxHighlighter>
                        ) : (
                          <div className="code-preview-body"></div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Right Arrow (External) */}
                <div className="code-nav-container external">
                  {currentApproachIndex < generatedApproaches.length - 1 ? (
                    <button
                      className="code-nav-btn external-arrow"
                      onClick={() => setCurrentApproachIndex(prev => prev + 1)}
                      title="Next Approach"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  ) : <div className="code-nav-placeholder external" />}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Debugging Mode UI */}
        {selectedMode === 'Debugging Mode' && debugQuestion && (
          <div className="debug-mode-container">
            {/* Question Display */}
            <div className="debug-question-section">
              <div className="debug-question-label">Your Code</div>
              <div className="debug-question-text">{debugQuestion}</div>
            </div>

            {/* Loading State */}
            {isDebugging ? (
              <div className="debug-loading">
                <div className="loading-spinner"></div>
                Analyzing your code for errors...
              </div>
            ) : debugResponse && (
              <div className="debug-response-container">
                {/* Check if there are any errors */}
                {debugResponse.errors.length === 0 ? (
                  // Zero Errors - Single Window with Success Message
                  <div className="debug-no-errors-container">
                    <div className="debug-window success-window">
                      <div className="debug-window-header success-header">
                        <span className="debug-window-title">Your Code Analysis</span>
                        <span className="success-badge">✓ No Errors Found</span>
                      </div>
                      <div className="debug-success-message">
                        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="32" cy="32" r="28" stroke="#5fff7f" strokeWidth="4" fill="rgba(95, 255, 127, 0.1)" />
                          <path d="M20 32L28 40L44 24" stroke="#5fff7f" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <h3>Great Job! Your Code is Error-Free</h3>
                        <p>No syntax errors, logical errors, or bugs were detected in your code.</p>
                      </div>
                      <div className="debug-code-container">
                        <SyntaxHighlighter
                          language={detectLanguage(debugResponse.userCode)}
                          style={vscDarkPlus}
                          customStyle={{
                            margin: 0,
                            padding: '20px',
                            backgroundColor: '#2a2d2a',
                            fontSize: '14px',
                            borderRadius: '0 0 12px 12px',
                          }}
                          showLineNumbers={true}
                          wrapLines={true}
                          lineNumberStyle={{
                            color: '#697098',
                            fontSize: '13px',
                            paddingRight: '16px',
                            minWidth: '2.5em',
                          }}
                        >
                          {debugResponse.userCode}
                        </SyntaxHighlighter>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Errors Found - Dual Window Layout
                  <>
                    {/* Dual Window Layout */}
                    <div className="debug-windows-wrapper">
                      {/* Left Window - User's Code with Errors */}
                      <div className="debug-window user-code-window">
                        <div className="debug-window-header error-header">
                          <span className="debug-window-title">Your Code (with errors)</span>
                          <span className="error-count">{debugResponse.errors.length} errors found</span>
                        </div>
                        <div className="debug-code-container">
                          <SyntaxHighlighter
                            language={detectLanguage(debugResponse.userCode)}
                            style={vscDarkPlus}
                            customStyle={{
                              margin: 0,
                              padding: '20px',
                              backgroundColor: '#2a2d2a',
                              fontSize: '14px',
                              borderRadius: '0 0 12px 12px',
                            }}
                            showLineNumbers={true}
                            wrapLines={true}
                            lineNumberStyle={{
                              color: '#697098',
                              fontSize: '13px',
                              paddingRight: '16px',
                              minWidth: '2.5em',
                            }}
                            lineProps={(lineNumber) => {
                              const hasError = debugResponse.errors.find(err => err.line === lineNumber);
                              const errorIndex = debugResponse.errors.findIndex(err => err.line === lineNumber);

                              return {
                                style: {
                                  backgroundColor: hasError ? 'rgba(255, 95, 95, 0.15)' : 'transparent',
                                  borderLeft: hasError ? '3px solid #ff5f5f' : 'none',
                                  paddingLeft: hasError ? '8px' : '0',
                                  display: 'block',
                                  position: 'relative',
                                },
                                'data-error-number': hasError ? errorIndex + 1 : null,
                                className: hasError ? 'error-line' : ''
                              };
                            }}
                          >
                            {debugResponse.userCode}
                          </SyntaxHighlighter>
                        </div>
                      </div>

                      {/* Right Window - Corrected Code */}
                      <div className="debug-window corrected-code-window">
                        <div className="debug-window-header success-header">
                          <span className="debug-window-title">Corrected Code</span>
                          <span className="success-badge">✓ Fixed</span>
                        </div>
                        <div className="debug-code-container">
                          <SyntaxHighlighter
                            language={detectLanguage(debugResponse.correctedCode)}
                            style={vscDarkPlus}
                            customStyle={{
                              margin: 0,
                              padding: '20px',
                              backgroundColor: '#2a2d2a',
                              fontSize: '14px',
                              borderRadius: '0 0 12px 12px',
                            }}
                            showLineNumbers={true}
                            wrapLines={true}
                            lineNumberStyle={{
                              color: '#697098',
                              fontSize: '13px',
                              paddingRight: '16px',
                              minWidth: '2.5em',
                            }}
                            lineProps={(lineNumber) => {
                              const hasCorrection = debugResponse.errors.find(err => err.line === lineNumber);

                              return {
                                style: {
                                  backgroundColor: hasCorrection ? 'rgba(95, 255, 127, 0.15)' : 'transparent',
                                  borderLeft: hasCorrection ? '3px solid #5fff7f' : 'none',
                                  paddingLeft: hasCorrection ? '8px' : '0',
                                  display: 'block',
                                },
                                className: hasCorrection ? 'corrected-line' : ''
                              };
                            }}
                          >
                            {debugResponse.correctedCode}
                          </SyntaxHighlighter>
                        </div>
                      </div>
                    </div>

                    {/* Error Explanations */}
                    <div className="debug-errors-section">
                      <div
                        className="debug-errors-header"
                        onClick={() => setIsErrorsExpanded(!isErrorsExpanded)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="10" cy="10" r="8" stroke="#ff5f5f" strokeWidth="2" />
                            <path d="M10 6V10M10 14H10.01" stroke="#ff5f5f" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                          <span>Error Explanations</span>
                        </div>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{
                            transform: isErrorsExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s ease'
                          }}
                        >
                          <path d="M6 9L12 15L18 9" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>

                      {isErrorsExpanded && (
                        <div className="debug-errors-list">
                          {debugResponse.errors.map((error, index) => (
                            <div key={index} className="debug-error-item">
                              <div className="error-number-badge">{index + 1}</div>
                              <div className="error-details">
                                <div className="error-line-info">Line {error.line}</div>
                                <div className="error-message">{error.message}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Interactive Concept Visualization */}
                    {debugResponse.visualization && (
                      <div className="debug-visualization-section">
                        <div className="visualization-header">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 17L12 22L22 17" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 12L12 17L22 12" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <div className="visualization-header-text">
                            <span className="visualization-title">{debugResponse.visualization.title}</span>
                            <span className="visualization-concept">{debugResponse.visualization.concept}</span>
                          </div>
                        </div>
                        <div className="visualization-description">
                          {debugResponse.visualization.description}
                        </div>
                        <div className="visualization-content">
                          <VizEngine data={debugResponse.visualization} />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Messages Area */}
        {
          messages.length > 0 && selectedMode !== 'Hint Mode' && selectedMode !== 'Code Generation Mode' && selectedMode !== 'Debugging Mode' && (
            <div className="messages-container">
              {messages.map((message, index) => {
                if (message.type === 'user') {
                  // Find the corresponding AI response
                  const aiResponse = messages[index + 1];
                  return (
                    <div key={message.id} className="conversation-turn">
                      {/* User Query */}
                      <div className="user-query">
                        <div className="query-avatar">{getInitials(userName)}</div>
                        <div className="query-text">{message.text}</div>
                      </div>

                      {/* AI Response */}
                      {aiResponse && aiResponse.type === 'ai' && (
                        <div className="ai-response">
                          <div className="response-content">
                            <div className="response-text markdown-content">
                              <AIResponseContent text={aiResponse.text} messageId={aiResponse.id} />
                            </div>
                          </div>
                          <div className="response-footer">
                            <div className="response-disclaimer">
                              AlgoZen can make mistakes. Please double-check responses.
                            </div>
                            <div className="response-actions">
                              <button className="action-btn" title="Copy">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M5.5 3.5H10.5C11.3284 3.5 12 4.17157 12 5V10C12 10.8284 11.3284 11.5 10.5 11.5H5.5C4.67157 11.5 4 10.8284 4 10V5C4 4.17157 4.67157 3.5 5.5 3.5Z" stroke="currentColor" strokeWidth="1.2" />
                                  <path d="M2 6.5H1C0.447715 6.5 0 6.94772 0 7.5V13C0 13.5523 0.447715 14 1 14H6.5C7.05228 14 7.5 13.5523 7.5 13V12" stroke="currentColor" strokeWidth="1.2" />
                                </svg>
                              </button>
                              <button className="action-btn" title="Thumbs up">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M8 14V8M8 8V4C8 3.44772 8.44772 3 9 3H10C10.5523 3 11 3.44772 11 4V8M8 8H4C3.44772 8 3 8.44772 3 9V12C3 12.5523 3.44772 13 4 13H11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </button>
                              <button className="action-btn" title="Thumbs down">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M8 2V8M8 8V12C8 12.5523 7.55228 13 7 13H6C5.44772 13 5 12.5523 5 12V8M8 8H12C12.5523 8 13 7.55228 13 7V4C13 3.44772 12.5523 3 12 3H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </button>
                              <button className="action-btn" title="Regenerate">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M2 8C2 10.2091 3.79086 12 6 12H12M12 12L10 10M12 12L10 14M14 8C14 5.79086 12.2091 4 10 4H4M4 4L6 2M4 4L6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
                return null; // AI messages are rendered with their user message
              })}

              {/* Loading Indicator */}
              {isSearching && (
                <div className="ai-response">
                  <div className="response-content">
                    <div className="response-text markdown-content" style={{ fontStyle: 'italic', opacity: 0.7 }}>
                      🔍 Searching the web for relevant context...
                    </div>
                  </div>
                </div>
              )}
              {isLoading && !isSearching && (
                <div className="ai-response">
                  <div className="response-content">
                    <div className="response-text markdown-content" style={{ fontStyle: 'italic', opacity: 0.7 }}>
                      🤔 Analyzing your problem and generating explanation...
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        }

        {/* First Input Area - Only show before first response (or before hint question or code gen question or debug question) */}
        {
          !messages.some(msg => msg.type === 'ai') && !hintQuestion && !codeGenQuestion && !debugQuestion && (
            <div className="dashboard-input-area">
              <div className="input-container input-container-top-button">
                <form onSubmit={handleSubmit}>
                  <textarea
                    className="dashboard-input"
                    placeholder={selectedMode === 'Debugging Mode' ? 'Paste your code here for debugging' : 'Type or Paste your question here'}
                    rows="3"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                  <div className="input-footer">
                    <div className="input-footer-left"></div>
                    <div className="input-footer-right">
                      <select
                        className="model-selector"
                        value={selectedMode}
                        onChange={(e) => {
                          const newMode = e.target.value;
                          setSelectedMode(newMode);

                          // Reset states when switching modes
                          setHasInitialResponse(false);
                          setMessages([]);
                          setInputValue('');

                          if (newMode !== 'Hint Mode') {
                            resetHintMode();
                          }
                        }}
                      >
                        <option>Explanation Mode</option>
                        <option>Hint Mode</option>
                        <option>Debugging Mode</option>
                        <option>Code Generation Mode</option>
                        <option>Teach Me Concept Mode</option>
                      </select>
                      {selectedMode === 'Code Generation Mode' && (
                        <select
                          className="model-selector language-selector"
                          value={selectedLanguage}
                          onChange={(e) => setSelectedLanguage(e.target.value)}
                        >
                          <option>Python</option>
                          <option>C++</option>
                          <option>Java</option>
                          <option>JavaScript</option>
                        </select>
                      )}
                      <button type="submit" className="send-button">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 10L17 3L11 17L9 10L3 10Z" fill="#FF7E5F" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )
        }

        {/* Mode Switcher */}
        <div className="dashboard-mode-switcher-container">
          <div className="mode-capsule">
            <div className="mode-option active">Solving Mode</div>
            <div className="mode-divider"></div>
            <div
              className="mode-option"
              onClick={() => navigate('/interview-dashboard')}
            >
              Interview Mode
            </div>
          </div>
        </div>

        {/* Second Input Area - Bottom - Only show after first response (or after hint question or code gen question or debug question) */}
        {
          (messages.some(msg => msg.type === 'ai') || hintQuestion || codeGenQuestion || debugQuestion) && (
            <div className="dashboard-input-area dashboard-input-bottom">
              <div className="input-container" style={{ position: 'relative' }}>
                {/* @ Mention Dropdown for Hint Mode */}
                {selectedMode === 'Hint Mode' && showHintMentionDropdown && getFilteredHints().length > 0 && (
                  <div className="hint-mention-dropdown">
                    <div className="hint-mention-header">Reference a Hint or Method:</div>
                    {getFilteredHints().map((hint) => (
                      <div
                        key={hint.type}
                        className={`hint-mention-item hint-mention-${hint.type.toLowerCase()}`}
                        onClick={() => insertHintMention(hint.type)}
                      >
                        <span className="hint-mention-icon">@</span>
                        <span className="hint-mention-type">{hint.type}</span>
                      </div>
                    ))}
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <textarea
                    ref={secondInputRef}
                    className="dashboard-input"
                    placeholder={selectedMode === 'Hint Mode' && (revealedHints.length > 0 || revealedHintCards.length > 0)
                      ? "Type @ to mention a hint, then ask your doubt or request an example!"
                      : "Ask Me any doubt related to this response!"}
                    rows="3"
                    value={inputValue}
                    onChange={selectedMode === 'Hint Mode' ? handleHintInputChange : (e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                      // Close dropdown on Escape
                      if (e.key === 'Escape') {
                        setShowHintMentionDropdown(false);
                      }
                    }}
                  />
                  <div className="input-footer">
                    <div className="input-footer-left">
                      <button className="input-icon-btn">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                      <button className="input-icon-btn">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button className="input-icon-btn">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M8 4V8L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                    <div className="input-footer-right">
                      <select
                        className="model-selector"
                        value={selectedMode}
                        onChange={(e) => {
                          setSelectedMode(e.target.value);
                          if (e.target.value !== 'Hint Mode') {
                            resetHintMode();
                          }
                        }}
                      >
                        <option>Explanation Mode</option>
                        <option>Hint Mode</option>
                        <option>Debugging Mode</option>
                        <option>Code Generation Mode</option>
                        <option>Teach Me Concept Mode</option>
                      </select>
                      <button type="submit" className="send-button">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 10L17 3L11 17L9 10L3 10Z" fill="#FF7E5F" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )
        }
      </main >

      {/* Doubt Popups */}
      {
        doubtPopups.map((popup) => (
          <div
            key={popup.id}
            className="doubt-popup"
            style={{
              left: `${popup.position.x}px`,
              top: `${popup.position.y}px`,
              width: `${popup.size.width}px`,
              height: `${popup.size.height}px`
            }}
          >
            <div className="popup-header"
              onMouseDown={(e) => {
                if (e.target.closest('.popup-control-btn')) return;

                e.preventDefault();
                const startX = e.clientX - popup.position.x;
                const startY = e.clientY - popup.position.y;

                const handleMouseMove = (moveEvent) => {
                  const newX = moveEvent.clientX - startX;
                  const newY = moveEvent.clientY - startY;

                  setDoubtPopups(prev => prev.map(p =>
                    p.id === popup.id
                      ? { ...p, position: { x: newX, y: newY } }
                      : p
                  ));
                };

                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            >
              <div className="popup-title">Doubt {popup.doubtNumber}</div>
              <div className="popup-controls">
                <button
                  className="popup-control-btn"
                  onClick={() => minimizePopup(popup.id)}
                  title="Minimize"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
                <button
                  className="popup-control-btn"
                  onClick={() => closePopup(popup.id)}
                  title="Close"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="popup-content">
              <div className="popup-question">
                <div className="popup-label">Your Doubt:</div>
                <div className="popup-question-text">{popup.question}</div>
              </div>
              <div className="popup-answer">
                <div className="popup-label">Answer:</div>
                {popup.answer ? (
                  <div className="popup-answer-text markdown-content">
                    <ReactMarkdown>{popup.answer}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="popup-loading">Thinking...</div>
                )}
              </div>
            </div>
            <div
              className="popup-resize-handle"
              onMouseDown={(e) => {
                e.preventDefault();
                const startX = e.clientX;
                const startY = e.clientY;
                const startWidth = popup.size.width;
                const startHeight = popup.size.height;

                const handleMouseMove = (moveEvent) => {
                  const newWidth = Math.max(400, startWidth + (moveEvent.clientX - startX));
                  const newHeight = Math.max(300, startHeight + (moveEvent.clientY - startY));

                  setDoubtPopups(prev => prev.map(p =>
                    p.id === popup.id
                      ? { ...p, size: { width: newWidth, height: newHeight } }
                      : p
                  ));
                };

                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0L0 12" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 4L4 12" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 8L8 12" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
          </div>
        ))
      }

      {/* Example Popups */}
      {
        examplePopups.map((popup) => (
          <div
            key={popup.id}
            className="example-popup"
            style={{
              left: `${popup.position.x}px`,
              top: `${popup.position.y}px`,
              width: `${popup.size.width}px`,
              height: `${popup.size.height}px`
            }}
          >
            <div className="popup-header"
              onMouseDown={(e) => {
                if (e.target.closest('.popup-control-btn')) return;

                e.preventDefault();
                const startX = e.clientX - popup.position.x;
                const startY = e.clientY - popup.position.y;

                const handleMouseMove = (moveEvent) => {
                  const newX = moveEvent.clientX - startX;
                  const newY = moveEvent.clientY - startY;

                  setExamplePopups(prev => prev.map(p =>
                    p.id === popup.id
                      ? { ...p, position: { x: newX, y: newY } }
                      : p
                  ));
                };

                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            >
              <div className="popup-title">Example {popup.exampleNumber}</div>
              <div className="popup-controls">
                <button
                  className="popup-control-btn"
                  onClick={() => minimizeExamplePopup(popup.id)}
                  title="Minimize"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
                <button
                  className="popup-control-btn"
                  onClick={() => closeExamplePopup(popup.id)}
                  title="Close"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="popup-content">
              <div className="popup-question">
                <div className="popup-label">Your Request:</div>
                <div className="popup-question-text">{popup.question}</div>
              </div>
              <div className="popup-answer">
                <div className="popup-label">Examples:</div>
                {popup.answer ? (
                  <div className="popup-answer-text markdown-content">
                    <ReactMarkdown>{popup.answer}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="popup-loading">Generating examples...</div>
                )}
              </div>
            </div>
            <div
              className="popup-resize-handle"
              onMouseDown={(e) => {
                e.preventDefault();
                const startX = e.clientX;
                const startY = e.clientY;
                const startWidth = popup.size.width;
                const startHeight = popup.size.height;

                const handleMouseMove = (moveEvent) => {
                  const newWidth = Math.max(400, startWidth + (moveEvent.clientX - startX));
                  const newHeight = Math.max(300, startHeight + (moveEvent.clientY - startY));

                  setExamplePopups(prev => prev.map(p =>
                    p.id === popup.id
                      ? { ...p, size: { width: newWidth, height: newHeight } }
                      : p
                  ));
                };

                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0L0 12" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 4L4 12" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 8L8 12" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
          </div>
        ))
      }

      {/* Minimized Tiles Panel */}
      {
        minimizedTiles.length > 0 && (
          <div className="minimized-tiles-panel">
            <div className="tiles-header">Minimized Doubts</div>
            <div className="tiles-container">
              {minimizedTiles.map((tile) => (
                <div key={tile.id} className="minimized-tile">
                  <div className="tile-content" onClick={() => restorePopup(tile.id)}>
                    <div className="tile-label">Doubt {tile.doubtNumber}</div>
                    <div className="tile-question">{tile.question.substring(0, 40)}...</div>
                  </div>
                  <button
                    className="tile-close-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTile(tile.id);
                    }}
                    title="Remove"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      }

      {/* Minimized Example Tiles Panel */}
      {
        minimizedExampleTiles.length > 0 && (
          <div className="minimized-example-tiles-panel">
            <div className="tiles-header">Minimized Examples</div>
            <div className="tiles-container">
              {minimizedExampleTiles.map((tile) => (
                <div key={tile.id} className="minimized-tile">
                  <div className="tile-content" onClick={() => restoreExamplePopup(tile.id)}>
                    <div className="tile-label">Example {tile.exampleNumber}</div>
                    <div className="tile-question">{tile.question.substring(0, 40)}...</div>
                  </div>
                  <button
                    className="tile-close-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeExampleTile(tile.id);
                    }}
                    title="Remove"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      }

      {/* Delete Confirmation Modal */}
      {chatToDelete && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <div className="delete-modal-header">
              <h3>Delete Chat</h3>
              <button className="close-modal-btn" onClick={cancelDeleteChat}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="delete-modal-body">
              <p>Are you sure you want to delete this chat?</p>
              <p className="delete-modal-warning">This action cannot be undone.</p>
            </div>
            <div className="delete-modal-footer">
              <button className="delete-cancel-btn" onClick={cancelDeleteChat}>Cancel</button>
              <button className="delete-confirm-btn" onClick={confirmDeleteChat}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Insufficient Requests Modal */}
      {showCreditsModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <div className="delete-modal-header">
              <h3>Free Plan Limit Reached</h3>
              <button className="close-modal-btn" onClick={() => setShowCreditsModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="delete-modal-body">
              <p>You have exhausted your 10 free daily requests. Upgrade to Premium for unlimited access!</p>
              <p className="delete-modal-warning">
                Free requests renew in: {(() => {
                  const now = new Date();
                  const midnight = new Date(now);
                  midnight.setHours(24, 0, 0, 0);
                  const diffMs = midnight - now;
                  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                  return `${diffHours > 0 ? `${diffHours} hr ` : ''}${diffMinutes} min`;
                })()}
              </p>
            </div>
            <div className="delete-modal-footer">
              <button className="delete-cancel-btn" onClick={() => setShowCreditsModal(false)}>Close</button>
              <button className="delete-confirm-btn" onClick={() => {
                setShowCreditsModal(false);
                navigate('/pricing');
              }}>Go Premium</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;