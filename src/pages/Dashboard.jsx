import { useState } from 'react';
import './Dashboard.css';
import { generateExplanation, generateDoubtAnswer, generateExample } from '../services/groqService';
import ReactMarkdown from 'react-markdown';

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [doubtPopups, setDoubtPopups] = useState([]);
  const [minimizedTiles, setMinimizedTiles] = useState([]);
  const [examplePopups, setExamplePopups] = useState([]);
  const [minimizedExampleTiles, setMinimizedExampleTiles] = useState([]);
  const [hasInitialResponse, setHasInitialResponse] = useState(false);
  const [doubtCounter, setDoubtCounter] = useState(0);
  const [exampleCounter, setExampleCounter] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [originalProblem, setOriginalProblem] = useState('');
  const [conceptsExpanded, setConceptsExpanded] = useState({});

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleConcepts = (messageId) => {
    setConceptsExpanded(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  // Concept mapping for clickable links
  const conceptMap = {
    'Array': '/concepts/array',
    'Arrays': '/concepts/array',
    // Future concepts can be added here
    // 'Stack': '/concepts/stack',
    // 'Queue': '/concepts/queue',
    // 'Tree': '/concepts/tree',
    // 'Graph': '/concepts/graph',
  };

  // Component to add Learn More citation after first concept mention
  const ConceptLinkedText = ({ children }) => {
    if (typeof children !== 'string') return children;

    const conceptKeywords = Object.keys(conceptMap);
    const regex = new RegExp(`\\b(${conceptKeywords.join('|')})\\b`, 'i');

    const match = children.match(regex);

    if (match) {
      const matchedWord = match[0];
      const matchedConcept = conceptKeywords.find(
        keyword => keyword.toLowerCase() === matchedWord.toLowerCase()
      );

      const index = match.index;
      const before = children.substring(0, index + matchedWord.length);
      const after = children.substring(index + matchedWord.length);

      return (
        <>
          {before}
          <a
            href={conceptMap[matchedConcept]}
            target="_blank"
            rel="noopener noreferrer"
            className="concept-citation"
            onClick={(e) => {
              e.preventDefault();
              window.open(conceptMap[matchedConcept], '_blank');
            }}
          >
            Learn More
            <svg
              width="10"
              height="10"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="concept-citation-icon"
            >
              <path d="M10 1L1 10M10 1H4M10 1V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          {after}
        </>
      );
    }

    return children;
  };

  // Custom markdown components with concept linking
  const markdownComponents = {
    p: ({ children }) => <p><ConceptLinkedText>{children}</ConceptLinkedText></p>,
    li: ({ children }) => <li><ConceptLinkedText>{children}</ConceptLinkedText></li>,
  };

  // Custom component to render AI response with collapsible concepts
  const AIResponseContent = ({ text, messageId }) => {
    // Split the response into parts: before concepts, concepts section, and after
    const conceptsRegex = /\*\*Concepts Included:\*\*/i;
    const parts = text.split(conceptsRegex);

    if (parts.length === 1) {
      // No concepts section found, render normally with concept links
      return <ReactMarkdown components={markdownComponents}>{text}</ReactMarkdown>;
    }

    const beforeConcepts = parts[0];
    const conceptsAndAfter = parts[1];

    // Find where the concepts section ends (next ## or end of text)
    const nextSectionRegex = /\n##[^#]/;
    const nextSectionMatch = conceptsAndAfter.match(nextSectionRegex);

    let conceptsContent, afterConcepts;
    if (nextSectionMatch) {
      const splitIndex = nextSectionMatch.index;
      conceptsContent = conceptsAndAfter.substring(0, splitIndex);
      afterConcepts = conceptsAndAfter.substring(splitIndex);
    } else {
      conceptsContent = conceptsAndAfter;
      afterConcepts = '';
    }

    return (
      <>
        <ReactMarkdown components={markdownComponents}>{beforeConcepts}</ReactMarkdown>

        {/* Collapsible Concepts Section */}
        <div className="concepts-section">
          <div
            className="concepts-toggle"
            onClick={() => toggleConcepts(messageId)}
          >
            <span className="concepts-toggle-text">
              Concepts required in these kind of questions
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`concepts-toggle-icon ${conceptsExpanded[messageId] ? 'expanded' : ''}`}
            >
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {conceptsExpanded[messageId] && (
            <div className="concepts-content">
              <ReactMarkdown components={markdownComponents}>{conceptsContent}</ReactMarkdown>
            </div>
          )}
        </div>

        {afterConcepts && <ReactMarkdown components={markdownComponents}>{afterConcepts}</ReactMarkdown>}
      </>
    );
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    setInputValue('');

    // If this is the first query (no AI response yet), add to messages normally
    if (!hasInitialResponse) {
      const userMessage = {
        id: Date.now(),
        type: 'user',
        text: userText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);
      setOriginalProblem(userText);

      // Create a placeholder for the AI response
      const aiResponseId = Date.now() + 1;
      const aiResponse = {
        id: aiResponseId,
        type: 'ai',
        text: '',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);

      try {
        // Call Groq API with streaming for explanation
        await generateExplanation(userText, (chunk, fullText) => {
          // Update the AI response with streaming content
          setMessages(prev => prev.map(msg =>
            msg.id === aiResponseId
              ? { ...msg, text: fullText }
              : msg
          ));
        });

        setHasInitialResponse(true);
      } catch (error) {
        console.error('Error generating explanation:', error);
        setMessages(prev => prev.map(msg =>
          msg.id === aiResponseId
            ? { ...msg, text: `I apologize, but I encountered an error while generating the explanation. Please try again. Error: ${error.message}` }
            : msg
        ));
      } finally {
        setIsLoading(false);
      }
    } else {
      // This is a follow-up query - determine if it's an example request or a doubt
      const lowerCaseQuery = userText.toLowerCase();
      const isExampleQuery =
        lowerCaseQuery.includes('example') ||
        lowerCaseQuery.includes('similar') ||
        lowerCaseQuery.includes('show me') ||
        lowerCaseQuery.includes('give me') ||
        lowerCaseQuery.includes('use case') ||
        lowerCaseQuery.includes('variation') ||
        lowerCaseQuery.includes('other problem');

      if (isExampleQuery) {
        // Create an example popup
        const exampleId = Date.now();
        const newExampleNumber = exampleCounter + 1;
        setExampleCounter(newExampleNumber);

        const newPopup = {
          id: exampleId,
          exampleNumber: newExampleNumber,
          question: userText,
          answer: '',
          isMinimized: false,
          position: { x: window.innerWidth / 2 - 300, y: window.innerHeight / 2 - 200 },
          size: { width: 600, height: 400 }
        };

        setExamplePopups(prev => [...prev, newPopup]);

        // Call Groq API with streaming for example
        try {
          await generateExample(userText, originalProblem, (chunk, fullText) => {
            // Update the popup with streaming content
            setExamplePopups(prev => prev.map(popup =>
              popup.id === exampleId
                ? { ...popup, answer: fullText }
                : popup
            ));
          });
        } catch (error) {
          console.error('Error generating example:', error);
          setExamplePopups(prev => prev.map(popup =>
            popup.id === exampleId
              ? { ...popup, answer: `Error: ${error.message}. Please try again.` }
              : popup
          ));
        }
      } else {
        // Create a doubt popup
        const doubtId = Date.now();
        const newDoubtNumber = doubtCounter + 1;
        setDoubtCounter(newDoubtNumber);

        const newPopup = {
          id: doubtId,
          doubtNumber: newDoubtNumber,
          question: userText,
          answer: '',
          isMinimized: false,
          position: { x: window.innerWidth / 2 - 300, y: window.innerHeight / 2 - 200 },
          size: { width: 600, height: 400 }
        };

        setDoubtPopups(prev => [...prev, newPopup]);

        // Call Groq API with streaming for doubt answer
        try {
          await generateDoubtAnswer(userText, originalProblem, (chunk, fullText) => {
            // Update the popup with streaming content
            setDoubtPopups(prev => prev.map(popup =>
              popup.id === doubtId
                ? { ...popup, answer: fullText }
                : popup
            ));
          });
        } catch (error) {
          console.error('Error generating doubt answer:', error);
          setDoubtPopups(prev => prev.map(popup =>
            popup.id === doubtId
              ? { ...popup, answer: `Error: ${error.message}. Please try again.` }
              : popup
          ));
        }
      }
    }
  };

  const closePopup = (popupId) => {
    setDoubtPopups(prev => prev.filter(p => p.id !== popupId));
  };

  const minimizePopup = (popupId) => {
    const popup = doubtPopups.find(p => p.id === popupId);
    if (popup) {
      setMinimizedTiles(prev => [...prev, popup]);
      setDoubtPopups(prev => prev.filter(p => p.id !== popupId));
    }
  };

  const restorePopup = (tileId) => {
    const tile = minimizedTiles.find(t => t.id === tileId);
    if (tile) {
      setDoubtPopups(prev => [...prev, { ...tile, isMinimized: false }]);
      setMinimizedTiles(prev => prev.filter(t => t.id !== tileId));
    }
  };

  const removeTile = (tileId) => {
    setMinimizedTiles(prev => prev.filter(t => t.id !== tileId));
  };

  const closeExamplePopup = (popupId) => {
    setExamplePopups(prev => prev.filter(p => p.id !== popupId));
  };

  const minimizeExamplePopup = (popupId) => {
    const popup = examplePopups.find(p => p.id === popupId);
    if (popup) {
      setMinimizedExampleTiles(prev => [...prev, popup]);
      setExamplePopups(prev => prev.filter(p => p.id !== popupId));
    }
  };

  const restoreExamplePopup = (tileId) => {
    const tile = minimizedExampleTiles.find(t => t.id === tileId);
    if (tile) {
      setExamplePopups(prev => [...prev, { ...tile, isMinimized: false }]);
      setMinimizedExampleTiles(prev => prev.filter(t => t.id !== tileId));
    }
  };

  const removeExampleTile = (tileId) => {
    setMinimizedExampleTiles(prev => prev.filter(t => t.id !== tileId));
  };

  return (
    <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open-container' : ''}`}>
      {/* Left Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-toggle" onClick={toggleSidebar}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4H16V16H4V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 8H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {sidebarOpen && <div className="sidebar-brand">AlgoZen</div>}
        </div>

        <div className="sidebar-content">
          {sidebarOpen ? (
            <div className="sidebar-nav">
              <div className="sidebar-nav-item active">
                <div className="icon-circle orange">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <span>New chat</span>
              </div>
              <div className="sidebar-nav-item">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 3C6.13401 3 3 6.13401 3 10C3 13.866 6.13401 17 10 17C13.866 17 17 13.866 17 10C17 6.13401 13.866 3 10 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 7V10M10 13H10.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Chats</span>
              </div>
              <div className="sidebar-nav-item">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="6" height="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="11" y="3" width="6" height="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="3" y="11" width="6" height="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="11" y="11" width="6" height="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Projects</span>
              </div>
              <div className="sidebar-nav-item">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4H16V16H4V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 8H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Artifacts</span>
              </div>
              <div className="sidebar-nav-item">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3L4 10L12 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 3L8 10L16 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Code</span>
              </div>
            </div>
          ) : (
            <div className="sidebar-icons-collapsed">
              <div className="sidebar-icon active">
                <div className="icon-circle orange">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <div className="sidebar-icon">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 3C6.13401 3 3 6.13401 3 10C3 13.866 6.13401 17 10 17C13.866 17 17 13.866 17 10C17 6.13401 13.866 3 10 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 7V10M10 13H10.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="sidebar-icon">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="6" height="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="11" y="3" width="6" height="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="3" y="11" width="6" height="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="11" y="11" width="6" height="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="sidebar-icon">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4H16V16H4V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 8H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="sidebar-icon">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3L4 10L12 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 3L8 10L16 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          {sidebarOpen ? (
            <div className="sidebar-user-profile">
              <div className="avatar-circle">AS</div>
              <div className="user-info">
                <div className="user-name">ABHAY SINGH</div>
                <div className="user-plan">Free plan</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          ) : (
            <div className="avatar-circle">AS</div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        {/* Top Bar */}
        <div className="dashboard-topbar">
          <div className="upgrade-banner">
            <span className="upgrade-text">Free plan</span>
            <span className="upgrade-link">Upgrade</span>
          </div>
          <div className="topbar-icons">
            <div className="topbar-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 2C10.5523 2 11 2.44772 11 3V4C11 4.55228 10.5523 5 10 5C9.44772 5 9 4.55228 9 4V3C9 2.44772 9.44772 2 10 2Z" fill="currentColor" />
                <path d="M16 10C16 11.1046 15.1046 12 14 12H13V13C13 14.1046 12.1046 15 11 15H9C7.89543 15 7 14.1046 7 13V12H6C4.89543 12 4 11.1046 4 10C4 8.89543 4.89543 8 6 8H7V7C7 5.89543 7.89543 5 9 5H11C12.1046 5 13 5.89543 13 7V8H14C15.1046 8 16 8.89543 16 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        {messages.length === 0 && (
          <div className="dashboard-welcome">
            <div className="dashboard-brand">AlgoZen V1.1</div>
            <h1 className="welcome-heading">ABHAY SINGH returns!</h1>
          </div>
        )}

        {/* Messages Area */}
        {messages.length > 0 && (
          <div className="messages-container">
            {messages.map((message, index) => {
              if (message.type === 'user') {
                // Find the corresponding AI response
                const aiResponse = messages[index + 1];
                return (
                  <div key={message.id} className="conversation-turn">
                    {/* User Query */}
                    <div className="user-query">
                      <div className="query-avatar">AS</div>
                      <div className="query-text">{message.text}</div>
                    </div>

                    {/* AI Response */}
                    {aiResponse && aiResponse.type === 'ai' && (
                      <div className="ai-response">
                        <div className="response-content">
                          <div className="response-text markdown-content">
                            <AIResponseContent text={aiResponse.text} messageId={aiResponse.id} />
                          </div>
                        </div>
                        <div className="response-footer">
                          <div className="response-disclaimer">
                            AlgoZen can make mistakes. Please double-check responses.
                          </div>
                          <div className="response-actions">
                            <button className="action-btn" title="Copy">
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5.5 3.5H10.5C11.3284 3.5 12 4.17157 12 5V10C12 10.8284 11.3284 11.5 10.5 11.5H5.5C4.67157 11.5 4 10.8284 4 10V5C4 4.17157 4.67157 3.5 5.5 3.5Z" stroke="currentColor" strokeWidth="1.2" />
                                <path d="M2 6.5H1C0.447715 6.5 0 6.94772 0 7.5V13C0 13.5523 0.447715 14 1 14H6.5C7.05228 14 7.5 13.5523 7.5 13V12" stroke="currentColor" strokeWidth="1.2" />
                              </svg>
                            </button>
                            <button className="action-btn" title="Thumbs up">
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 14V8M8 8V4C8 3.44772 8.44772 3 9 3H10C10.5523 3 11 3.44772 11 4V8M8 8H4C3.44772 8 3 8.44772 3 9V12C3 12.5523 3.44772 13 4 13H11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                            <button className="action-btn" title="Thumbs down">
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 2V8M8 8V12C8 12.5523 7.55228 13 7 13H6C5.44772 13 5 12.5523 5 12V8M8 8H12C12.5523 8 13 7.55228 13 7V4C13 3.44772 12.5523 3 12 3H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                            <button className="action-btn" title="Regenerate">
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 8C2 10.2091 3.79086 12 6 12H12M12 12L10 10M12 12L10 14M14 8C14 5.79086 12.2091 4 10 4H4M4 4L6 2M4 4L6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
              return null; // AI messages are rendered with their user message
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="ai-response">
                <div className="response-content">
                  <div className="response-text markdown-content" style={{ fontStyle: 'italic', opacity: 0.7 }}>
                    🤔 Analyzing your problem and generating explanation...
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* First Input Area - Only show before first response */}
        {!messages.some(msg => msg.type === 'ai') && (
          <div className="dashboard-input-area">
            <div className="input-container input-container-top-button">
              <form onSubmit={handleSubmit}>
                <textarea
                  className="dashboard-input"
                  placeholder="Type or Paste your question here"
                  rows="1"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <div className="input-footer">
                  <div className="input-footer-left"></div>
                  <div className="input-footer-right">
                    <select className="model-selector">
                      <option>Explanation Mode</option>
                      <option>Hint Mode</option>
                      <option>Debugging Mode</option>
                      <option>Code Generation Mode</option>
                      <option>Teach Me Concept Mode</option>
                    </select>
                    <button type="submit" className="send-button">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 10L17 3L11 17L9 10L3 10Z" fill="#FF7E5F" />
                      </svg>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Upgrade Banner */}
        <div className="dashboard-upgrade-banner">
          <span>Upgrade to connect your tools to AlgoZen</span>
          <div className="banner-icon">
            <div className="dot red"></div>
            <div className="dot yellow"></div>
            <div className="dot green"></div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Second Input Area - Bottom - Only show after first response */}
        {messages.some(msg => msg.type === 'ai') && (
          <div className="dashboard-input-area dashboard-input-bottom">
            <div className="input-container">
              <form onSubmit={handleSubmit}>
                <textarea
                  className="dashboard-input"
                  placeholder="Ask Me any doubt related to this response!"
                  rows="1"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <div className="input-footer">
                  <div className="input-footer-left">
                    <button className="input-icon-btn">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                    <button className="input-icon-btn">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button className="input-icon-btn">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M8 4V8L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                  <div className="input-footer-right">
                    <select className="model-selector">
                      <option>Explanation Mode</option>
                      <option>Hint Mode</option>
                      <option>Debugging Mode</option>
                      <option>Code Generation Mode</option>
                      <option>Teach Me Concept Mode</option>
                    </select>
                    <button type="submit" className="send-button">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 10L17 3L11 17L9 10L3 10Z" fill="#FF7E5F" />
                      </svg>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Doubt Popups */}
      {doubtPopups.map((popup) => (
        <div
          key={popup.id}
          className="doubt-popup"
          style={{
            left: `${popup.position.x}px`,
            top: `${popup.position.y}px`,
            width: `${popup.size.width}px`,
            height: `${popup.size.height}px`
          }}
        >
          <div className="popup-header"
            onMouseDown={(e) => {
              if (e.target.closest('.popup-control-btn')) return;

              e.preventDefault();
              const startX = e.clientX - popup.position.x;
              const startY = e.clientY - popup.position.y;

              const handleMouseMove = (moveEvent) => {
                const newX = moveEvent.clientX - startX;
                const newY = moveEvent.clientY - startY;

                setDoubtPopups(prev => prev.map(p =>
                  p.id === popup.id
                    ? { ...p, position: { x: newX, y: newY } }
                    : p
                ));
              };

              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };

              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          >
            <div className="popup-title">Doubt {popup.doubtNumber}</div>
            <div className="popup-controls">
              <button
                className="popup-control-btn"
                onClick={() => minimizePopup(popup.id)}
                title="Minimize"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <button
                className="popup-control-btn"
                onClick={() => closePopup(popup.id)}
                title="Close"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
          <div className="popup-content">
            <div className="popup-question">
              <div className="popup-label">Your Doubt:</div>
              <div className="popup-question-text">{popup.question}</div>
            </div>
            <div className="popup-answer">
              <div className="popup-label">Answer:</div>
              {popup.answer ? (
                <div className="popup-answer-text markdown-content">
                  <ReactMarkdown>{popup.answer}</ReactMarkdown>
                </div>
              ) : (
                <div className="popup-loading">Thinking...</div>
              )}
            </div>
          </div>
          <div
            className="popup-resize-handle"
            onMouseDown={(e) => {
              e.preventDefault();
              const startX = e.clientX;
              const startY = e.clientY;
              const startWidth = popup.size.width;
              const startHeight = popup.size.height;

              const handleMouseMove = (moveEvent) => {
                const newWidth = Math.max(400, startWidth + (moveEvent.clientX - startX));
                const newHeight = Math.max(300, startHeight + (moveEvent.clientY - startY));

                setDoubtPopups(prev => prev.map(p =>
                  p.id === popup.id
                    ? { ...p, size: { width: newWidth, height: newHeight } }
                    : p
                ));
              };

              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };

              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0L0 12" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 4L4 12" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 8L8 12" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      ))}

      {/* Example Popups */}
      {examplePopups.map((popup) => (
        <div
          key={popup.id}
          className="example-popup"
          style={{
            left: `${popup.position.x}px`,
            top: `${popup.position.y}px`,
            width: `${popup.size.width}px`,
            height: `${popup.size.height}px`
          }}
        >
          <div className="popup-header"
            onMouseDown={(e) => {
              if (e.target.closest('.popup-control-btn')) return;

              e.preventDefault();
              const startX = e.clientX - popup.position.x;
              const startY = e.clientY - popup.position.y;

              const handleMouseMove = (moveEvent) => {
                const newX = moveEvent.clientX - startX;
                const newY = moveEvent.clientY - startY;

                setExamplePopups(prev => prev.map(p =>
                  p.id === popup.id
                    ? { ...p, position: { x: newX, y: newY } }
                    : p
                ));
              };

              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };

              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          >
            <div className="popup-title">Example {popup.exampleNumber}</div>
            <div className="popup-controls">
              <button
                className="popup-control-btn"
                onClick={() => minimizeExamplePopup(popup.id)}
                title="Minimize"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <button
                className="popup-control-btn"
                onClick={() => closeExamplePopup(popup.id)}
                title="Close"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
          <div className="popup-content">
            <div className="popup-question">
              <div className="popup-label">Your Request:</div>
              <div className="popup-question-text">{popup.question}</div>
            </div>
            <div className="popup-answer">
              <div className="popup-label">Examples:</div>
              {popup.answer ? (
                <div className="popup-answer-text markdown-content">
                  <ReactMarkdown>{popup.answer}</ReactMarkdown>
                </div>
              ) : (
                <div className="popup-loading">Generating examples...</div>
              )}
            </div>
          </div>
          <div
            className="popup-resize-handle"
            onMouseDown={(e) => {
              e.preventDefault();
              const startX = e.clientX;
              const startY = e.clientY;
              const startWidth = popup.size.width;
              const startHeight = popup.size.height;

              const handleMouseMove = (moveEvent) => {
                const newWidth = Math.max(400, startWidth + (moveEvent.clientX - startX));
                const newHeight = Math.max(300, startHeight + (moveEvent.clientY - startY));

                setExamplePopups(prev => prev.map(p =>
                  p.id === popup.id
                    ? { ...p, size: { width: newWidth, height: newHeight } }
                    : p
                ));
              };

              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };

              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0L0 12" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 4L4 12" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 8L8 12" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      ))}

      {/* Minimized Tiles Panel */}
      {minimizedTiles.length > 0 && (
        <div className="minimized-tiles-panel">
          <div className="tiles-header">Minimized Doubts</div>
          <div className="tiles-container">
            {minimizedTiles.map((tile) => (
              <div key={tile.id} className="minimized-tile">
                <div className="tile-content" onClick={() => restorePopup(tile.id)}>
                  <div className="tile-label">Doubt {tile.doubtNumber}</div>
                  <div className="tile-question">{tile.question.substring(0, 40)}...</div>
                </div>
                <button
                  className="tile-close-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTile(tile.id);
                  }}
                  title="Remove"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Minimized Example Tiles Panel */}
      {minimizedExampleTiles.length > 0 && (
        <div className="minimized-example-tiles-panel">
          <div className="tiles-header">Minimized Examples</div>
          <div className="tiles-container">
            {minimizedExampleTiles.map((tile) => (
              <div key={tile.id} className="minimized-tile">
                <div className="tile-content" onClick={() => restoreExamplePopup(tile.id)}>
                  <div className="tile-label">Example {tile.exampleNumber}</div>
                  <div className="tile-question">{tile.question.substring(0, 40)}...</div>
                </div>
                <button
                  className="tile-close-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeExampleTile(tile.id);
                  }}
                  title="Remove"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

