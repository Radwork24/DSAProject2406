import { useState } from 'react';
import './StringConcept.css';

function StringConcept() {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="concept-page">
            {/* Header */}
            <header className="concept-header">
                <div className="concept-header-content">
                    <div className="breadcrumb">
                        <a href="/dashboard">Dashboard</a>
                        <span className="breadcrumb-separator">/</span>
                        <span>Concepts</span>
                        <span className="breadcrumb-separator">/</span>
                        <span className="breadcrumb-current">String</span>
                    </div>
                    <h1 className="concept-title">String Data Structure</h1>
                    <p className="concept-subtitle">Essential sequence of characters used to represent text and perform text algorithms</p>
                </div>
            </header>

            {/* Navigation Tabs */}
            <nav className="concept-nav">
                <button
                    className={`concept-nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={`concept-nav-btn ${activeTab === 'operations' ? 'active' : ''}`}
                    onClick={() => setActiveTab('operations')}
                >
                    Operations
                </button>
                <button
                    className={`concept-nav-btn ${activeTab === 'complexity' ? 'active' : ''}`}
                    onClick={() => setActiveTab('complexity')}
                >
                    Time Complexity
                </button>
                <button
                    className={`concept-nav-btn ${activeTab === 'examples' ? 'active' : ''}`}
                    onClick={() => setActiveTab('examples')}
                >
                    Examples
                </button>
            </nav>

            {/* Content */}
            <main className="concept-content">
                {activeTab === 'overview' && (
                    <div className="concept-section">
                        <h2>What is a String?</h2>
                        <p>
                            A string is a sequence of characters used to represent text. Strings are
                            ubiquitous in programming — used for I/O, parsing, searching, and more.
                        </p>

                        <div className="concept-card">
                            <h3>Key Characteristics</h3>
                            <ul>
                                <li><strong>Sequence:</strong> Ordered characters indexed from 0</li>
                                <li><strong>Immutable vs Mutable:</strong> Some languages treat strings as immutable</li>
                                <li><strong>Common Operations:</strong> Concatenation, slicing, searching</li>
                                <li><strong>Storage:</strong> Stored as arrays of chars or bytes depending on encoding</li>
                            </ul>
                        </div>

                        <h3>Visual Representation</h3>
                        <div className="visual-example">
                            <div className="string-visualization">
                                <div className="char-cell">
                                    <div className="char-value">H</div>
                                    <div className="char-index">0</div>
                                </div>
                                <div className="char-cell">
                                    <div className="char-value">e</div>
                                    <div className="char-index">1</div>
                                </div>
                                <div className="char-cell">
                                    <div className="char-value">l</div>
                                    <div className="char-index">2</div>
                                </div>
                                <div className="char-cell">
                                    <div className="char-value">l</div>
                                    <div className="char-index">3</div>
                                </div>
                                <div className="char-cell">
                                    <div className="char-value">o</div>
                                    <div className="char-index">4</div>
                                </div>
                                <div className="char-cell">
                                    <div className="char-value">!</div>
                                    <div className="char-index">5</div>
                                </div>
                            </div>
                            <p className="visual-caption">String "Hello!" as indexed characters</p>
                        </div>

                        <h3>When to Use Strings?</h3>
                        <div className="concept-grid">
                            <div className="concept-card">
                                <h4>✓ Good For</h4>
                                <ul>
                                    <li>Text processing and formatting</li>
                                    <li>Pattern matching and parsing</li>
                                    <li>Storage of identifiers and tokens</li>
                                </ul>
                            </div>
                            <div className="concept-card">
                                <h4>✗ Not Ideal For</h4>
                                <ul>
                                    <li>Binary data requiring arbitrary byte operations</li>
                                    <li>Frequent in-place edits in languages with immutable strings</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'operations' && (
                    <div className="concept-section">
                        <h2>String Operations</h2>

                        <div className="operation-card">
                            <h3>1. Access (Read)</h3>
                            <p>Retrieve a character at a specific index.</p>
                            <div className="code-block">
                                <code>
{`// Java
String s = "hello";
char c = s.charAt(1); // 'e'

// C++
string s = "hello";
char c = s[1]; // 'e'`}
                                </code>
                            </div>
                            <p className="operation-note"><strong>Time Complexity:</strong> O(1)</p>
                        </div>

                        <div className="operation-card">
                            <h3>2. Concatenation</h3>
                            <p>Join two strings together.</p>
                            <div className="code-block">
                                <code>
{`// Java
String a = "Hello";
String b = "World";
String c = a + " " + b; // "Hello World"

// C++
string c = a + " " + b; // "Hello World"`}
                                </code>
                            </div>
                            <p className="operation-note"><strong>Time Complexity:</strong> O(n) (may copy characters)</p>
                        </div>

                        <div className="operation-card">
                            <h3>3. Search (Substring)</h3>
                            <p>Find a substring inside a string.</p>
                            <div className="code-block">
                                <code>
{`// Java
int idx = "hello world".indexOf("world"); // 6

// C++
size_t pos = string("hello world").find("world"); // 6`}
                                </code>
                            </div>
                            <p className="operation-note"><strong>Time Complexity:</strong> O(n*m) naive, O(n + m) with KMP</p>
                        </div>

                        <div className="operation-card">
                            <h3>4. Reverse</h3>
                            <p>Reverse the characters in a string.</p>
                            <div className="code-block">
                                <code>
{`// Java
StringBuilder sb = new StringBuilder("hello");
sb.reverse().toString(); // "olleh"

// C++
reverse(s.begin(), s.end()); // in-place`}
                                </code>
                            </div>
                            <p className="operation-note"><strong>Time Complexity:</strong> O(n)</p>
                        </div>
                    </div>
                )}

                {activeTab === 'complexity' && (
                    <div className="concept-section">
                        <h2>Time & Space Complexity</h2>

                        <div className="complexity-table-wrapper">
                            <table className="complexity-table">
                                <thead>
                                    <tr>
                                        <th>Operation</th>
                                        <th>Average Case</th>
                                        <th>Worst Case</th>
                                        <th>Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><strong>Access</strong></td>
                                        <td className="complexity-good">O(1)</td>
                                        <td className="complexity-good">O(1)</td>
                                        <td>Index-based char access</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Concatenation</strong></td>
                                        <td className="complexity-bad">O(n)</td>
                                        <td className="complexity-bad">O(n)</td>
                                        <td>May require copying characters</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Search (naive)</strong></td>
                                        <td className="complexity-bad">O(n*m)</td>
                                        <td className="complexity-bad">O(n*m)</td>
                                        <td>Naive substring search</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Search (KMP)</strong></td>
                                        <td className="complexity-good">O(n + m)</td>
                                        <td className="complexity-good">O(n + m)</td>
                                        <td>Linear-time pattern matching</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="concept-card">
                            <h3>Space Complexity</h3>
                            <p><strong>O(n)</strong> - storing characters or creating new strings when copying</p>
                        </div>
                    </div>
                )}

                {activeTab === 'examples' && (
                    <div className="concept-section">
                        <h2>Common String Problems</h2>

                        <div className="example-card">
                            <h3>1. Reverse String</h3>
                            <p className="example-description">Reverse the characters in a string.</p>
                            <div className="code-block">
                                <code>
{`// Java
public String reverse(String s) {
    return new StringBuilder(s).reverse().toString();
}

// C++
string reverse(string s) {
    reverse(s.begin(), s.end());
    return s;
}`}
                                </code>
                            </div>
                            <p className="example-complexity"><strong>Time:</strong> O(n) | <strong>Space:</strong> O(1) or O(n) depending on mutability</p>
                        </div>

                        <div className="example-card">
                            <h3>2. Palindrome Check</h3>
                            <p className="example-description">Check if a string reads the same forwards and backwards.</p>
                            <div className="code-block">
                                <code>
{`// Java
public boolean isPalindrome(String s) {
    int i = 0, j = s.length() - 1;
    while (i < j) {
        if (s.charAt(i++) != s.charAt(j--)) return false;
    }
    return true;
}

// C++
bool isPalindrome(const string &s) {
    int i = 0, j = s.size() - 1;
    while (i < j) if (s[i++] != s[j--]) return false;
    return true;
}`}
                                </code>
                            </div>
                            <p className="example-complexity"><strong>Time:</strong> O(n) | <strong>Space:</strong> O(1)</p>
                        </div>

                        <div className="example-card">
                            <h3>3. Substring Search (KMP)</h3>
                            <p className="example-description">Efficiently find a pattern inside a text using prefix function.</p>
                            <div className="code-block">
                                <code>
{`// Java
// Use String.indexOf for production; KMP provides O(n+m) guarantees

// C++
// Use std::string::find or KMP for linear worst-case`}
                                </code>
                            </div>
                            <p className="example-complexity"><strong>Time:</strong> O(n + m) | <strong>Space:</strong> O(m)</p>
                        </div>

                        <div className="concept-card">
                            <h3>Real-World Applications</h3>
                            <ul>
                                <li><strong>Text editors:</strong> Cursor movement, search/replace</li>
                                <li><strong>Compilers:</strong> Tokenization and parsing</li>
                                <li><strong>Databases:</strong> String keys and pattern queries</li>
                                <li><strong>Networking:</strong> Protocol parsing and encoding</li>
                            </ul>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default StringConcept;
