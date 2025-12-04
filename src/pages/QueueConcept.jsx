import { useState } from 'react';
import './QueueConcept.css';

function QueueConcept() {
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
            <span className="breadcrumb-current">Queue</span>
          </div>
          <h1 className="concept-title">Queue Data Structure</h1>
          <p className="concept-subtitle">FIFO structure — First In, First Out. Useful for scheduling and buffering.</p>
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
            <h2>What is a Queue?</h2>
            <p>A queue stores elements in a First-In-First-Out order. Elements are enqueued at the rear and dequeued from the front.</p>

            <div className="concept-card">
              <h3>Key Characteristics</h3>
              <ul>
                <li><strong>FIFO:</strong> First element added is first removed</li>
                <li><strong>Operations:</strong> enqueue, dequeue, peek, isEmpty</li>
                <li><strong>Implementations:</strong> Arrays, linked lists, circular buffers</li>
              </ul>
            </div>

            <h3>Visual Representation</h3>
            <div className="visual-example">
              <div className="queue-visualization">
                <div className="queue-node">Front (1)</div>
                <div className="queue-node">2</div>
                <div className="queue-node">3</div>
                <div className="queue-node">4</div>
                <div className="queue-node">Rear (5)</div>
              </div>
              <p className="visual-caption">A queue with elements [1,2,3,4,5] (1 is front)</p>
            </div>
          </div>
        )}

        {activeTab === 'operations' && (
          <div className="concept-section">
            <h2>Queue Operations</h2>

            <div className="operation-card">
              <h3>1. Enqueue</h3>
              <p>Add an element to the rear of the queue.</p>
              <div className="code-block"><code>{`// Java
queue.add(5);

// C++
q.push(5);`}</code></div>
              <p className="operation-note"><strong>Time Complexity:</strong> O(1)</p>
            </div>

            <div className="operation-card">
              <h3>2. Dequeue</h3>
              <p>Remove the front element from the queue.</p>
              <div className="code-block"><code>{`// Java
int v = queue.remove();

// C++
int v = q.front(); q.pop();`}</code></div>
              <p className="operation-note"><strong>Time Complexity:</strong> O(1)</p>
            </div>

            <div className="operation-card">
              <h3>3. Peek / Front</h3>
              <p>Read the front element without removing it.</p>
              <div className="code-block"><code>{`// Java
int v = queue.peek();

// C++
int v = q.front();`}</code></div>
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
                  <tr><td><strong>Enqueue</strong></td><td className="complexity-good">O(1)</td><td className="complexity-good">O(1)</td><td>Add to rear</td></tr>
                  <tr><td><strong>Dequeue</strong></td><td className="complexity-good">O(1)</td><td className="complexity-good">O(1)</td><td>Remove from front</td></tr>
                  <tr><td><strong>Peek</strong></td><td className="complexity-good">O(1)</td><td className="complexity-good">O(1)</td><td>Read front</td></tr>
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
            <h2>Common Queue Problems</h2>

            <div className="example-card">
              <h3>1. Round Robin Scheduling</h3>
              <p className="example-description">Use a queue to schedule tasks in a fair circular order.</p>
              <div className="code-block"><code>{`// Pseudocode
while tasks:
  task = queue.dequeue()
  run(task)
  if not finished: queue.enqueue(task)`}</code></div>
              <p className="example-complexity"><strong>Time:</strong> O(total work) | <strong>Space:</strong> O(n)</p>
            </div>

            <div className="example-card">
              <h3>2. BFS (Breadth-First Search)</h3>
              <p className="example-description">Use a queue to traverse tree/graph level by level.</p>
              <div className="code-block"><code>{`// Pseudocode
queue.enqueue(root)
while queue not empty:
  node = queue.dequeue()
  visit(node)
  enqueue children`}</code></div>
              <p className="example-complexity"><strong>Time:</strong> O(n + m) | <strong>Space:</strong> O(n)</p>
            </div>

            <div className="concept-card"><h3>Applications</h3>
              <ul>
                <li>Task scheduling</li>
                <li>Streaming buffers</li>
                <li>Breadth-first traversals</li>
              </ul>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}

export default QueueConcept;
