import { useState } from 'react';
import './HashingConcept.css';

function HashingConcept() {
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
            <span className="breadcrumb-current">Hashing</span>
          </div>
          <h1 className="concept-title">Hashing & Hash Tables</h1>
          <p className="concept-subtitle">Fast key-value lookup using hash functions and buckets</p>
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
            <h2>What is Hashing?</h2>
            <p>
              Hashing maps keys to indices using a hash function. Hash tables store key-value pairs in buckets
              to provide near-constant-time average lookup.
            </p>

            <div className="concept-card">
              <h3>Key Concepts</h3>
              <ul>
                <li><strong>Hash Function:</strong> Maps key to integer index</li>
                <li><strong>Buckets:</strong> Storage slots that may contain one or multiple entries</li>
                <li><strong>Collisions:</strong> Different keys mapping to same bucket</li>
                <li><strong>Resolution:</strong> Chaining or open addressing</li>
              </ul>
            </div>

            <h3>Visual Representation</h3>
            <div className="visual-example">
              <div className="hash-buckets">
                <div className="bucket">0: [ ]</div>
                <div className="bucket">1: [ 'cat' ]</div>
                <div className="bucket">2: [ 'dog' → 'god' ]</div>
                <div className="bucket">3: [ ]</div>
                <div className="bucket">4: [ 'tree' ]</div>
              </div>
              <p className="visual-caption">Hash table with chaining collision resolution</p>
            </div>

          </div>
        )}

        {activeTab === 'operations' && (
          <div className="concept-section">
            <h2>Hash Table Operations</h2>

            <div className="operation-card">
              <h3>1. Insert</h3>
              <p>Compute hash(key) and place value in appropriate bucket; handle collisions.</p>
              <div className="code-block"><code>{`// Pseudocode
index = hash(key) % capacity
bucket[index].append((key, value)) // chaining`}</code></div>
              <p className="operation-note"><strong>Average:</strong> O(1) | <strong>Worst-case:</strong> O(n)</p>
            </div>

            <div className="operation-card">
              <h3>2. Search</h3>
              <p>Locate the bucket and look for the key.</p>
              <div className="code-block"><code>{`// Pseudocode
index = hash(key) % capacity
for (k,v) in bucket[index]: if k==key return v`}</code></div>
              <p className="operation-note"><strong>Average:</strong> O(1) | <strong>Worst-case:</strong> O(n)</p>
            </div>

            <div className="operation-card">
              <h3>3. Delete</h3>
              <p>Find key in bucket and remove entry.</p>
              <div className="code-block"><code>{`// Pseudocode
index = hash(key) % capacity
remove entry from bucket[index]`}</code></div>
              <p className="operation-note"><strong>Average:</strong> O(1) | <strong>Worst-case:</strong> O(n)</p>
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
                  <tr><td><strong>Insert/Search/Delete</strong></td><td className="complexity-good">O(1)</td><td className="complexity-bad">O(n)</td><td>Depends on collisions / load factor</td></tr>
                </tbody>
              </table>
            </div>
            <div className="concept-card"><h3>Space Complexity</h3><p><strong>O(n)</strong> - storing n entries, plus bucket overhead</p></div>
          </div>
        )}

        {activeTab === 'examples' && (
          <div className="concept-section">
            <h2>Common Hashing Problems</h2>
            <div className="example-card">
              <h3>1. Frequency Count</h3>
              <p className="example-description">Count occurrences of items using a hash map.</p>
              <div className="code-block"><code>{`// JavaScript
const freq = {};
for (const x of arr) freq[x] = (freq[x]||0)+1;`}</code></div>
              <p className="example-complexity"><strong>Time:</strong> O(n) | <strong>Space:</strong> O(n)</p>
            </div>

            <div className="example-card">
              <h3>2. Anagram Grouping</h3>
              <p className="example-description">Use sorted string or char counts as hash keys to group anagrams.</p>
              <div className="code-block"><code>{`// Idea: key = sorted(chars)
map[key].push(word)`}</code></div>
              <p className="example-complexity"><strong>Time:</strong> O(n * k log k) (k = word length)</p>
            </div>

            <div className="concept-card"><h3>Notes</h3><ul><li>Choose hash functions carefully</li><li>Monitor load factor and resize table</li></ul></div>
          </div>
        )}
      </main>
    </div>
  );
}

export default HashingConcept;
