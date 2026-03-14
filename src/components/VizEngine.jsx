import React, { useEffect, useState, useRef } from 'react';

// ==========================================
//  TREE VISUALIZATION (BST / Binary Tree)
// ==========================================

const TreeNode = ({ node, x, y, parentX, parentY, level, activeValues = [], visitedValues = [] }) => {
    const isRoot = parentX === null;

    // Animation states
    const isActive = activeValues.includes(node.value);
    const isVisited = visitedValues.includes(node.value);

    return (
        <g>
            {/* Connection Line from Parent */}
            {!isRoot && (
                <line
                    x1={parentX}
                    y1={parentY}
                    x2={x}
                    y2={y}
                    stroke="#4b5563"
                    strokeWidth="2"
                    className="viz-line"
                />
            )}

            {/* The Node Circle */}
            <circle
                cx={x}
                cy={y}
                r="20"
                fill={isActive ? "#8b5cf6" : isVisited ? "#1f2937" : "#111827"}
                stroke={isActive ? "#c4b5fd" : visitedValues.includes(node.value) ? "#8b5cf6" : "#4b5563"}
                strokeWidth={isActive ? "3" : "2"}
                className="viz-node-shape"
            />

            {/* The Value */}
            <text
                x={x}
                y={y}
                dy=".35em"
                textAnchor="middle"
                fill={isActive ? "#ffffff" : "#e5e7eb"}
                fontWeight="600"
                fontSize="14px"
            >
                {node.value}
            </text>

            {/* Recursive Children */}
            {node.left && (
                <TreeNode
                    node={node.left}
                    x={x - 120 / (level + 1)} // Layout algorithms: spread decreases as we go down
                    y={y + 60}
                    parentX={x}
                    parentY={y}
                    level={level + 1}
                    activeValues={activeValues}
                    visitedValues={visitedValues}
                />
            )}
            {node.right && (
                <TreeNode
                    node={node.right}
                    x={x + 120 / (level + 1)}
                    y={y + 60}
                    parentX={x}
                    parentY={y}
                    level={level + 1}
                    activeValues={activeValues}
                    visitedValues={visitedValues}
                />
            )}
        </g>
    );
};

const DEFAULT_TREE = {
    value: "50",
    left: { value: "30", left: { value: "20" }, right: { value: "40" } },
    right: { value: "70", left: { value: "60" }, right: { value: "80" } }
};

const getTreeDepth = (node) => {
    if (!node) return 0;
    return 1 + Math.max(getTreeDepth(node.left), getTreeDepth(node.right));
};

// ==========================================
//  QUICK SORT TRACE GENERATOR
// ==========================================
const generateQSTrace = (arr) => {
    if (!arr || arr.length === 0) return null;
    const pivot = arr[arr.length - 1];
    const left = arr.slice(0, -1).filter(n => n < pivot);
    const right = arr.slice(0, -1).filter(n => n >= pivot);

    return {
        value: arr, // Array content
        pivot: pivot,
        type: 'array-node',
        left: left.length ? generateQSTrace(left) : null,
        right: right.length ? generateQSTrace(right) : null
    };
};

const ArrayTreeNode = ({ node, x, y, parentX, parentY, level, branchType, parentPivot }) => {
    if (!node) return null;

    // Render array box
    const BOX_W = 28; // Reduced size from 34
    const BOX_H = 28;
    const totalW = node.value.length * BOX_W;
    const startX = x - totalW / 2;

    // Define colors based on branch type
    let branchColor = '#4b5563'; // Default gray
    let boxBorderColor = '#374151';
    let boxGlow = 'none';

    if (branchType === 'left') {
        branchColor = '#ef4444'; // Red for Left (<=)
        boxBorderColor = '#ef4444';
        boxGlow = '0 0 8px rgba(239, 68, 68, 0.2)'; // Reduced glow radius
    } else if (branchType === 'right') {
        branchColor = '#06b6d4'; // Cyan for Right (>=)
        boxBorderColor = '#06b6d4';
        boxGlow = '0 0 8px rgba(6, 182, 212, 0.2)';
    }

    // Midpoint for the label
    const midX = parentX ? (parentX + x) / 2 : 0;
    const midY = parentY ? (parentY + y) / 2 : 0;

    return (
        <g>
            {/* Connection to Parent with Label */}
            {parentX !== null && (
                <g>
                    <line
                        x1={parentX}
                        y1={parentY + BOX_H / 2}
                        x2={x}
                        y2={y - BOX_H / 2}
                        stroke={branchColor}
                        strokeWidth="1.5"
                        opacity="0.8"
                    />
                    {/* Edge Label */}
                    <rect
                        x={midX - 15} // Adjusted for smaller label
                        y={midY - 8}
                        width="30"
                        height="16"
                        fill="#0f1115"
                        rx="3"
                    />
                    <text
                        x={midX}
                        y={midY + 4}
                        textAnchor="middle"
                        fill={branchColor}
                        fontWeight="bold"
                        fontSize="10px" // Smaller font
                    >
                        {branchType === 'left' ? `<=` : `>=`} {parentPivot}
                    </text>
                </g>
            )}

            {/* The Array Node */}
            <g transform={`translate(${startX}, ${y - BOX_H / 2})`}>
                {/* Container Box Highlight */}
                <rect
                    x={-2}
                    y={-2}
                    width={totalW + 4}
                    height={BOX_H + 4}
                    fill="none"
                    stroke={boxBorderColor}
                    strokeWidth="1"
                    rx="4"
                    strokeDasharray="3 2"
                    opacity={branchType ? "0.6" : "0"}
                />

                {node.value.map((val, idx) => {
                    const isPivot = val === node.pivot;
                    return (
                        <g key={idx} transform={`translate(${idx * BOX_W}, 0)`}>
                            <rect
                                width={BOX_W}
                                height={BOX_H}
                                fill={isPivot ? '#3b82f6' : '#1f2937'} // Blue for Pivot as requested
                                stroke={isPivot ? '#60a5fa' : '#374151'}
                                strokeWidth={isPivot ? 1.5 : 1}
                                rx="3"
                            />
                            {/* Pivot Label overhead if it is the pivot */}
                            {isPivot && (
                                <text
                                    x={BOX_W / 2}
                                    y={-6}
                                    textAnchor="middle"
                                    fill="#60a5fa"
                                    fontSize="9" // Smaller font
                                    fontWeight="bold"
                                >
                                    Pivot
                                </text>
                            )}
                            <text
                                x={BOX_W / 2}
                                y={BOX_H / 2 + 4} // Adjusted centering
                                textAnchor="middle"
                                fill="white"
                                fontSize="12" // Smaller font
                                fontWeight="bold"
                            >
                                {val}
                            </text>
                        </g>
                    );
                })}
            </g>

            {/* Children */}
            {node.left && (
                <ArrayTreeNode
                    node={node.left}
                    x={x - 450 / Math.pow(level, 1.1)} // Tighter spread (600 -> 450)
                    y={y + 80} // Tighter vertical (110 -> 80)
                    parentX={x}
                    parentY={y}
                    level={level + 0.5} // Faster decay in spread to keep it compact
                    branchType="left"
                    parentPivot={node.pivot}
                />
            )}
            {node.right && (
                <ArrayTreeNode
                    node={node.right}
                    x={x + 450 / Math.pow(level, 1.1)}
                    y={y + 80}
                    parentX={x}
                    parentY={y}
                    level={level + 0.5}
                    branchType="right"
                    parentPivot={node.pivot}
                />
            )}
        </g>
    );
};

const TreeViz = ({ data, isQuickSort, customValues }) => {
    // Determine Root: If Quick Sort, generate Trace Tree from values
    let rootData = data.root;
    let isTrace = false;

    if (isQuickSort && customValues && customValues.length > 0) {
        rootData = generateQSTrace(customValues);
        isTrace = true;
    } else {
        rootData = rootData || DEFAULT_TREE;
    }

    const depth = getTreeDepth(rootData);
    const dynamicHeight = Math.max(300, depth * 100 + 80);
    const dynamicWidth = 1600; // Expanded width for array view

    return (
        <div className="viz-container-inner" style={{
            height: `${dynamicHeight}px`,
            width: '100%',
            display: 'flex',
            justifyContent: 'center', // Start aligns to allow scrolling
            background: '#0f1115',
            borderRadius: '12px',
            overflow: 'auto',
            transition: 'height 0.3s ease'
        }}>
            {/* Expanded SVG Canvas */}
            <svg viewBox={`0 0 ${dynamicWidth} ${dynamicHeight}`} style={{ width: `${dynamicWidth}px`, height: '100%', minWidth: `${dynamicWidth}px` }}>
                {isTrace ? (
                    <ArrayTreeNode
                        node={rootData}
                        x={dynamicWidth / 2} // Center at 800
                        y={50}
                        parentX={null}
                        parentY={null}
                        level={1.5}
                    />
                ) : (
                    <TreeNode
                        node={rootData}
                        x={dynamicWidth / 2}
                        y={50}
                        parentX={null}
                        parentY={null}
                        level={1}
                        activeValues={data.active || []}
                        visitedValues={data.visited || []}
                    />
                )}
            </svg>
        </div>
    );
};


// ==========================================
//  ARRAY VISUALIZATION (Sort / Search)
// ==========================================

const ArrayViz = ({ data }) => {
    // 1. Check for 2D Data (Solver / Backtracking Mode)
    if (data.is2D && Array.isArray(data.values)) {
        return (
            <div className="viz-container-inner" style={{
                height: '300px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                background: '#0f1115',
                borderRadius: '12px',
                padding: '20px',
                overflow: 'auto',
                alignItems: 'flex-start' // Align left for list
            }}>
                <h4 style={{ color: '#9ca3af', margin: '0 0 10px 0', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Valid Combinations Found: {data.values.length}
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                    {data.values.length === 0 ? (
                        <div style={{ color: '#6b7280', marginTop: '10px', fontStyle: 'italic' }}>No solutions found for Target.</div>
                    ) : (
                        data.values.map((row, rowIdx) => (
                            <div key={rowIdx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{ color: '#6b7280', fontSize: '12px', fontFamily: 'monospace', minWidth: '20px' }}>
                                    [{rowIdx + 1}]
                                </span>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    {row.map((val, colIdx) => (
                                        <div key={colIdx} style={{
                                            padding: '8px 12px',
                                            background: '#1f2937', // Dark gray
                                            border: '1px solid #374151',
                                            borderRadius: '6px',
                                            color: '#10b981', // Emerald text
                                            fontWeight: '600',
                                            fontSize: '14px',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                        }}>
                                            {val}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }

    // 2. Standard 1D Array Logic (Sort / Search)
    let safeValues = [];
    if (Array.isArray(data.values)) {
        safeValues = data.values.map(v => Number(v));
    } else if (typeof data.values === 'string') {
        safeValues = data.values.split(',').map(v => Number(v.trim()));
    } else if (typeof data.values === 'number') {
        safeValues = [data.values];
    }

    safeValues = safeValues.filter(n => !isNaN(n));

    // Fallback if empty or too small
    if (safeValues.length < 3) {
        const isSortedContext = (data.title || "").toLowerCase().includes("sorted") ||
            (data.concept || "").toLowerCase().includes("binary search");

        if (isSortedContext) {
            safeValues = [10, 20, 30, 40, 50, 60, 70, 80];
        } else {
            safeValues = [12, 45, 67, 23, 89, 34, 56];
        }
    }

    return (
        <div className="viz-container-inner" style={{
            height: '300px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            background: '#0f1115',
            borderRadius: '12px',
            padding: '20px',
            overflow: 'auto'
        }}>
            {safeValues.map((val, idx) => {
                const isHighlight = data.highlights?.includes(idx);
                return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div
                            className="viz-bar"
                            style={{
                                height: '50px',
                                width: '50px',
                                background: isHighlight ? 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)' : '#1f2937',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: isHighlight ? '2px solid #c4b5fd' : '1px solid #374151',
                                transition: 'all 0.3s ease',
                                boxShadow: isHighlight ? '0 0 15px rgba(139, 92, 246, 0.4)' : 'inset 0 2px 4px rgba(0,0,0,0.1)'
                            }}
                        >
                            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>{val}</span>
                        </div>
                        <span style={{ color: '#9ca3af', fontSize: '12px', fontFamily: 'monospace' }}>{idx}</span>
                    </div>
                );
            })}
        </div>
    );
};


// ==========================================
//  MAIN SIMULATION RENDERER
// ==========================================

// ==========================================
//  HELPER: Convert Array to Tree (Level Order)
// ==========================================
const insertBST = (root, value) => {
    if (!root) return { value, left: null, right: null };
    if (value < root.value) root.left = insertBST(root.left, value);
    else root.right = insertBST(root.right, value);
    return root;
};

const arrayToTree = (values) => {
    if (!values || values.length === 0) return null;
    let root = null;
    values.forEach(val => { root = insertBST(root, val); });
    return root;
};

// ==========================================
//  MAIN SIMULATION RENDERER (INTERACTIVE)
// ==========================================


// ==========================================
//  ALGORITHMS: COMBINATION SUM
// ==========================================
const solveCombinationSum2 = (candidates, target) => {
    if (!Array.isArray(candidates)) return [];

    const results = [];
    // CRITICAL FIX: Create a copy before sorting to avoid mutating state/props
    const sortedCandidates = [...candidates].sort((a, b) => a - b);

    const backtrack = (remain, start, path) => {
        if (remain === 0) {
            results.push([...path]);
            return;
        }

        for (let i = start; i < sortedCandidates.length; i++) {
            if (i > start && sortedCandidates[i] === sortedCandidates[i - 1]) continue;
            if (sortedCandidates[i] > remain) break;

            path.push(sortedCandidates[i]);
            backtrack(remain - sortedCandidates[i], i + 1, path); // i+1 for Comb Sum II
            path.pop();
        }
    };

    backtrack(target, 0, []);
    return results;
};


export default function VizEngine({ data }) {
    // Determine Algorithm Context
    const allText = [
        data?.title || "",
        data?.description || "",
        data?.concept || ""
    ].join(" ").toLowerCase();

    const isQuickSort = allText.includes("quick") || allText.includes("partition");
    // Relaxed detection logic
    const looksLikeSolverProblem = allText.includes("combination") ||
        allText.includes("subset") ||
        allText.includes("backtrack") ||
        allText.includes("knapsack") ||
        allText.includes("sum");

    // Local state for interactivity
    const [vizType, setVizType] = useState(data?.type || 'array');
    const [inputStr, setInputStr] = useState('');
    const [targetStr, setTargetStr] = useState('8');
    const [parsedValues, setParsedValues] = useState([]);
    const [solutions, setSolutions] = useState([]);

    // Manual Toggle for Solver Mode
    const [isSolverMode, setIsSolverMode] = useState(false);

    // Initialize state when data prop changes
    useEffect(() => {
        if (!data) return;

        // Determine initial values
        let initValues = [];
        if (data.values && Array.isArray(data.values)) {
            initValues = data.values;
        } else if (data.type === 'tree') {
            initValues = [50, 30, 70, 20, 40, 60, 80];
        } else {
            // Default depending on context
            if (looksLikeSolverProblem) initValues = [10, 1, 2, 7, 6, 1, 5];
            else initValues = [10, 20, 30, 40, 50];
        }

        // Sanitize
        initValues = initValues.map(v => Number(v)).filter(n => !isNaN(n));

        // Auto-enable Solver Mode if keywords match
        if (looksLikeSolverProblem) {
            setIsSolverMode(true);
            setVizType('array');
        } else {
            setIsSolverMode(false);
            setVizType(data.type === 'tree' ? 'tree' : 'array');
        }

        // AUTO-CORRECTION for Arrays
        const shouldForceArray = allText.includes("sort") ||
            allText.includes("partition") ||
            allText.includes("array") ||
            allText.includes("swap") ||
            allText.includes("quick");

        if (shouldForceArray) {
            setVizType('array');
        }

        // Quick Sort specific sort
        if (shouldForceArray && allText.includes("sort")) {
            initValues = [...initValues].sort((a, b) => a - b);
        }

        setParsedValues(initValues);
        setInputStr(initValues.join(', '));

    }, [data, looksLikeSolverProblem]); // Re-run if detection logic changes result

    // Effect to run solver when inputs or mode changes
    useEffect(() => {
        if (isSolverMode) {
            const sols = solveCombinationSum2(parsedValues, Number(targetStr));
            setSolutions(sols);
        }
    }, [parsedValues, targetStr, isSolverMode]);


    // Handle Input Change
    const handleInputChange = (e) => {
        const str = e.target.value;
        setInputStr(str);
        const vals = str.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
        setParsedValues(vals);
    };

    // Handle Target Change
    const handleTargetChange = (e) => {
        setTargetStr(e.target.value);
    };

    // Handle Sort Button Click
    const handleSort = () => {
        const sorted = [...parsedValues].sort((a, b) => a - b);
        setParsedValues(sorted);
        setInputStr(sorted.join(', '));
    };

    if (!data) return null;

    // derived data for rendering
    const renderData = {
        ...data,
        type: vizType,
        values: isSolverMode && vizType === 'array' ? solutions : parsedValues,
        root: vizType === 'tree' ? arrayToTree(parsedValues) : null,
        is2D: isSolverMode && vizType === 'array'
    };

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>

            {/* RENDER AREA */}
            <div style={{ minHeight: '300px' }}>
                {vizType === 'tree' && <TreeViz data={renderData} isQuickSort={isQuickSort} customValues={parsedValues} />}
                {vizType === 'array' && <ArrayViz data={renderData} />}
            </div>

            {/* CONTROLS */}
            <div style={{
                display: 'flex',
                gap: '10px',
                padding: '15px',
                background: '#1f2937',
                borderRadius: '8px',
                alignItems: 'center',
                flexWrap: 'wrap'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '200px' }}>
                    <label style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Input Data (Comma Separated)
                    </label>
                    <input
                        type="text"
                        value={inputStr}
                        onChange={handleInputChange}
                        style={{
                            background: '#111827',
                            border: '1px solid #374151',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontFamily: 'monospace',
                            outline: 'none',
                            width: '100%'
                        }}
                    />
                </div>

                {isSolverMode && (
                    <div style={{ display: 'flex', flexDirection: 'column', width: '80px' }}>
                        <label style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Target
                        </label>
                        <input
                            type="number"
                            value={targetStr}
                            onChange={handleTargetChange}
                            style={{
                                background: '#111827',
                                border: '1px solid #374151',
                                color: 'white',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontFamily: 'monospace',
                                outline: 'none',
                                width: '100%'
                            }}
                        />
                    </div>
                )}

                {/* TOOLBAR ACTIONS */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', marginTop: 'auto' }}>
                    <label style={{ fontSize: '11px', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                            type="checkbox"
                            checked={isSolverMode}
                            onChange={(e) => {
                                setIsSolverMode(e.target.checked);
                                if (e.target.checked) setVizType('array');
                            }}
                        />
                        Solver Mode
                    </label>
                    <button
                        onClick={handleSort}
                        style={{
                            padding: '8px 20px',
                            borderRadius: '6px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '700',
                            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                            height: '35px'
                        }}
                    >
                        🔃 Sort
                    </button>
                </div>


                <div style={{ display: 'flex', gap: '5px', marginTop: 'auto' }}>
                    <button
                        onClick={() => setVizType('array')}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            background: vizType === 'array' ? '#3b82f6' : '#374151',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '600'
                        }}
                    >
                        {isSolverMode ? "Solutions" : "Array"}
                    </button>
                    <button
                        onClick={() => setVizType('tree')}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            background: vizType === 'tree' ? '#8b5cf6' : '#374151',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '600'
                        }}
                    >
                        Tree
                    </button>
                </div>
            </div>
        </div>
    );
}
