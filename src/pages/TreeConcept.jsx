import { useState } from 'react';
import './TreeConcept.css';

function TreeConcept() {
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
            <span className="breadcrumb-current">Tree</span>
          </div>
          <h1 className="concept-title">Tree Data Structure</h1>
          <p className="concept-subtitle">Hierarchical structure with nodes and children. Commonly used: Binary Trees, BST, Heaps.</p>
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
            <h2>What is a Tree?</h2>
            <p>A tree is a hierarchical data structure consisting of nodes with parent-child relationships. The top node is called the root.</p>

            <div className="concept-card">
              <h3>Key Characteristics</h3>
              <ul>
                <li><strong>Hierarchy:</strong> Parent-child relations with a single root</li>
                <li><strong>Variants:</strong> Binary tree, Binary Search Tree (BST), Heap, AVL, Red-Black</li>
                <li><strong>Traversals:</strong> Preorder, Inorder, Postorder, Level-order</li>
              </ul>
            </div>

            <h3>Visual Representation</h3>
            <div className="visual-example">
              <div className="tree-visualization">
                <div className="tree-node">       8       </div>
                <div className="tree-row">
                  <div className="tree-node">  4  </div>
                  <div className="tree-node"> 12  </div>
                </div>
                <div className="tree-row">
                  <div className="tree-node">2</div>
                  <div className="tree-node">6</div>
                  <div className="tree-node">10</div>
                  <div className="tree-node">14</div>
                </div>
              </div>
              <p className="visual-caption">Simple Binary Search Tree</p>
            </div>
          </div>
        )}

        {activeTab === 'operations' && (
          <div className="concept-section">
            <h2>Tree Operations</h2>

            <div className="operation-card">
              <h3>1. Insert (BST)</h3>
              <p>Insert node respecting BST property (left &lt; node &lt; right).</p>
              <div className="code-block"><code>{`// Pseudocode
if root == null: root = newNode
else traverse left/right until place found`}</code></div>
              <p className="operation-note"><strong>Time Complexity:</strong> O(h) where h is tree height</p>
            </div>

            <div className="operation-card">
              <h3>2. Search (BST)</h3>
              <p>Search by comparing and traversing left/right.</p>
              <div className="code-block"><code>{`// Pseudocode
if val == node.val: found
else if val < node.val: search left
else search right`}</code></div>
              <p className="operation-note"><strong>Time Complexity:</strong> O(h)</p>
            </div>

            <div className="operation-card">
              <h3>3. Traversals</h3>
              <p>Preorder, Inorder, Postorder (DFS) and Level-order (BFS).</p>
              <div className="code-block"><code>{`// Inorder (recursive)
void inorder(node) { if(!node) return; inorder(node.left); visit(node); inorder(node.right); }`}</code></div>
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
                  <tr><th>Operation</th><th>Average</th><th>Worst</th><th>Description</th></tr>
                </thead>
                <tbody>
                  <tr><td><strong>Search / Insert (BST)</strong></td><td className="complexity-medium">O(h)</td><td className="complexity-bad">O(n)</td><td>Depends on tree height</td></tr>
                  <tr><td><strong>Traversal</strong></td><td className="complexity-good">O(n)</td><td className="complexity-good">O(n)</td><td>Visit all nodes</td></tr>
                </tbody>
              </table>
            </div>

            <div className="concept-card"><h3>Space Complexity</h3>
              <p><strong>O(n)</strong> - storing nodes; recursion may use O(h) stack</p>
            </div>
          </div>
        )}

        {activeTab === 'examples' && (
          <div className="concept-section">
            <h2>Common Tree Problems</h2>

            <div className="example-card">
              <h3>1. Lowest Common Ancestor (LCA)</h3>
              <p className="example-description">Find lowest common ancestor of two nodes in a binary tree/BST.</p>
              <div className="code-block"><code>{`// Pseudocode (BST)
if p.val < root.val and q.val < root.val: search left
else if p.val > root.val and q.val > root.val: search right
else return root`}</code></div>
              <p className="example-complexity"><strong>Time:</strong> O(h) | <strong>Space:</strong> O(1) or O(h)</p>
            </div>

            <div className="example-card">
              <h3>2. Tree Traversal (Inorder)</h3>
              <p className="example-description">Inorder traversal yields sorted order for BST.</p>
              <div className="code-block"><code>{`// See Traversals above`}</code></div>
              <p className="example-complexity"><strong>Time:</strong> O(n) | <strong>Space:</strong> O(h)</p>
            </div>

            <div className="concept-card"><h3>Applications</h3>
              <ul>
                <li>Hierarchical data: file systems, DOM</li>
                <li>Search trees for indexing</li>
                <li>Priority queues implemented with heaps</li>
              </ul>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}

export default TreeConcept;
