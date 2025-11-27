import { useState, useEffect } from 'react';

const Header = () => {
    const [displayText, setDisplayText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const fullText = '2406';

    useEffect(() => {
        const typingSpeed = isDeleting ? 150 : 200;
        const pauseTime = 200;

        const timer = setTimeout(() => {
            if (!isDeleting) {
                // Typing phase
                if (displayText.length < fullText.length) {
                    setDisplayText(fullText.substring(0, displayText.length + 1));
                } else {
                    // Pause before deleting
                    setTimeout(() => setIsDeleting(true), pauseTime);
                }
            } else {
                // Deleting phase
                if (displayText.length > 0) {
                    setDisplayText(displayText.substring(0, displayText.length - 1));
                } else {
                    // Pause before typing again
                    setTimeout(() => setIsDeleting(false), pauseTime);
                }
            }
        }, typingSpeed);

        return () => clearTimeout(timer);
    }, [displayText, isDeleting]);

    return (
        <header className="header">
            <div className="header-content">
                <div className="logo">
                    <span className="logo-text">DSA-Solver</span>
                    <span className="logo-cursor">{displayText}</span>
                </div>
                <nav className="nav">
                    <a href="#docs" className="nav-link">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 2h10v12H3V2z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                            <path d="M6 5h4M6 8h4M6 11h2" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                        <span>Docs</span>
                    </a>
                    <a href="#easing-editor" className="nav-link">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M2 14L14 2" stroke="currentColor" strokeWidth="1.5" />
                            <circle cx="3" cy="13" r="1.5" fill="currentColor" />
                            <circle cx="13" cy="3" r="1.5" fill="currentColor" />
                        </svg>
                        <span>Easing editor</span>
                    </a>
                    <a href="#learn" className="nav-link">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
                            <path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                        <span>Learn</span>
                    </a>
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="nav-link">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                        </svg>
                    </a>
                    <button className="sponsor-btn">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 14.25l-.345-.666c-.67-1.29-1.88-2.39-3.155-3.28C3.165 9.424 2 8.643 2 7.5c0-1.381 1.119-2.5 2.5-2.5.775 0 1.467.35 1.933.903L8 7.5l1.567-1.597C10.033 5.35 10.725 5 11.5 5c1.381 0 2.5 1.119 2.5 2.5 0 1.143-1.165 1.924-2.5 2.804-1.275.89-2.485 1.99-3.155 3.28L8 14.25z" />
                        </svg>
                        <span>Sponsor</span>
                    </button>
                </nav>
            </div>
        </header>
    );
};

export default Header;
