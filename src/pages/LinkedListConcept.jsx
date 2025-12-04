import { useState } from 'react';
import './LinkedListConcept.css';

function LinkedListConcept() {
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
            <span className="breadcrumb-current">LinkedList</span>
          </div>
          <h1 className="concept-title">Linked List Data Structure</h1>
          <p className="concept-subtitle">A linear data structure where elements are stored in nodes that point to the next node</p>
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
            <h2>What is a Linked List?</h2>
            <p>
              A linked list is a linear collection of nodes where each node contains a value and a reference (pointer)
              to the next node. Unlike arrays, linked lists have dynamic size and efficient insert/delete at the
              beginning.
            </p>

            <div className="concept-card">
              <h3>Key Characteristics</h3>
              <ul>
                <li><strong>Dynamic Size:</strong> Can grow or shrink at runtime</li>
                <li><strong>Non-contiguous Memory:</strong> Nodes can be scattered in memory</li>
                <li><strong>Pointer-based:</strong> Each node points to the next node (and optionally previous)</li>
                <li><strong>Variants:</strong> Singly, Doubly, Circular linked lists</li>
              </ul>
            </div>

            <h3>Visual Representation</h3>
            <div className="visual-example">
              <div className="list-visualization">
                <div className="node-cell">
                  <div className="node-value">10</div>
                  <div className="node-pointer">→</div>
                </div>
                <div className="node-cell">
                  <div className="node-value">20</div>
                  <div className="node-pointer">→</div>
                </div>
                <div className="node-cell">
                  <div className="node-value">30</div>
                  <div className="node-pointer">→</div>
                </div>
                <div className="node-cell">
                  <div className="node-value">40</div>
                  <div className="node-pointer">→</div>
                </div>
                <div className="node-cell">
                  <div className="node-value">null</div>
                  <div className="node-pointer"> </div>
                </div>
              </div>
              <p className="visual-caption">Singly linked list: 10 → 20 → 30 → 40 → null</p>
            </div>

            <div className="concept-grid">
              <div className="concept-card">
                <h4>✓ Good For</h4>
                <ul>
                  <li>Frequent insertions/deletions</li>
                  <li>Implementing stacks/queues efficiently</li>
                  <li>When dynamic size is required</li>
                </ul>
              </div>
              <div className="concept-card">
                <h4>✗ Not Ideal For</h4>
                <ul>
                  <li>Random access by index (no O(1) indexing)</li>
                  <li>High memory overhead from pointers</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'operations' && (
          <div className="concept-section">
            <h2>Linked List Operations</h2>

            <div className="operation-card">
              <h3>1. Insert (Beginning)</h3>
              <p>Insert a new node at the head of the list.</p>
              <div className="code-block">
                <code>{`// C-like pseudocode
newNode.next = head;
head = newNode;

// Java/C++ similar concepts apply`}</code>
              </div>
              <p className="operation-note"><strong>Time Complexity:</strong> O(1)</p>
            </div>

            <div className="operation-card">
              <h3>2. Insert (End)</h3>
              <p>Insert a new node at the tail. Without tail pointer this is O(n).</p>
              <div className="code-block">
                <code>{`// Pseudocode
if (head == null) head = newNode;
else tail.next = newNode; tail = newNode;`}</code>
              </div>
              <p className="operation-note"><strong>Time Complexity:</strong> O(n) without tail pointer, O(1) with tail</p>
            </div>

            <div className="operation-card">
              <h3>3. Delete (Given Node)</h3>
              <p>Remove a node when you have a reference to it.</p>
              <div className="code-block">
                <code>{`// Pseudocode (delete by value requires traversal)
prev.next = node.next;`}</code>
              </div>
              <p className="operation-note"><strong>Time Complexity:</strong> O(n) to find node, O(1) to remove once found</p>
            </div>

            <div className="operation-card">
              <h3>4. Reverse</h3>
              <p>Reverse a singly linked list in-place.</p>
              <div className="code-block">
                <code>{`// Pseudocode
prev = null; curr = head;
while (curr != null) {
  next = curr.next;
  curr.next = prev;
  prev = curr;
  curr = next;
}
head = prev;`}</code>
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
                    <td><strong>Access (by index)</strong></td>
                    <td className="complexity-bad">O(n)</td>
                    <td className="complexity-bad">O(n)</td>
                    <td>Must traverse from head</td>
                  </tr>
                  <tr>
                    <td><strong>Insert (Beginning)</strong></td>
                    <td className="complexity-good">O(1)</td>
                    <td className="complexity-good">O(1)</td>
                    <td>Constant-time with head pointer</td>
                  </tr>
                  <tr>
                    <td><strong>Insert (End)</strong></td>
                    <td className="complexity-medium">O(n)</td>
                    <td className="complexity-medium">O(n)</td>
                    <td>O(1) if tail pointer exists</td>
                  </tr>
                  <tr>
                    <td><strong>Delete (Given node)</strong></td>
                    <td className="complexity-good">O(1)</td>
                    <td className="complexity-good">O(1)</td>
                    <td>After locating the node</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="concept-card">
              <h3>Space Complexity</h3>
              <p><strong>O(n)</strong> - Each element requires a node and pointer storage</p>
            </div>
          </div>
        )}

        {activeTab === 'examples' && (
          <div className="concept-section">
            <h2>Common Linked List Problems</h2>

            <div className="example-card">
              <h3>1. Reverse Linked List</h3>
              <p className="example-description">Reverse the linked list in-place using three pointers.</p>
              <div className="code-block">
                <code>{`// See Reverse operation pseudocode above`}</code>
              </div>
              <p className="example-complexity"><strong>Time:</strong> O(n) | <strong>Space:</strong> O(1)</p>
            </div>

            <div className="example-card">
              <h3>2. Detect Cycle (Floyd's Tortoise & Hare)</h3>
              <p className="example-description">Detect whether a linked list contains a cycle using two pointers.</p>
              <div className="code-block">
                <code>{`// Pseudocode
slow = head; fast = head;
while (fast != null && fast.next != null) {
  slow = slow.next;
  fast = fast.next.next;
  if (slow == fast) return true; // cycle detected
}
return false;`}</code>
              </div>
              <p className="example-complexity"><strong>Time:</strong> O(n) | <strong>Space:</strong> O(1)</p>
            </div>

            <div className="example-card">
              <h3>3. Merge Two Sorted Lists</h3>
              <p className="example-description">Merge two sorted linked lists into one sorted list.</p>
              <div className="code-block">
                <code>{`// Pseudocode
dummy = new Node(0); tail = dummy;
while (l1 && l2) {
  if (l1.val < l2.val) { tail.next = l1; l1 = l1.next; }
  else { tail.next = l2; l2 = l2.next; }
  tail = tail.next;
}
if (l1) tail.next = l1; else tail.next = l2;
return dummy.next;`}</code>
              </div>
              <p className="example-complexity"><strong>Time:</strong> O(n + m) | <strong>Space:</strong> O(1)</p>
            </div>

            <div className="concept-card">
              <h3>Real-World Applications</h3>
              <ul>
                <li><strong>Memory-efficient dynamic structures:</strong> Implement stacks, queues, adjacency lists</li>
                <li><strong>Undo/Redo:</strong> Doubly linked lists in editors</li>
                <li><strong>Chaining in hash tables:</strong> Collision resolution via linked lists</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default LinkedListConcept;
