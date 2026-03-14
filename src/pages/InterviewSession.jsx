import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import AvatarViewer from '../components/AvatarViewer';
import './InterviewSession.css';

function InterviewSession() {
    const navigate = useNavigate();
    const location = useLocation();
    const { companyName, roleTitle, selectedCamera, selectedMic } = location.state || {};

    const [userName, setUserName] = useState('User');
    const [stream, setStream] = useState(null);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [isTalking, setIsTalking] = useState(false);

    const userVideoRef = useRef(null);

    // Get user name
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
            } else {
                setUserName('User');
            }
        });
        return () => unsubscribe();
    }, []);

    const getInitials = (name) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    // Timer logic
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeElapsed(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hrs > 0) {
            return `${hrs.toString().padStart(2, '0')} : ${mins.toString().padStart(2, '00')} : ${secs.toString().padStart(2, '0')}`;
        }
        return `${mins.toString().padStart(2, '0')} : ${secs.toString().padStart(2, '0')}`;
    };

    // Simulate AI talking — alternates speaking / thinking every few seconds
    useEffect(() => {
        const cycle = () => {
            // AI "speaks" for 4–7 seconds, then pauses for 2–4 seconds
            const speakDuration = Math.random() * 3000 + 4000;
            const pauseDuration = Math.random() * 2000 + 2000;

            setIsTalking(true);
            const speakTimer = setTimeout(() => {
                setIsTalking(false);
                const pauseTimer = setTimeout(cycle, pauseDuration);
                return () => clearTimeout(pauseTimer);
            }, speakDuration);
            return () => clearTimeout(speakTimer);
        };

        // Slight delay before first talking starts
        const startDelay = setTimeout(cycle, 1500);
        return () => clearTimeout(startDelay);
    }, []);

    // Initialize selected camera/mic from previous screen
    useEffect(() => {
        const startStream = async () => {
            try {
                const constraints = {
                    video: selectedCamera ? { deviceId: { exact: selectedCamera } } : true,
                    audio: selectedMic ? { deviceId: { exact: selectedMic } } : true
                };
                const newStream = await navigator.mediaDevices.getUserMedia(constraints);
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
            if (stream) stream.getTracks().forEach(track => track.stop());
            if (userVideoRef.current?.srcObject) {
                userVideoRef.current.srcObject.getTracks().forEach(t => t.stop());
                userVideoRef.current.srcObject = null;
            }
        };
    }, [selectedCamera, selectedMic]);

    const handleEndInterview = () => {
        if (stream) stream.getTracks().forEach(track => track.stop());
        if (userVideoRef.current?.srcObject) {
            userVideoRef.current.srcObject.getTracks().forEach(t => t.stop());
        }
        navigate('/interview-dashboard');
    };

    return (
        <div className="interview-session-container">
            {/* Top Navbar */}
            <header className="session-header">
                <div className="session-header-left">
                    <div className="session-logo">AlgoZen</div>
                    <div className="session-role-info">
                        {companyName && <span className="session-company-badge">{companyName}</span>}
                        <span className="session-role-name">{roleTitle || "Software Engineer"}</span>
                    </div>
                </div>
                <div className="session-header-right">
                    <div className="session-status-indicator">
                        <span className="recording-dot"></span>
                        <span className="timer-text">{formatTime(timeElapsed)}</span>
                    </div>
                    <div className="session-user-info">
                        <span className="session-user-name">{userName}</span>
                        <div className="session-avatar">{getInitials(userName)}</div>
                    </div>
                </div>
            </header>

            {/* Main Video Layout */}
            <main className="session-main-content">
                <div className="video-grid">

                    {/* AI Interviewer — Ready Player Me avatar */}
                    <div className="video-card interviewer-card">
                        <div className="avatar-canvas-wrapper">
                            <AvatarViewer isTalking={isTalking} />
                        </div>

                        {/* Talking indicator — glowing ring when AI is speaking */}
                        <div className={`avatar-talking-ring ${isTalking ? 'active' : ''}`} />

                        <div className="video-label ai-label">
                            <span className="ai-dot" />
                            AI Interviewer
                        </div>
                    </div>

                    {/* User View (Right) */}
                    <div className="video-card user-card">
                        <video
                            ref={userVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="user-video-element"
                        />
                        <div className="video-label">{userName}</div>
                    </div>

                </div>
            </main>

            {/* Bottom Controls */}
            <footer className="session-footer">
                <div className="controls-center">
                    <button className="control-btn end-call-btn" onClick={handleEndInterview}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 9C10.4 9 8.85 9.41 7.46 10.18C7.14 10.36 6.96 10.7 7 11.06L7.54 12.91C7.63 13.23 7.84 13.5 8.16 13.62C8.48 13.74 8.84 13.7 9.11 13.52L11 12.21V10H13V12.21L14.89 13.52C15.16 13.7 15.52 13.74 15.84 13.62C16.16 13.5 16.37 13.23 16.46 12.91L17 11.06C17.04 10.7 16.86 10.36 16.54 10.18C15.15 9.41 13.6 9 12 9ZM20.47 6.1C18.15 4.14 15.18 3 12 3C8.82 3 5.85 4.14 3.53 6.1C3.32 6.28 3.2 6.54 3.2 6.82V16.82C3.2 17.09 3.32 17.36 3.53 17.54C5.85 19.5 8.82 20.64 12 20.64C15.18 20.64 18.15 19.5 20.47 17.54C20.68 17.36 20.8 17.09 20.8 16.82V6.82C20.8 6.54 20.68 6.28 20.47 6.1Z" fill="white" />
                        </svg>
                        End Interview
                    </button>

                    <button className="control-btn icon-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="5" width="18" height="14" rx="2" ry="2"></rect>
                            <path d="M7 15h4M15 15h2M7 11h2M13 11h4"></path>
                        </svg>
                    </button>
                </div>
            </footer>
        </div>
    );
}

export default InterviewSession;
