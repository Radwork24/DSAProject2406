import { useState } from 'react';
import './GraphConcept.css';

function GraphConcept() {
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
            <span className="breadcrumb-current">Graph</span>
          </div>
          <h1 className="concept-title">Graph Data Structure</h1>
          <p className="concept-subtitle">Nodes (vertices) connected by edges — models relationships and networks</p>
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
            <h2>What is a Graph?</h2>
            <p>
              A graph is a collection of vertices (nodes) connected by edges. Graphs can be directed or undirected,
              weighted or unweighted, and are used to model networks and relationships.
            </p>

            <div className="concept-card">
              <h3>Key Concepts</h3>
              <ul>
                <li><strong>Representation:</strong> Adjacency list or adjacency matrix</li>
                <li><strong>Types:</strong> Directed, undirected, weighted, unweighted</li>
                <li><strong>Traversals:</strong> DFS, BFS</li>
              </ul>
            </div>

            <h3>Visual Representation</h3>
            <div className="visual-example">
              <div className="graph-visualization">
                <div className="graph-node">A</div>
                <div className="graph-node">B</div>
                <div className="graph-node">C</div>
                <div className="graph-edge">A → B</div>
                <div className="graph-edge">B → C</div>
                <div className="graph-edge">A → C</div>
              </div>
              <p className="visual-caption">Simple directed graph</p>
            </div>

          </div>
        )}

        {activeTab === 'operations' && (
          <div className="concept-section">
            <h2>Graph Operations</h2>

            <div className="operation-card">
              <h3>1. Add Edge</h3>
              <p>Add an edge between two vertices (directed/undirected).</p>
              <div className="code-block"><code>{`// Adjacency list
adj[u].push(v)
// for undirected: adj[v].push(u)`}</code></div>
            </div>

            <div className="operation-card">
              <h3>2. BFS</h3>
              <p>Breadth-first search visits vertices in increasing distance from source.</p>
              <div className="code-block"><code>{`// Pseudocode
queue.enqueue(s)
while queue not empty: v=dequeue(); visit(v); enqueue unvisited neighbors`}</code></div>
            </div>

            <div className="operation-card">
              <h3>3. DFS</h3>
              <p>Depth-first search explores as far as possible along each branch before backtracking.</p>
              <div className="code-block"><code>{`// Pseudocode
void dfs(v): visit(v); for neighbor in adj[v]: if not visited dfs(neighbor)`}</code></div>
            </div>

          </div>
        )}

        {activeTab === 'complexity' && (
          <div className="concept-section">
            <h2>Time & Space Complexity</h2>
            <div className="complexity-table-wrapper"><table className="complexity-table"><thead><tr><th>Operation</th><th>Time</th><th>Space</th><th>Description</th></tr></thead>
            <tbody>
              <tr><td><strong>BFS / DFS</strong></td><td className="complexity-good">O(V + E)</td><td className="complexity-good">O(V)</td><td>Traverse all vertices and edges</td></tr>
              <tr><td><strong>Dijkstra (with heap)</strong></td><td className="complexity-medium">O(E log V)</td><td className="complexity-good">O(V)</td><td>Shortest path (non-negative weights)</td></tr>
            </tbody></table></div>
            <div className="concept-card"><h3>Space Complexity</h3><p><strong>O(V + E)</strong> - adjacency lists</p></div>
          </div>
        )}

        {activeTab === 'examples' && (
          <div className="concept-section">
            <h2>Common Graph Problems</h2>

            <div className="example-card">
              <h3>1. Shortest Path (Dijkstra)</h3>
              <p className="example-description">Find shortest distances from source to all vertices with non-negative weights.</p>
              <div className="code-block"><code>{`// Use priority queue keyed by distance`}</code></div>
              <p className="example-complexity"><strong>Time:</strong> O(E log V)</p>
            </div>

            <div className="example-card">
              <h3>2. Topological Sort</h3>
              <p className="example-description">Order DAG vertices so that for every directed edge u → v, u comes before v.</p>
              <div className="code-block"><code>{`// Use DFS or Kahn's algorithm (indegree queue)`}</code></div>
              <p className="example-complexity"><strong>Time:</strong> O(V + E)</p>
            </div>

            <div className="concept-card"><h3>Applications</h3><ul><li>Routing and networks</li><li>Dependency resolution</li><li>Social graphs and recommendations</li></ul></div>
          </div>
        )}

      </main>
    </div>
  );
}

export default GraphConcept;
