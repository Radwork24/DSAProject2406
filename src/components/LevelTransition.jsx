import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LevelTransition.css';

const LevelTransition = ({ topic = 'Data Structures', userName = 'User' }) => {
    // ------------------------------------------------------------------------
    // State & Animation Logic
    // ------------------------------------------------------------------------
    const [currentLevel, setCurrentLevel] = useState(1);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const mapContainerRef = useRef(null);
    const navigate = useNavigate();

    // Helper function to get user initials
    const getInitials = (name) => {
        if (!name || name === 'User') return 'U';
        const parts = name.trim().split(' ');
        if (parts.length === 1) {
            return parts[0].charAt(0).toUpperCase();
        }
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    useEffect(() => {
        // Start animation after component mount
        const timer = setTimeout(() => {
            setIsAnimating(true);

            // Complete the move after 2 seconds
            const moveTimer = setTimeout(() => {
                setCurrentLevel(prev => prev + 1);
                setIsAnimating(false);
                setShowCelebration(true);
            }, 2000);

            return () => clearTimeout(moveTimer);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    // ------------------------------------------------------------------------
    // Map Generation Logic (1 to 100)
    // ------------------------------------------------------------------------
    const totalLevels = 25;
    const levelsPerRow = 4; // Increased to 4 to make it slightly more compact
    const rowHeight = 70;   // Vertical space between rows
    const xPadding = 15;    // Padding from sides (%)

    // Generate Levels
    const levels = Array.from({ length: totalLevels }, (_, i) => {
        const levelNum = i + 1;
        const row = Math.floor(i / levelsPerRow);
        const colIndex = i % levelsPerRow;

        // Snake Pattern:
        // Row 0: L -> R
        // Row 1: R -> L
        // Row 2: L -> R ...
        const isEvenRow = row % 2 === 0;

        // Calculate X position (%)
        // We divide the available space (100 - 2*padding) by (levelsPerRow - 1)
        const availableWidth = 100 - (2 * xPadding);
        const stepX = availableWidth / (levelsPerRow - 1);

        let xPercent;
        if (isEvenRow) {
            xPercent = xPadding + (colIndex * stepX);
        } else {
            xPercent = (100 - xPadding) - (colIndex * stepX);
        }

        // Calculate Y position (px)
        // Add some top padding
        const yPos = (row * rowHeight) + 100;

        return {
            id: levelNum,
            x: xPercent,
            y: yPos,
            status: levelNum < 2 ? 'completed' : (levelNum === 2 ? 'next' : 'locked')
        };
    });

    // Generate Path (SVG d string)
    // Connect level N to N+1
    const generatePath = () => {
        let path = `M ${levels[0].x} ${levels[0].y}`;

        for (let i = 0; i < levels.length - 1; i++) {
            const current = levels[i];
            const next = levels[i + 1];

            // If changing rows, we might want a curve, otherwise a straight line
            // But simple Curve To (Q) looks good for everything

            // Control point for curve: simplified to midpoint
            const midX = (current.x + next.x) / 2;
            const midY = (current.y + next.y) / 2;

            // If it's a "u-turn" (end of row to start of next row), add nice curve
            const isRowChange = Math.floor(i / levelsPerRow) !== Math.floor((i + 1) / levelsPerRow);

            if (isRowChange) {
                // Curve wider for turnarounds
                // Control point pushed outward
                const controlX = current.x < 50 ? current.x - 20 : current.x + 20;
                const controlY = (current.y + next.y) / 2;
                path += ` Q ${controlX} ${controlY} ${next.x} ${next.y}`;
            } else {
                // Straight(ish) line for nodes in same row
                // Adding slight curve for organic feel
                path += ` L ${next.x} ${next.y}`;
            }
        }
        return path;
    };

    const pathD = generatePath();
    // Calculate total SVG height
    const totalHeight = (Math.ceil(totalLevels / levelsPerRow) * rowHeight) + 140;

    // ------------------------------------------------------------------------
    // Render
    // ------------------------------------------------------------------------

    // ------------------------------------------------------------------------
    // Render Variables
    // ------------------------------------------------------------------------
    const startNode = levels.find(l => l.id === 1);
    const endNode = levels.find(l => l.id === 2);

    // ------------------------------------------------------------------------
    // Quotes Data
    // ------------------------------------------------------------------------
    const dsaQuotes = [
        "Premature optimization is the root of all evil. - Donald Knuth",
        "Talk is cheap. Show me the code. - Linus Torvalds",
        "Programs must be written for people to read, and only incidentally for machines to execute. - Abelson & Sussman",
        "Simplicity is the soul of efficiency. - Austin Freeman",
        "First, solve the problem. Then, write the code. - John Johnson",
        "Code is like humor. When you have to explain it, it’s bad. - Cory House",
        "The best error message is the one that never shows up. - Thomas Fuchs",
        "Deleted code is debugged code. - Jeff Sickel"
    ];

    const [loadingLevel, setLoadingLevel] = useState(null);
    const [randomQuote, setRandomQuote] = useState('');

    const handleLevelClick = (levelId) => {
        // Pick a random quote
        const quote = dsaQuotes[Math.floor(Math.random() * dsaQuotes.length)];
        setRandomQuote(quote);
        setLoadingLevel(levelId);

        // Simulate loading delay
        setTimeout(() => {
            // Reset state
            setLoadingLevel(null);
            // Navigate with topic as query parameter
            const encodedTopic = encodeURIComponent(topic);
            navigate(`/level/${levelId}?topic=${encodedTopic}`);
        }, 3000); // 3 seconds delay
    };

    return (
        <div className="saga-map-container">
            <h3 className="map-title">Journey to Mastery (1-25)</h3>

            <div className="map-view scrollable" ref={mapContainerRef} style={{ height: `${totalHeight}px` }}>
                {/* Winding Path SVG */}
                <svg
                    className="map-path-svg"
                    width="100%"
                    height={totalHeight}
                    viewBox={`0 0 100 ${totalHeight}`}
                    preserveAspectRatio="none"
                >
                    <path
                        d={pathD}
                        className="path-line-bg"
                    />

                </svg>

                {/* Level Nodes */}
                {levels.map((level) => (
                    <div
                        key={level.id}
                        className={`level-node node-${level.status} ${currentLevel >= level.id ? 'active' : ''}`}
                        style={{ left: `${level.x}%`, top: `${level.y}px`, cursor: 'pointer' }}
                        onClick={() => handleLevelClick(level.id)}
                    >
                        <div className="node-inner">
                            {level.status === 'completed' || currentLevel > level.id ? '★' : level.id}
                        </div>
                        {currentLevel === level.id && showCelebration && (
                            <div className="level-complete-pop">Level {level.id} Unlocked!</div>
                        )}
                    </div>
                ))}

                {/* Avatar / Player Token */}
                {startNode && endNode && (
                    <div
                        className={`player-token ${isAnimating ? 'moving' : ''}`}
                        style={{
                            '--start-x': `${startNode.x}%`,
                            '--start-y': `${startNode.y}px`,
                            '--end-x': `${endNode.x}%`,
                            '--end-y': `${endNode.y}px`
                        }}
                    >
                        <div className="avatar-circle-token">{getInitials(userName)}</div>
                    </div>
                )}

                {/* Loading Overlay */}
                {loadingLevel && (
                    <div className="level-loader-overlay">
                        <div className="loader-content">
                            <div className="loader-spinner"></div>
                            <p className="loader-quote">"{randomQuote}"</p>
                            <p className="loader-status">Loading Level {loadingLevel}...</p>
                        </div>
                    </div>
                )}
            </div>

            {showCelebration && (
                null
            )}
        </div>
    );
};

export default LevelTransition;
