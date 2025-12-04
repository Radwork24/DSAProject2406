import { useState } from 'react';
import './HeapConcept.css';

function HeapConcept() {
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
            <span className="breadcrumb-current">Heap</span>
          </div>
          <h1 className="concept-title">Heap (Binary Heap)</h1>
          <p className="concept-subtitle">Specialized tree-based structure for priority queues — typically implemented as binary heap</p>
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
            <h2>What is a Heap?</h2>
            <p>
              A binary heap is a complete binary tree that satisfies the heap property: parent nodes are greater (max-heap)
              or smaller (min-heap) than their children. Heaps are commonly stored as arrays.
            </p>

            <div className="concept-card">
              <h3>Key Characteristics</h3>
              <ul>
                <li><strong>Complete Tree:</strong> All levels filled except possibly last</li>
                <li><strong>Heap Property:</strong> Parent relation to children (max/min)</li>
                <li><strong>Array-backed:</strong> Stored compactly in arrays</li>
              </ul>
            </div>

            <h3>Visual Representation</h3>
            <div className="visual-example">
              <div className="heap-visualization">
                <div className="heap-row">       50       </div>
                <div className="heap-row"><span className="heap-node">30</span><span className="heap-node">40</span></div>
                <div className="heap-row"><span className="heap-node">10</span><span className="heap-node">20</span><span className="heap-node">35</span></div>
              </div>
              <p className="visual-caption">Max-heap example</p>
            </div>

          </div>
        )}

        {activeTab === 'operations' && (
          <div className="concept-section">
            <h2>Heap Operations</h2>

            <div className="operation-card">
              <h3>1. Insert</h3>
              <p>Add element at end and sift-up to maintain heap property.</p>
              <div className="code-block"><code>{`// Pseudocode
arr.push(x); siftUp(arr.size-1);`}</code></div>
              <p className="operation-note"><strong>Time Complexity:</strong> O(log n)</p>
            </div>

            <div className="operation-card">
              <h3>2. Extract (Max/Min)</h3>
              <p>Swap root with last, pop last, sift-down root.</p>
              <div className="code-block"><code>{`// Pseudocode
res = arr[0]; arr[0]=arr.pop(); siftDown(0); return res;`}</code></div>
              <p className="operation-note"><strong>Time Complexity:</strong> O(log n)</p>
            </div>

            <div className="operation-card">
              <h3>3. Heapify</h3>
              <p>Build heap from array in O(n) time using bottom-up sift-down.</p>
              <div className="code-block"><code>{`// Pseudocode
for i from floor(n/2)-1 down to 0: siftDown(i)`}</code></div>
              <p className="operation-note"><strong>Time Complexity:</strong> O(n)</p>
            </div>

          </div>
        )}

        {activeTab === 'complexity' && (
          <div className="concept-section">
            <h2>Time & Space Complexity</h2>
            <div className="complexity-table-wrapper"><table className="complexity-table"><thead><tr><th>Operation</th><th>Average</th><th>Worst</th><th>Description</th></tr></thead>
            <tbody>
              <tr><td><strong>Insert</strong></td><td className="complexity-medium">O(log n)</td><td className="complexity-medium">O(log n)</td><td>Sift-up</td></tr>
              <tr><td><strong>Extract</strong></td><td className="complexity-medium">O(log n)</td><td className="complexity-medium">O(log n)</td><td>Sift-down</td></tr>
              <tr><td><strong>Build Heap</strong></td><td className="complexity-good">O(n)</td><td className="complexity-good">O(n)</td><td>Bottom-up heapify</td></tr>
            </tbody></table></div>
            <div className="concept-card"><h3>Space Complexity</h3><p><strong>O(n)</strong> - array storage</p></div>
          </div>
        )}

        {activeTab === 'examples' && (
          <div className="concept-section">
            <h2>Common Heap Problems</h2>
            <div className="example-card"><h3>1. Priority Queue</h3><p className="example-description">Use heap to always extract highest/lowest priority.</p>
              <div className="code-block"><code>{`// Operations: push, pop (extract)`}</code></div>
              <p className="example-complexity"><strong>Time:</strong> O(log n)</p></div>

            <div className="example-card"><h3>2. Heap Sort</h3><p className="example-description">Build max-heap and repeatedly extract max to sort.</p>
              <div className="code-block"><code>{`// O(n log n) time, in-place`}</code></div>
              <p className="example-complexity"><strong>Time:</strong> O(n log n) | <strong>Space:</strong> O(1)</p></div>

            <div className="concept-card"><h3>Notes</h3><ul><li>Heaps are excellent for dynamic priority use-cases</li><li>Binary heap is common; other heaps include Fibonacci heap</li></ul></div>
          </div>
        )}
      </main>
    </div>
  );
}

export default HeapConcept;
