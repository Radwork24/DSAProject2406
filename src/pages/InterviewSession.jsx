import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import AvatarViewer from '../components/AvatarViewer';
import {
    generateInterviewQuestions,
    evaluateAnswer,
    generateFeedbackReport,
    speakText,
    speechToText,
    stopAllSpeech
} from '../services/interviewService';
import './InterviewSession.css';

/* ─── Interview States ─── */
const STATES = {
    LOADING: 'loading',
    GREETING: 'greeting',
    ASKING: 'asking',
    LISTENING: 'listening',
    PROCESSING: 'processing',
    EVALUATING: 'evaluating',
    TRANSITIONING: 'transitioning',
    ENDING: 'ending',
    FINISHED: 'finished',
};

function InterviewSession() {
    // ── Global cleanup ──
    useEffect(() => {
        return () => {
            stopAllSpeech();
        };
    }, []);

    const navigate = useNavigate();
    const location = useLocation();
    const { companyName, roleTitle, roundType, selectedCamera, selectedMic, resumeText, resumeFileName } = location.state || {};

    // ── User state ──
    const [userName, setUserName] = useState('User');

    // ── Media state ──
    const [stream, setStream] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const userVideoRef = useRef(null);

    // ── Timer ──
    const [timeElapsed, setTimeElapsed] = useState(0);

    // ── Avatar ──
    const [isTalking, setIsTalking] = useState(false);

    // ── Interview engine state ──
    const [interviewState, setInterviewState] = useState(STATES.LOADING);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [interviewData, setInterviewData] = useState(null); // greeting + questions from API
    const [allResults, setAllResults] = useState([]); // {question, answer, evaluation}
    const [followUpAsked, setFollowUpAsked] = useState(false);

    // ── Transcript ──
    const [transcript, setTranscript] = useState([]);
    const transcriptEndRef = useRef(null);

    // ── Recording ──
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const silenceTimerRef = useRef(null);
    const analyserRef = useRef(null);
    const silenceStartRef = useRef(null);

    // ── Feedback ──
    const [feedbackData, setFeedbackData] = useState(null);

    // ── Status text ──
    const [statusText, setStatusText] = useState('Preparing your interview...');

    // ── Prevent double-execution ──
    const engineRunningRef = useRef(false);

    // ════════════════════════════════════════════════════════════════
    //  USER AUTH
    // ════════════════════════════════════════════════════════════════
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists() && docSnap.data().name) {
                        setUserName(docSnap.data().name);
                    } else if (user.displayName) {
                        setUserName(user.displayName);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    if (user.displayName) setUserName(user.displayName);
                }
            }
        });
        return () => unsubscribe();
    }, []);

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    // ════════════════════════════════════════════════════════════════
    //  TIMER
    // ════════════════════════════════════════════════════════════════
    useEffect(() => {
        if (interviewState === STATES.FINISHED) return;
        const timer = setInterval(() => setTimeElapsed(prev => prev + 1), 1000);
        return () => clearInterval(timer);
    }, [interviewState]);

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hrs > 0) {
            return `${hrs.toString().padStart(2, '0')} : ${mins.toString().padStart(2, '0')} : ${secs.toString().padStart(2, '0')}`;
        }
        return `${mins.toString().padStart(2, '0')} : ${secs.toString().padStart(2, '0')}`;
    };

    // ════════════════════════════════════════════════════════════════
    //  CAMERA / MIC STREAM
    // ════════════════════════════════════════════════════════════════
    useEffect(() => {
        let activeStream = null;
        const startStream = async () => {
            try {
                const constraints = {
                    video: selectedCamera ? { deviceId: { exact: selectedCamera } } : true,
                    audio: selectedMic ? { deviceId: { exact: selectedMic } } : true
                };
                const newStream = await navigator.mediaDevices.getUserMedia(constraints);
                activeStream = newStream;
                setStream(newStream);
                if (userVideoRef.current) {
                    userVideoRef.current.srcObject = newStream;
                }
            } catch (err) {
                console.error("Error starting stream in session.", err);
            }
        };
        startStream();
        return () => {
            if (activeStream) activeStream.getTracks().forEach(track => track.stop());
        };
    }, [selectedCamera, selectedMic]);

    // ════════════════════════════════════════════════════════════════
    //  ADD TO TRANSCRIPT
    // ════════════════════════════════════════════════════════════════
    const addToTranscript = useCallback((role, text) => {
        setTranscript(prev => [...prev, {
            role,
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
    }, []);

    // Auto-scroll transcript
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);

    // ════════════════════════════════════════════════════════════════
    //  AUDIO RECORDING (for STT)
    // ════════════════════════════════════════════════════════════════
    const startRecording = useCallback(() => {
        if (!stream) return;

        const audioStream = new MediaStream(stream.getAudioTracks());
        const mediaRecorder = new MediaRecorder(audioStream, {
            mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : 'audio/webm'
        });

        audioChunksRef.current = [];
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
            }
        };

        mediaRecorder.start(250); // Collect data every 250ms
        setIsRecording(true);

        // ── Silence detection via AnalyserNode ──
        try {
            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(audioStream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 512;
            source.connect(analyser);
            analyserRef.current = analyser;
            silenceStartRef.current = null;

            const checkSilence = () => {
                if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') return;

                const dataArray = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(dataArray);

                const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

                if (average < 5) {
                    // Silence detected
                    if (!silenceStartRef.current) {
                        silenceStartRef.current = Date.now();
                    } else if (Date.now() - silenceStartRef.current > 8000) {
                        // 8 seconds of silence → stop recording
                        stopRecording();
                        return;
                    }
                } else {
                    silenceStartRef.current = null;
                }

                silenceTimerRef.current = requestAnimationFrame(checkSilence);
            };

            silenceTimerRef.current = requestAnimationFrame(checkSilence);
        } catch (err) {
            console.warn('Silence detection unavailable:', err);
        }
    }, [stream]);

    const stopRecording = useCallback(() => {
        if (silenceTimerRef.current) {
            cancelAnimationFrame(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }

        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
    }, []);

    // ════════════════════════════════════════════════════════════════
    //  CONVERSATION FLOW ENGINE
    // ════════════════════════════════════════════════════════════════
    useEffect(() => {
        if (interviewState !== STATES.LOADING) return;
        if (engineRunningRef.current) return;
        engineRunningRef.current = true;

        const initInterview = async () => {
            setStatusText('Generating interview questions...');
            try {
                const data = await generateInterviewQuestions(
                    companyName,
                    roleTitle,
                    5,
                    resumeText || '',
                    resumeFileName || '',
                    roundType || 'Technical Round'
                );
                setInterviewData(data);
                setQuestions(data.questions || []);
                setInterviewState(STATES.GREETING);
            } catch (err) {
                console.error('Failed to generate questions:', err);
                setStatusText('Error generating questions. Please try again.');
            }
        };

        initInterview();
    }, [interviewState, companyName, roleTitle]);

    // ── GREETING → speak welcome message ──
    useEffect(() => {
        if (interviewState !== STATES.GREETING || !interviewData) return;

        const greet = async () => {
            const greeting = interviewData.greeting || `Hello! Welcome to your interview. Let's get started.`;
            setStatusText('AI is greeting you...');
            addToTranscript('ai', greeting);

            try {
                await speakText(greeting, () => setIsTalking(true), () => setIsTalking(false));
            } catch (err) {
                console.warn('TTS greeting failed, continuing without audio:', err);
                setIsTalking(false);
            }

            // Small pause before first question
            await new Promise(r => setTimeout(r, 1000));
            setInterviewState(STATES.ASKING);
        };

        greet();
    }, [interviewState, interviewData]);

    // ── ASKING → speak current question ──
    useEffect(() => {
        if (interviewState !== STATES.ASKING || questions.length === 0) return;

        const askQuestion = async () => {
            const question = questions[currentQuestionIndex];
            if (!question) {
                setInterviewState(STATES.ENDING);
                return;
            }

            const questionText = question.question;
            const qNum = currentQuestionIndex + 1;
            setStatusText(`Question ${qNum} of ${questions.length}`);
            addToTranscript('ai', questionText);

            try {
                await speakText(questionText, () => setIsTalking(true), () => setIsTalking(false));
            } catch (err) {
                console.warn('TTS question failed:', err);
                setIsTalking(false);
            }

            // Transition to listening
            await new Promise(r => setTimeout(r, 500));
            setInterviewState(STATES.LISTENING);
        };

        askQuestion();
    }, [interviewState, currentQuestionIndex, questions]);

    // ── LISTENING → start recording ──
    useEffect(() => {
        if (interviewState !== STATES.LISTENING) return;
        setStatusText('Your turn — speak your answer...');
        startRecording();
    }, [interviewState, startRecording]);

    // ── When recording stops → process the audio ──
    useEffect(() => {
        if (interviewState !== STATES.LISTENING) return;
        if (isRecording) return; // Still recording

        // Recording just stopped
        if (audioChunksRef.current.length === 0) return;

        const processAudio = async () => {
            setInterviewState(STATES.PROCESSING);
            setStatusText('Transcribing your answer...');

            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            audioChunksRef.current = [];

            try {
                const transcribedText = await speechToText(audioBlob);

                if (!transcribedText || transcribedText.trim().length === 0) {
                    addToTranscript('system', 'Could not hear your answer clearly. Moving to evaluation...');
                    setInterviewState(STATES.EVALUATING);
                    return;
                }

                addToTranscript('user', transcribedText);
                setInterviewState(STATES.EVALUATING);

                // Store answer for evaluation
                window.__currentAnswer = transcribedText;
            } catch (err) {
                console.error('STT failed:', err);
                addToTranscript('system', 'Transcription failed. Moving on...');
                window.__currentAnswer = '(transcription failed)';
                setInterviewState(STATES.EVALUATING);
            }
        };

        processAudio();
    }, [interviewState, isRecording]);

    // ── EVALUATING → send answer to Groq for evaluation ──
    useEffect(() => {
        if (interviewState !== STATES.EVALUATING) return;

        const evaluate = async () => {
            setStatusText('AI is evaluating your answer...');
            const question = questions[currentQuestionIndex];
            const userAnswer = window.__currentAnswer || '(no answer)';

            try {
                const evaluation = await evaluateAnswer(question, userAnswer, allResults);

                // Save result
                const result = { question, answer: userAnswer, evaluation };
                setAllResults(prev => [...prev, result]);

                // Speak feedback
                if (evaluation.spokenFeedback) {
                    addToTranscript('ai', evaluation.spokenFeedback);
                    try {
                        await speakText(evaluation.spokenFeedback, () => setIsTalking(true), () => setIsTalking(false));
                    } catch (err) {
                        console.warn('TTS feedback failed:', err);
                        setIsTalking(false);
                    }
                }

                // Decide what's next
                if (evaluation.needsFollowUp && evaluation.followUpQuestion && !followUpAsked) {
                    // Ask follow-up (replace current question temporarily)
                    setFollowUpAsked(true);
                    const followUp = {
                        ...question,
                        question: evaluation.followUpQuestion,
                        type: 'follow_up'
                    };
                    setQuestions(prev => {
                        const updated = [...prev];
                        updated.splice(currentQuestionIndex + 1, 0, followUp);
                        return updated;
                    });
                    await new Promise(r => setTimeout(r, 800));
                    setCurrentQuestionIndex(prev => prev + 1);
                    setInterviewState(STATES.ASKING);
                } else if (currentQuestionIndex < questions.length - 1) {
                    // Next question
                    setFollowUpAsked(false);
                    await new Promise(r => setTimeout(r, 1000));
                    setCurrentQuestionIndex(prev => prev + 1);
                    setInterviewState(STATES.ASKING);
                } else {
                    // All questions done
                    setInterviewState(STATES.ENDING);
                }
            } catch (err) {
                console.error('Evaluation failed:', err);
                addToTranscript('system', 'Evaluation error. Moving to next question...');

                if (currentQuestionIndex < questions.length - 1) {
                    setCurrentQuestionIndex(prev => prev + 1);
                    setInterviewState(STATES.ASKING);
                } else {
                    setInterviewState(STATES.ENDING);
                }
            }
        };

        evaluate();
    }, [interviewState]);

    // ── ENDING → generate feedback ──
    useEffect(() => {
        if (interviewState !== STATES.ENDING) return;

        const endInterview = async () => {
            setStatusText('Generating your feedback report...');

            // Speak closing
            const closing = "That wraps up our interview. Thank you for your time! Let me put together your feedback.";
            addToTranscript('ai', closing);
            try {
                await speakText(closing, () => setIsTalking(true), () => setIsTalking(false));
            } catch (err) {
                setIsTalking(false);
            }

            // Generate feedback
            try {
                const feedback = await generateFeedbackReport(allResults, roleTitle);
                setFeedbackData(feedback);
            } catch (err) {
                console.error('Feedback generation failed:', err);
                setFeedbackData({
                    overallScore: 50,
                    overallGrade: 'C',
                    summary: 'Interview completed.',
                    categoryScores: { technicalKnowledge: 5, problemSolving: 5, communication: 5, codeQuality: 5 },
                    strengths: ['Completed the interview'],
                    areasToImprove: ['Continue practicing'],
                    recommendations: ['Try more mock interviews'],
                    closingMessage: 'Keep going, you are improving!'
                });
            }

            setInterviewState(STATES.FINISHED);
            setStatusText('Interview complete!');
        };

        endInterview();
    }, [interviewState]);

    // ════════════════════════════════════════════════════════════════
    //  CONTROLS
    // ════════════════════════════════════════════════════════════════
    const toggleMute = () => {
        if (stream) {
            stream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(prev => !prev);
        }
    };

    const toggleCamera = () => {
        if (stream) {
            stream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsCameraOff(prev => !prev);
        }
    };

    const handleEndInterview = () => {
        // Stop recording if active
        stopRecording();
        
        // Stop TTS speaking instantly
        stopAllSpeech();
        
        // Stop all tracks immediately
        if (stream) stream.getTracks().forEach(track => track.stop());
        if (userVideoRef.current?.srcObject) {
            userVideoRef.current.srcObject.getTracks().forEach(t => t.stop());
            userVideoRef.current.srcObject = null;
        }

        // Navigate away instantly so we don't get stuck
        navigate('/interview-dashboard');
    };

    const handleDoneAnswering = () => {
        if (interviewState === STATES.LISTENING && isRecording) {
            stopRecording();
        }
    };

    // ════════════════════════════════════════════════════════════════
    //  RENDER: Feedback Report Overlay
    // ════════════════════════════════════════════════════════════════
    const renderFeedback = () => {
        if (!feedbackData) return null;

        const gradeColors = {
            'A+': '#00e676', 'A': '#00e676', 'B+': '#66bb6a', 'B': '#ffca28',
            'C+': '#ffa726', 'C': '#ff7043', 'D': '#ef5350', 'F': '#d32f2f'
        };

        return (
            <div className="feedback-overlay">
                <div className="feedback-card">
                    <div className="feedback-header">
                        <h2>Interview Complete</h2>
                        <p className="feedback-subtitle">{roleTitle}{companyName ? ` at ${companyName}` : ''}</p>
                    </div>

                    <div className="feedback-score-section">
                        <div className="feedback-grade" style={{ color: gradeColors[feedbackData.overallGrade] || '#fff' }}>
                            {feedbackData.overallGrade}
                        </div>
                        <div className="feedback-score-number">{feedbackData.overallScore}/100</div>
                    </div>

                    <p className="feedback-summary">{feedbackData.summary}</p>

                    <div className="feedback-categories">
                        {Object.entries(feedbackData.categoryScores || {}).map(([key, value]) => (
                            <div key={key} className="feedback-category-item">
                                <span className="category-label">
                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                                </span>
                                <div className="category-bar-bg">
                                    <div
                                        className="category-bar-fill"
                                        style={{ width: `${value * 10}%` }}
                                    />
                                </div>
                                <span className="category-value">{value}/10</span>
                            </div>
                        ))}
                    </div>

                    <div className="feedback-lists">
                        {feedbackData.strengths?.length > 0 && (
                            <div className="feedback-list-section">
                                <h4>💪 Strengths</h4>
                                <ul>{feedbackData.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
                            </div>
                        )}
                        {feedbackData.areasToImprove?.length > 0 && (
                            <div className="feedback-list-section">
                                <h4>📈 Areas to Improve</h4>
                                <ul>{feedbackData.areasToImprove.map((s, i) => <li key={i}>{s}</li>)}</ul>
                            </div>
                        )}
                        {feedbackData.recommendations?.length > 0 && (
                            <div className="feedback-list-section">
                                <h4>💡 Recommendations</h4>
                                <ul>{feedbackData.recommendations.map((s, i) => <li key={i}>{s}</li>)}</ul>
                            </div>
                        )}
                    </div>

                    {feedbackData.closingMessage && (
                        <p className="feedback-closing">{feedbackData.closingMessage}</p>
                    )}

                    <button
                        className="feedback-done-btn"
                        onClick={() => {
                            if (stream) stream.getTracks().forEach(t => t.stop());
                            if (userVideoRef.current?.srcObject) {
                                userVideoRef.current.srcObject.getTracks().forEach(t => t.stop());
                                userVideoRef.current.srcObject = null;
                            }
                            navigate('/interview-dashboard');
                        }}
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    };

    // ════════════════════════════════════════════════════════════════
    //  RENDER
    // ════════════════════════════════════════════════════════════════
    return (
        <div className="interview-session-container">
            {/* Top Navbar */}
            <header className="session-header">
                <div className="session-header-left">
                    <div className="session-logo">AlgoZen</div>
                    <div className="session-role-info">
                        {companyName && <span className="session-company-badge">{companyName}</span>}
                        <span className="session-role-name">
                            {roleTitle || "Software Engineer"}{roundType ? ` - ${roundType}` : ''}
                        </span>
                    </div>
                </div>
                <div className="session-header-right">
                    <div className="session-status-indicator">
                        <span className="recording-dot" />
                        <span className="timer-text">{formatTime(timeElapsed)}</span>
                    </div>
                    <div className="interview-state-badge">
                        {statusText}
                    </div>
                    <div className="session-user-info">
                        <span className="session-user-name">{userName}</span>
                        <div className="session-avatar">{getInitials(userName)}</div>
                    </div>
                </div>
            </header>

            {/* Main Content: Video Grid + Transcript */}
            <main className="session-main-content">
                <div className="session-layout">
                    {/* Video Grid */}
                    <div className="video-grid">
                        {/* AI Interviewer */}
                        <div className="video-card interviewer-card">
                            <div className="avatar-canvas-wrapper">
                                <AvatarViewer isTalking={isTalking} />
                            </div>
                            <div className={`avatar-talking-ring ${isTalking ? 'active' : ''}`} />
                            <div className="video-label ai-label">
                                <span className="ai-dot" />
                                Ivan
                            </div>
                        </div>

                        {/* User View */}
                        <div className="video-card user-card">
                            <video
                                ref={userVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className="user-video-element"
                            />
                            {isCameraOff && (
                                <div className="camera-off-overlay">
                                    <div className="camera-off-avatar">{getInitials(userName)}</div>
                                    <span>Camera Off</span>
                                </div>
                            )}
                            {isRecording && (
                                <div className="user-recording-indicator">
                                    <span className="recording-pulse" />
                                    Recording...
                                </div>
                            )}
                            <div className="video-label">{userName}</div>
                        </div>
                    </div>

                    {/* Live Transcript Panel */}
                    <div className="transcript-panel">
                        <div className="transcript-header">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            Live Transcript
                            <span className="transcript-count">{transcript.length}</span>
                        </div>

                        <div className="transcript-messages">
                            {transcript.length === 0 && (
                                <div className="transcript-empty">
                                    {interviewState === STATES.LOADING
                                        ? 'Preparing questions...'
                                        : 'Conversation will appear here...'}
                                </div>
                            )}

                            {transcript.map((entry, i) => (
                                <div key={i} className={`transcript-message ${entry.role}`}>
                                    <div className="transcript-message-header">
                                        <span className="transcript-role">
                                            {entry.role === 'ai' ? 'Ivan' : entry.role === 'user' ? userName : 'System'}
                                        </span>
                                        <span className="transcript-time">{entry.timestamp}</span>
                                    </div>
                                    <p className="transcript-text">{entry.text}</p>
                                </div>
                            ))}
                            <div ref={transcriptEndRef} />
                        </div>

                        {/* Question progress */}
                        {questions.length > 0 && (
                            <div className="transcript-progress">
                                <div className="progress-bar-bg">
                                    <div
                                        className="progress-bar-fill"
                                        style={{ width: `${((currentQuestionIndex + (interviewState === STATES.FINISHED ? 1 : 0)) / questions.length) * 100}%` }}
                                    />
                                </div>
                                <span className="progress-text">
                                    {interviewState === STATES.FINISHED
                                        ? `${questions.length}/${questions.length} Complete`
                                        : `Question ${currentQuestionIndex + 1} of ${questions.length}`}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Bottom Controls */}
            <footer className="session-footer">
                <div className="controls-center">
                    {/* Mic Toggle */}
                    <button
                        className={`control-btn icon-btn ${isMuted ? 'btn-danger' : ''}`}
                        onClick={toggleMute}
                        title={isMuted ? 'Unmute' : 'Mute'}
                    >
                        {isMuted ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="1" y1="1" x2="23" y2="23" />
                                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .76-.13 1.48-.36 2.16" />
                                <line x1="12" y1="19" x2="12" y2="23" />
                                <line x1="8" y1="23" x2="16" y2="23" />
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                <line x1="12" y1="19" x2="12" y2="23" />
                                <line x1="8" y1="23" x2="16" y2="23" />
                            </svg>
                        )}
                    </button>

                    {/* Camera Toggle */}
                    <button
                        className={`control-btn icon-btn ${isCameraOff ? 'btn-danger' : ''}`}
                        onClick={toggleCamera}
                        title={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
                    >
                        {isCameraOff ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="1" y1="1" x2="23" y2="23" />
                                <path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34m-7.72-2.06a4 4 0 1 1-5.56-5.56" />
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M23 7l-7 5 7 5V7z" />
                                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                            </svg>
                        )}
                    </button>

                    {/* Done Answering Button (visible when listening) */}
                    {interviewState === STATES.LISTENING && isRecording && (
                        <button className="control-btn done-btn" onClick={handleDoneAnswering}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Done Answering
                        </button>
                    )}

                    {/* End Interview */}
                    <button className="control-btn end-call-btn" onClick={handleEndInterview}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
                            <line x1="23" y1="1" x2="1" y2="23" />
                        </svg>
                        End Interview
                    </button>
                </div>
            </footer>

            {/* Feedback Report Overlay */}
            {interviewState === STATES.FINISHED && feedbackData && renderFeedback()}
        </div>
    );
}

export default InterviewSession;
