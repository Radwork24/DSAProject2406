import { useState } from 'react';
import './StackConcept.css';

function StackConcept() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="concept-page">
      <header className="concept-header">
        <div className="concept-header-content">
          <div className="breadcrumb">
            <a href="/dashboard">Dashboard</a>
            <span className="breadcrumb-separator">/</span>
            <span>Concepts</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Stack</span>
          </div>
          <h1 className="concept-title">Stack Data Structure</h1>
          <p className="concept-subtitle">LIFO structure — Last In, First Out. Useful for undo, recursion, and expression evaluation.</p>
        </div>
      </header>

      <nav className="concept-nav">
        <button className={`concept-nav-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={`concept-nav-btn ${activeTab === 'operations' ? 'active' : ''}`} onClick={() => setActiveTab('operations')}>Operations</button>
        <button className={`concept-nav-btn ${activeTab === 'complexity' ? 'active' : ''}`} onClick={() => setActiveTab('complexity')}>Time Complexity</button>
        <button className={`concept-nav-btn ${activeTab === 'examples' ? 'active' : ''}`} onClick={() => setActiveTab('examples')}>Examples</button>
      </nav>

      <main className="concept-content">
        {activeTab === 'overview' && (
          <div className="concept-section">
            <h2>What is a Stack?</h2>
            <p>A stack stores elements in a Last-In-First-Out (LIFO) order. Elements are pushed to the top and popped from the top.</p>

            <div className="concept-card">
              <h3>Key Characteristics</h3>
              <ul>
                <li><strong>LIFO:</strong> Last element added is first removed</li>
                <li><strong>Operations:</strong> push, pop, peek, isEmpty</li>
                <li><strong>Implementations:</strong> Arrays, linked lists, dynamic arrays</li>
              </ul>
            </div>

            <h3>Visual Representation</h3>
            <div className="visual-example">
              <div className="stack-visualization">
                <div className="stack-node">Top (5)</div>
                <div className="stack-node">4</div>
                <div className="stack-node">3</div>
                <div className="stack-node">2</div>
                <div className="stack-node">Bottom (1)</div>
              </div>
              <p className="visual-caption">A stack with elements [1,2,3,4,5] (5 is top)</p>
            </div>
          </div>
        )}

        {activeTab === 'operations' && (
          <div className="concept-section">
            <h2>Stack Operations</h2>

            <div className="operation-card">
              <h3>1. Push</h3>
              <p>Add an element to the top of the stack.</p>
              <div className="code-block"><code>{`// Java
stack.push(5);

// C++
stack.push(5);`}</code></div>
              <p className="operation-note"><strong>Time Complexity:</strong> O(1)</p>
            </div>

            <div className="operation-card">
              <h3>2. Pop</h3>
              <p>Remove the top element from the stack.</p>
              <div className="code-block"><code>{`// Java
int v = stack.pop();

// C++
int v = stack.top(); stack.pop();`}</code></div>
              <p className="operation-note"><strong>Time Complexity:</strong> O(1)</p>
            </div>

            <div className="operation-card">
              <h3>3. Peek / Top</h3>
              <p>Read the top element without removing it.</p>
              <div className="code-block"><code>{`// Java
int v = stack.peek();

// C++
int v = stack.top();`}</code></div>
              <p className="operation-note"><strong>Time Complexity:</strong> O(1)</p>
            </div>

          </div>
        )}

        {activeTab === 'complexity' && (
          <div className="concept-section">
            <h2>Time & Space Complexity</h2>

            <div className="complexity-table-wrapper">
              <table className="complexity-table">
                <thead>
                  <tr><th>Operation</th><th>Average</th><th>Worst</th><th>Description</th></tr>
                </thead>
                <tbody>
                  <tr><td><strong>Push</strong></td><td className="complexity-good">O(1)</td><td className="complexity-good">O(1)</td><td>Add to top</td></tr>
                  <tr><td><strong>Pop</strong></td><td className="complexity-good">O(1)</td><td className="complexity-good">O(1)</td><td>Remove from top</td></tr>
                  <tr><td><strong>Peek</strong></td><td className="complexity-good">O(1)</td><td className="complexity-good">O(1)</td><td>Read top</td></tr>
                </tbody>
              </table>
            </div>

            <div className="concept-card"><h3>Space Complexity</h3>
              <p><strong>O(n)</strong> - storing n elements</p>
            </div>
          </div>
        )}

        {activeTab === 'examples' && (
          <div className="concept-section">
            <h2>Common Stack Problems</h2>

            <div className="example-card">
              <h3>1. Valid Parentheses</h3>
              <p className="example-description">Use a stack to match opening and closing brackets.</p>
              <div className="code-block"><code>{`// Java
public boolean isValid(String s) {
  Stack<Character> st = new Stack<>();
  for (char c : s.toCharArray()) {
    if (c == '(') st.push(')');
    else if (st.isEmpty() || st.pop() != c) return false;
  }
  return st.isEmpty();
}`}</code></div>
              <p className="example-complexity"><strong>Time:</strong> O(n) | <strong>Space:</strong> O(n)</p>
            </div>

            <div className="example-card">
              <h3>2. Evaluate Postfix Expression</h3>
              <p className="example-description">Use a stack to evaluate expressions in postfix notation.</p>
              <div className="code-block"><code>{`// Pseudocode
for token in tokens:
  if token is number: push(token)
  else: b=pop(); a=pop(); push(apply(op,a,b))`}</code></div>
              <p className="example-complexity"><strong>Time:</strong> O(n) | <strong>Space:</strong> O(n)</p>
            </div>

            <div className="concept-card"><h3>Applications</h3>
              <ul>
                <li>Function call stack / recursion</li>
                <li>Undo functionality in editors</li>
                <li>Expression evaluation and syntax parsing</li>
              </ul>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}

export default StackConcept;
