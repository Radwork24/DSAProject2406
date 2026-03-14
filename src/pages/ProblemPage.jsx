import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { generateProblem, evaluateSubmission } from '../services/groqService';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import ReportModal from '../components/ReportModal';
import './ProblemPage.css';

const ProblemPage = () => {
    const { levelId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Extract topic from URL query parameters, default to 'Data Structures'
    const topic = searchParams.get('topic') || 'Data Structures';

    // State
    const [problem, setProblem] = useState(null);
    const [code, setCode] = useState('');
    const [activeTab, setActiveTab] = useState('Description');
    const [isRunning, setIsRunning] = useState(false); // For "Run" button
    const [isSubmitting, setIsSubmitting] = useState(false); // For "Submit" button
    const [submissionReport, setSubmissionReport] = useState(null);
    const [showReport, setShowReport] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('Java');
    const [showLangDropdown, setShowLangDropdown] = useState(false);
    const [userName, setUserName] = useState('User');

    // Helper function to get user initials
    const getInitials = (name) => {
        if (!name || name === 'User') return 'U';
        const parts = name.trim().split(' ');
        if (parts.length === 1) {
            return parts[0].charAt(0).toUpperCase();
        }
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    // Language-specific code templates
    const getCodeTemplate = (language, problemData = problem) => {
        // Use dynamic starter code if available and valid
        if (problemData?.starterCode && problemData.starterCode[language.toLowerCase()]) {
            return problemData.starterCode[language.toLowerCase()];
        } else if (problemData?.starterCode && problemData.starterCode[language]) {
            // Handle case sensitivity just in case
            return problemData.starterCode[language];
        }

        // Fallback templates (if AI doesn't provide proper starter code)
        const templates = {
            'Java': `/**
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
    public void solve() {
        // Your code here
        // Note: AI should provide specific function signature
    }
}`,
            'C++': `/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode() : val(0), left(nullptr), right(nullptr) {}
 *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
 * };
 */
class Solution {
public:
    void solve() {
        // Your code here
        // Note: AI should provide specific function signature
    }
};`,
            'C#': `/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     public int val;
 *     public ListNode next;
 *     public ListNode(int val=0, ListNode next=null) {
 *         this.val = val;
 *         this.next = next;
 *     }
 * }
 */
public class Solution {
    public void Solve() {
        // Your code here
        // Note: AI should provide specific function signature
    }
}`,
            'JavaScript': `/**
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
var solve = function(head) {
    // Your code here
    // Note: AI should provide specific function signature
};`,
            'Python': `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next

class Solution:
    def solve(self, head: Optional[ListNode]) -> ListNode:
        # Your code here
        # Note: AI should provide specific function signature
        pass`
        };
        return templates[language] || templates['Java'];
    };

    // Fetch Problem on Mount
    useEffect(() => {
        const loadProblem = async () => {
            // Show loading state or placeholder if needed
            // For now, we wait for the AI
            const data = await generateProblem(topic, parseInt(levelId) || 1);
            if (data) {
                setProblem(data);
                // Reset code when problem changes
                // Pass data explicitly because setProblem state update is not immediate
                setCode(getCodeTemplate(selectedLanguage, data));
            }
        };

        loadProblem();
    }, [levelId, topic]);

    // Fetch user name from Firebase
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists() && docSnap.data().name) {
                        setUserName(docSnap.data().name);
                    } else if (user.displayName) {
                        setUserName(user.displayName);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    if (user.displayName) setUserName(user.displayName);
                }
            } else {
                setUserName('User');
            }
        });

        return () => unsubscribe();
    }, []);

    const handleRun = () => {
        setIsRunning(true);
        // "Run" just simulates a quick check for syntax or basic output
        // We can use the same evaluate function but maybe suppress the full report
        // For now, let's keep it as a simulation or a "Quick Test"
        setTimeout(() => {
            setIsRunning(false);
            alert("Code Compiled Successfully! (Click Submit for full analysis)");
        }, 1000);
    };

    const handleSubmit = async () => {
        if (!problem || !code) return;

        setIsSubmitting(true);
        const report = await evaluateSubmission(code, problem, selectedLanguage);
        setSubmissionReport(report);
        setShowReport(true);
        setIsSubmitting(false);
    };

    const handleLanguageChange = (lang) => {
        setSelectedLanguage(lang);
        setCode(getCodeTemplate(lang, problem));
        setShowLangDropdown(false);
    };

    // Auto-indentation handler
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();

            const textarea = e.target;
            const cursorPosition = textarea.selectionStart;
            const textBeforeCursor = code.substring(0, cursorPosition);
            const textAfterCursor = code.substring(cursorPosition);

            // Find the current line
            const lines = textBeforeCursor.split('\n');
            const currentLine = lines[lines.length - 1];

            // Calculate indentation (count leading spaces/tabs)
            const indentMatch = currentLine.match(/^[\s\t]*/);
            let indent = indentMatch ? indentMatch[0] : '';

            // Check if the current line ends with an opening brace, colon (Python), or other block starters
            const trimmedLine = currentLine.trim();
            const shouldAddExtraIndent =
                trimmedLine.endsWith('{') ||
                trimmedLine.endsWith(':') ||
                trimmedLine.endsWith('(') ||
                trimmedLine.endsWith('[');

            // Determine tab/space based on selected language
            const tabChar = selectedLanguage === 'Python' ? '    ' : '    '; // 4 spaces

            if (shouldAddExtraIndent) {
                indent += tabChar;
            }

            // Insert newline with indentation
            const newCode = textBeforeCursor + '\n' + indent + textAfterCursor;
            setCode(newCode);

            // Set cursor position after the indentation
            setTimeout(() => {
                const newCursorPosition = cursorPosition + 1 + indent.length;
                textarea.setSelectionRange(newCursorPosition, newCursorPosition);
            }, 0);
        } else if (e.key === 'Tab') {
            e.preventDefault();

            const textarea = e.target;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;

            const tabChar = '    '; // 4 spaces

            // Insert tab at cursor position
            const newCode = code.substring(0, start) + tabChar + code.substring(end);
            setCode(newCode);

            // Move cursor after the tab
            setTimeout(() => {
                textarea.setSelectionRange(start + tabChar.length, start + tabChar.length);
            }, 0);
        }
    };

    const handleNextLevel = () => {
        setShowReport(false);
        const nextLevel = parseInt(levelId) + 1;
        const encodedTopic = encodeURIComponent(topic);
        navigate(`/level/${nextLevel}?topic=${encodedTopic}`);
    };

    // Dummy line numbers
    const lines = (code || '').split('\n').map((_, i) => i + 1);

    if (!problem) {
        return (
            <div className="problem-page-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="loader-spinner" style={{ margin: '0 auto 20px' }}></div>
                    <h2>Generating Challenge for Level {levelId}...</h2>
                    <p style={{ color: '#888' }}>Consulting the AI Architect...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="problem-page-container">
            {/* Navbar */}
            <div className="problem-navbar">
                <div className="nav-left">
                    <span className="nav-logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>ALGOZEN</span>
                    <div className="nav-items">
                        <span>{topic}</span>
                        <span>{'>'}</span>
                        <span>Level {levelId}</span>
                    </div>
                </div>
                <div className="nav-right">
                    <button className="nav-btn" onClick={() => setCode(getCodeTemplate(selectedLanguage))}>Reset Code</button>
                    <div className="profile-icon">{getInitials(userName)}</div>
                </div>
            </div>

            {/* Main Content Split */}
            <div className="problem-main-content">
                {/* LEFT PANEL: Description */}
                <div className="left-panel">
                    <div className="panel-header">
                        <div className={`tab ${activeTab === 'Description' ? 'active' : ''}`}>Description</div>
                        <div className="tab">Editorial</div>
                        <div className="tab">Solutions</div>
                    </div>

                    <div className="problem-content">
                        <h2 className="problem-title">{problem.id}. {problem.title}</h2>
                        <div className="problem-meta">
                            <span className="difficulty-badge" style={{
                                color: problem.difficulty === 'Easy' ? '#00b8a3' : (problem.difficulty === 'Medium' ? '#ffc01e' : '#ff375f'),
                                background: problem.difficulty === 'Easy' ? 'rgba(0, 184, 163, 0.1)' : (problem.difficulty === 'Medium' ? 'rgba(255, 192, 30, 0.1)' : 'rgba(255, 55, 95, 0.1)')
                            }}>
                                {problem.difficulty}
                            </span>
                            <div className="meta-tags">
                                <span>{topic}</span>
                                <span>Data Structures</span>
                            </div>
                        </div>

                        <div className="problem-text">
                            {/* Render HTML description safely */}
                            <div dangerouslySetInnerHTML={{ __html: problem.description }} />

                            {/* Examples */}
                            {problem.examples && problem.examples.map((ex, idx) => (
                                <div className="example-box" key={idx}>
                                    <div className="example-title">Example {idx + 1}:</div>
                                    <p><strong>Input:</strong> {ex.input}</p>
                                    <p><strong>Output:</strong> {ex.output}</p>
                                    {ex.explanation && <p><strong>Explanation:</strong> {ex.explanation}</p>}
                                </div>
                            ))}

                            {/* Constraints */}
                            {problem.constraints && (
                                <div className="constraints-section">
                                    <h4>Constraints:</h4>
                                    <ul>
                                        {problem.constraints.map((c, i) => <li key={i}>{c}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: Code & Console */}
                <div className="right-panel">
                    {/* Code Editor Section */}
                    <div className="code-section">
                        <div className="code-header">
                            <div className="lang-select" onClick={() => setShowLangDropdown(!showLangDropdown)}>
                                {selectedLanguage} ▼
                                {showLangDropdown && (
                                    <div className="lang-dropdown">
                                        <div className="lang-option" onClick={() => handleLanguageChange('Java')}>Java</div>
                                        <div className="lang-option" onClick={() => handleLanguageChange('C++')}>C++</div>
                                        <div className="lang-option" onClick={() => handleLanguageChange('C#')}>C#</div>
                                        <div className="lang-option" onClick={() => handleLanguageChange('JavaScript')}>JavaScript</div>
                                        <div className="lang-option" onClick={() => handleLanguageChange('Python')}>Python</div>
                                    </div>
                                )}
                            </div>
                            <div className="editor-settings">⚙️</div>
                        </div>
                        <div className="editor-container">
                            <div className="line-numbers">
                                {lines.map(l => <div key={l}>{l}</div>)}
                            </div>
                            <textarea
                                className="code-area"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                onKeyDown={handleKeyDown}
                                spellCheck="false"
                            />
                        </div>
                    </div>

                    {/* Console Section */}
                    <div className="console-section">
                        <div className="console-header">
                            <span>Console</span>
                        </div>
                        <div className="console-content">
                            {isRunning ? (
                                <div style={{ color: '#aaa' }}>Compiling...</div>
                            ) : isSubmitting ? (
                                <div style={{ color: '#aaa' }}>Analyzing your submission...</div>
                            ) : (
                                <p style={{ color: '#666' }}>Run or Submit your code to check results.</p>
                            )}
                        </div>
                        <div className="console-footer">
                            <button className="btn-action btn-run" onClick={handleRun} disabled={isRunning || isSubmitting}>Run</button>
                            <button className="btn-action btn-submit" onClick={handleSubmit} disabled={isRunning || isSubmitting}>
                                {isSubmitting ? 'Judging...' : 'Submit'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Modal */}
            {showReport && (
                <ReportModal
                    report={submissionReport}
                    onClose={() => setShowReport(false)}
                    onNext={handleNextLevel}
                />
            )}
        </div>
    );
};

export default ProblemPage;
