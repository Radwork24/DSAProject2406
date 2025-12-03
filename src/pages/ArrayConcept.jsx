import { useState } from 'react';
import './ArrayConcept.css';

function ArrayConcept() {
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
                        <span className="breadcrumb-current">Array</span>
                    </div>
                    <h1 className="concept-title">Array Data Structure</h1>
                    <p className="concept-subtitle">A fundamental linear data structure that stores elements in contiguous memory locations</p>
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
                        <h2>What is an Array?</h2>
                        <p>
                            An array is a collection of elements stored at contiguous memory locations.
                            It's one of the most fundamental and widely used data structures in computer science.
                        </p>

                        <div className="concept-card">
                            <h3>Key Characteristics</h3>
                            <ul>
                                <li><strong>Fixed Size:</strong> Once created, the size of an array is fixed (in most languages)</li>
                                <li><strong>Contiguous Memory:</strong> Elements are stored in consecutive memory locations</li>
                                <li><strong>Index-Based Access:</strong> Elements can be accessed directly using their index (0-based)</li>
                                <li><strong>Homogeneous Elements:</strong> All elements are of the same data type</li>
                            </ul>
                        </div>

                        <h3>Visual Representation</h3>
                        <div className="visual-example">
                            <div className="array-visualization">
                                <div className="array-cell">
                                    <div className="array-value">10</div>
                                    <div className="array-index">0</div>
                                </div>
                                <div className="array-cell">
                                    <div className="array-value">20</div>
                                    <div className="array-index">1</div>
                                </div>
                                <div className="array-cell">
                                    <div className="array-value">30</div>
                                    <div className="array-index">2</div>
                                </div>
                                <div className="array-cell">
                                    <div className="array-value">40</div>
                                    <div className="array-index">3</div>
                                </div>
                                <div className="array-cell">
                                    <div className="array-value">50</div>
                                    <div className="array-index">4</div>
                                </div>
                            </div>
                            <p className="visual-caption">Array with 5 elements: [10, 20, 30, 40, 50]</p>
                        </div>

                        <h3>When to Use Arrays?</h3>
                        <div className="concept-grid">
                            <div className="concept-card">
                                <h4>✓ Good For</h4>
                                <ul>
                                    <li>Random access to elements</li>
                                    <li>Storing fixed-size collections</li>
                                    <li>Sequential data processing</li>
                                    <li>Implementing other data structures</li>
                                </ul>
                            </div>
                            <div className="concept-card">
                                <h4>✗ Not Ideal For</h4>
                                <ul>
                                    <li>Frequent insertions/deletions</li>
                                    <li>Dynamic size requirements</li>
                                    <li>Searching unsorted data</li>
                                    <li>Memory-constrained environments</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'operations' && (
                    <div className="concept-section">
                        <h2>Array Operations</h2>

                        <div className="operation-card">
                            <h3>1. Access (Read)</h3>
                            <p>Retrieve an element at a specific index.</p>
                            <div className="code-block">
                                <code>
                                    {`// Java
int[] arr = {10, 20, 30, 40, 50};
int element = arr[2];  // Returns 30

// C++
int arr[] = {10, 20, 30, 40, 50};
int element = arr[2];  // Returns 30`}
                                </code>
                            </div>
                            <p className="operation-note"><strong>Time Complexity:</strong> O(1) - Constant time</p>
                        </div>

                        <div className="operation-card">
                            <h3>2. Insert</h3>
                            <p>Add a new element to the array.</p>
                            <div className="code-block">
                                <code>
                                    {`// Java - Using ArrayList for dynamic insertion
ArrayList<Integer> arr = new ArrayList<>(Arrays.asList(10, 20, 30, 40, 50));
arr.add(60);           // Insert at end: [10, 20, 30, 40, 50, 60]
arr.add(0, 5);         // Insert at beginning: [5, 10, 20, 30, 40, 50, 60]
arr.add(2, 25);        // Insert at index 2: [5, 10, 25, 20, 30, 40, 50, 60]

// C++ - Using vector for dynamic insertion
vector<int> arr = {10, 20, 30, 40, 50};
arr.push_back(60);                    // Insert at end
arr.insert(arr.begin(), 5);           // Insert at beginning
arr.insert(arr.begin() + 2, 25);      // Insert at index 2`}
                                </code>
                            </div>
                            <p className="operation-note"><strong>Time Complexity:</strong> O(n) - Linear time (requires shifting elements)</p>
                        </div>

                        <div className="operation-card">
                            <h3>3. Delete</h3>
                            <p>Remove an element from the array.</p>
                            <div className="code-block">
                                <code>
                                    {`// Java - Using ArrayList
ArrayList<Integer> arr = new ArrayList<>(Arrays.asList(10, 20, 30, 40, 50));
arr.remove(arr.size() - 1);  // Delete from end
arr.remove(0);                // Delete from beginning
arr.remove(2);                // Delete at index 2

// C++ - Using vector
vector<int> arr = {10, 20, 30, 40, 50};
arr.pop_back();                      // Delete from end
arr.erase(arr.begin());              // Delete from beginning
arr.erase(arr.begin() + 2);          // Delete at index 2`}
                                </code>
                            </div>
                            <p className="operation-note"><strong>Time Complexity:</strong> O(n) - Linear time (requires shifting elements)</p>
                        </div>

                        <div className="operation-card">
                            <h3>4. Search</h3>
                            <p>Find an element in the array.</p>
                            <div className="code-block">
                                <code>
                                    {`// Java - Linear Search
public static int linearSearch(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == target) {
            return i;
        }
    }
    return -1;
}

// C++ - Linear Search
int linearSearch(int arr[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (arr[i] == target) {
            return i;
        }
    }
    return -1;
}`}
                                </code>
                            </div>
                            <p className="operation-note"><strong>Time Complexity:</strong> O(n) - Linear time for unsorted array</p>
                        </div>

                        <div className="operation-card">
                            <h3>5. Update</h3>
                            <p>Modify an element at a specific index.</p>
                            <div className="code-block">
                                <code>
                                    {`// Java
int[] arr = {10, 20, 30, 40, 50};
arr[2] = 35;  // Updates element at index 2

// C++
int arr[] = {10, 20, 30, 40, 50};
arr[2] = 35;  // Updates element at index 2`}
                                </code>
                            </div>
                            <p className="operation-note"><strong>Time Complexity:</strong> O(1) - Constant time</p>
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
                                        <td>Direct index-based access</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Search</strong></td>
                                        <td className="complexity-bad">O(n)</td>
                                        <td className="complexity-bad">O(n)</td>
                                        <td>Linear search through elements</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Insert (End)</strong></td>
                                        <td className="complexity-good">O(1)</td>
                                        <td className="complexity-bad">O(n)</td>
                                        <td>May require array resizing</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Insert (Beginning)</strong></td>
                                        <td className="complexity-bad">O(n)</td>
                                        <td className="complexity-bad">O(n)</td>
                                        <td>Requires shifting all elements</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Insert (Middle)</strong></td>
                                        <td className="complexity-bad">O(n)</td>
                                        <td className="complexity-bad">O(n)</td>
                                        <td>Requires shifting elements</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Delete (End)</strong></td>
                                        <td className="complexity-good">O(1)</td>
                                        <td className="complexity-good">O(1)</td>
                                        <td>No shifting required</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Delete (Beginning)</strong></td>
                                        <td className="complexity-bad">O(n)</td>
                                        <td className="complexity-bad">O(n)</td>
                                        <td>Requires shifting all elements</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Delete (Middle)</strong></td>
                                        <td className="complexity-bad">O(n)</td>
                                        <td className="complexity-bad">O(n)</td>
                                        <td>Requires shifting elements</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="concept-card">
                            <h3>Space Complexity</h3>
                            <p><strong>O(n)</strong> - Linear space where n is the number of elements</p>
                            <p>Arrays store elements in contiguous memory, so the space required is directly proportional to the number of elements.</p>
                        </div>

                        <div className="concept-card">
                            <h3>Optimization Tips</h3>
                            <ul>
                                <li><strong>Pre-allocate size:</strong> If you know the size in advance, allocate it upfront to avoid resizing</li>
                                <li><strong>Use appropriate data structure:</strong> If frequent insertions/deletions are needed, consider LinkedList</li>
                                <li><strong>Binary search:</strong> For sorted arrays, use binary search (O(log n)) instead of linear search</li>
                                <li><strong>Batch operations:</strong> Group multiple insertions/deletions together to minimize shifting</li>
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === 'examples' && (
                    <div className="concept-section">
                        <h2>Common Array Problems</h2>

                        <div className="example-card">
                            <h3>1. Two Sum Problem</h3>
                            <p className="example-description">
                                Given an array of integers and a target sum, find two numbers that add up to the target.
                            </p>
                            <div className="code-block">
                                <code>
                                    {`// Java Solution
public int[] twoSum(int[] nums, int target) {
    HashMap<Integer, Integer> map = new HashMap<>();
    
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        
        if (map.containsKey(complement)) {
            return new int[] {map.get(complement), i};
        }
        
        map.put(nums[i], i);
    }
    
    return new int[] {};
}

// C++ Solution
vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> map;
    
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        
        if (map.find(complement) != map.end()) {
            return {map[complement], i};
        }
        
        map[nums[i]] = i;
    }
    
    return {};
}`}
                                </code>
                            </div>
                            <p className="example-complexity"><strong>Time:</strong> O(n) | <strong>Space:</strong> O(n)</p>
                        </div>

                        <div className="example-card">
                            <h3>2. Maximum Subarray (Kadane's Algorithm)</h3>
                            <p className="example-description">
                                Find the contiguous subarray with the largest sum.
                            </p>
                            <div className="code-block">
                                <code>
                                    {`// Java Solution
public int maxSubArray(int[] nums) {
    int maxSum = nums[0];
    int currentSum = nums[0];
    
    for (int i = 1; i < nums.length; i++) {
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }
    
    return maxSum;
}

// C++ Solution
int maxSubArray(vector<int>& nums) {
    int maxSum = nums[0];
    int currentSum = nums[0];
    
    for (int i = 1; i < nums.size(); i++) {
        currentSum = max(nums[i], currentSum + nums[i]);
        maxSum = max(maxSum, currentSum);
    }
    
    return maxSum;
}`}
                                </code>
                            </div>
                            <p className="example-complexity"><strong>Time:</strong> O(n) | <strong>Space:</strong> O(1)</p>
                        </div>

                        <div className="example-card">
                            <h3>3. Rotate Array</h3>
                            <p className="example-description">
                                Rotate an array to the right by k steps.
                            </p>
                            <div className="code-block">
                                <code>
                                    {`// Java Solution
public void rotate(int[] nums, int k) {
    k = k % nums.length;
    
    // Reverse entire array
    reverse(nums, 0, nums.length - 1);
    // Reverse first k elements
    reverse(nums, 0, k - 1);
    // Reverse remaining elements
    reverse(nums, k, nums.length - 1);
}

private void reverse(int[] nums, int start, int end) {
    while (start < end) {
        int temp = nums[start];
        nums[start] = nums[end];
        nums[end] = temp;
        start++;
        end--;
    }
}

// C++ Solution
void rotate(vector<int>& nums, int k) {
    k = k % nums.size();
    
    // Reverse entire array
    reverse(nums.begin(), nums.end());
    // Reverse first k elements
    reverse(nums.begin(), nums.begin() + k);
    // Reverse remaining elements
    reverse(nums.begin() + k, nums.end());
}`}
                                </code>
                            </div>
                            <p className="example-complexity"><strong>Time:</strong> O(n) | <strong>Space:</strong> O(1)</p>
                        </div>

                        <div className="concept-card">
                            <h3>Real-World Applications</h3>
                            <ul>
                                <li><strong>Database Systems:</strong> Storing records in tables</li>
                                <li><strong>Image Processing:</strong> Pixel data representation</li>
                                <li><strong>Sorting Algorithms:</strong> Foundation for merge sort, quick sort, etc.</li>
                                <li><strong>Dynamic Programming:</strong> Memoization tables</li>
                                <li><strong>Graph Algorithms:</strong> Adjacency matrix representation</li>
                                <li><strong>String Manipulation:</strong> Character arrays</li>
                            </ul>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default ArrayConcept;
