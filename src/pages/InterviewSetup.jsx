import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import AvatarViewer from '../components/AvatarViewer';
import './InterviewSetup.css';

function InterviewSetup() {
    const navigate = useNavigate();
    const location = useLocation();
    const { companyName, roleTitle } = location.state || {};

    const [userName, setUserName] = useState('User');
    const [cameras, setCameras] = useState([]);
    const [mics, setMics] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState('');
    const [selectedMic, setSelectedMic] = useState('');
    const [stream, setStream] = useState(null);
    const [error, setError] = useState('');
    const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'prompt', 'granted', 'denied'

    const videoRef = useRef(null);

    // Get user name (same logic as Dashboard)
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

    // Get devices & start stream
    useEffect(() => {
        const initMedia = async () => {
            try {
                // Request initial permissions to get device labels
                const initialStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = devices.filter(device => device.kind === 'videoinput');
                const audioDevices = devices.filter(device => device.kind === 'audioinput');

                setCameras(videoDevices);
                setMics(audioDevices);

                if (videoDevices.length > 0) setSelectedCamera(videoDevices[0].deviceId);
                if (audioDevices.length > 0) setSelectedMic(audioDevices[0].deviceId);

                // Stop the initial stream, we'll request a specific one below or use the active handles
                if (selectedCamera || selectedMic) {
                    initialStream.getTracks().forEach(track => track.stop());
                } else {
                    setStream(initialStream);
                    if (videoRef.current) {
                        videoRef.current.srcObject = initialStream;
                    }
                }

            } catch (err) {
                console.error("Error accessing media devices.", err);

                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    setPermissionStatus('denied');
                    setError("Camera and Microphone permissions have been denied.");
                } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                    setError("No camera or microphone found on your device.");
                } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                    setError("Your camera or microphone is currently in use by another application.");
                } else {
                    setError("An error occurred while trying to access your camera and microphone.");
                }
            }
        };

        initMedia();

        // Cleanup on unmount
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Update stream when camera/mic selection changes
    useEffect(() => {
        if (!selectedCamera && !selectedMic) return;

        const startStream = async () => {
            // stop old stream
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }

            try {
                const constraints = {
                    video: selectedCamera ? { deviceId: { exact: selectedCamera } } : true,
                    audio: selectedMic ? { deviceId: { exact: selectedMic } } : true
                };

                const newStream = await navigator.mediaDevices.getUserMedia(constraints);
                setStream(newStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = newStream;
                }
            } catch (err) {
                console.error("Error updating stream.", err);
            }
        };

        startStream();

        // Cleanup function for when selectedCamera/Mic changes or component unmounts
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [selectedCamera, selectedMic]);

    const handleContinue = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        navigate('/interview-session', { state: { companyName, roleTitle, selectedCamera, selectedMic } });
    };

    return (
        <div className="interview-setup-container">
            {/* Top Navbar */}
            <header className="setup-header">
                <div className="setup-header-left">
                    <div className="setup-logo" onClick={() => navigate('/interview-dashboard')}>AlgoZen</div>
                    <div className="setup-role-info">
                        {companyName && <span className="setup-company-badge">{companyName}</span>}
                        <span className="setup-role-name">{roleTitle || "Software Engineer Interview"}</span>
                    </div>
                </div>

                <div className="setup-header-right">
                    <div className="setup-user-info">
                        <span className="setup-user-name">{userName}</span>
                        <div className="setup-avatar">{getInitials(userName)}</div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="setup-main-content">

                {/* Two-panel layout: avatar preview + camera setup */}
                <div className="setup-panels">

                    {/* Left panel — AI interviewer avatar preview */}
                    <div className="setup-avatar-preview-panel">
                        <div className="avatar-preview-badge">
                            <span className="avatar-preview-dot" />
                            Meet your interviewer
                        </div>
                        <div className="avatar-preview-canvas">
                            <AvatarViewer isTalking={false} isSetup={true} />
                        </div>
                        <p className="avatar-preview-name">Alex — AI Interviewer</p>
                    </div>

                    {/* Right panel — camera + mic + continue */}
                    <div className="setup-right-panel">
                        <div className="setup-video-section">
                            <div className="video-container">
                                {error || permissionStatus === 'denied' ? (
                                    <div className="video-error">
                                        <div className="error-icon">🔒</div>
                                        <h3>Permissions Required</h3>
                                        <p>{error || "Please allow camera and microphone access to proceed with the interview."}</p>
                                        {permissionStatus === 'denied' && (
                                            <div className="permission-instructions">
                                                <p>To enable access:</p>
                                                <ol style={{ textAlign: 'left', marginTop: '10px', fontSize: '13px', lineHeight: '1.6', color: '#8b949e' }}>
                                                    <li>Click the lock icon (🔒) in your browser's address bar.</li>
                                                    <li>Toggle "Camera" and "Microphone" to <b>Allow</b>.</li>
                                                    <li>Refresh this page.</li>
                                                </ol>
                                                <button
                                                    className="setup-continue-btn"
                                                    style={{ marginTop: '20px', width: 'auto', padding: '10px 24px' }}
                                                    onClick={() => window.location.reload()}
                                                >
                                                    Refresh Page
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="setup-video-element"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="setup-controls-section">
                            <div className="device-setup-card">
                                <h2 className="device-setup-title">Device Setup</h2>

                                <div className="device-selector-group">
                                    <label className="device-label">Camera</label>
                                    <div className="custom-select-wrapper">
                                        <select
                                            className="device-select"
                                            value={selectedCamera}
                                            onChange={(e) => setSelectedCamera(e.target.value)}
                                            disabled={cameras.length === 0}
                                        >
                                            {cameras.length === 0 && <option>No cameras found</option>}
                                            {cameras.map((camera, index) => (
                                                <option key={camera.deviceId} value={camera.deviceId}>
                                                    {camera.label || `Camera ${index + 1}`}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="select-arrow">▼</div>
                                    </div>
                                </div>

                                <div className="device-selector-group">
                                    <label className="device-label">Mic</label>
                                    <div className="custom-select-wrapper">
                                        <select
                                            className="device-select"
                                            value={selectedMic}
                                            onChange={(e) => setSelectedMic(e.target.value)}
                                            disabled={mics.length === 0}
                                        >
                                            {mics.length === 0 && <option>No microphones found</option>}
                                            {mics.map((mic, index) => (
                                                <option key={mic.deviceId} value={mic.deviceId}>
                                                    {mic.label || `Microphone ${index + 1}`}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="select-arrow">▼</div>
                                    </div>
                                </div>

                                <button
                                    className="setup-continue-btn"
                                    onClick={handleContinue}
                                    disabled={!!error || (cameras.length === 0 && mics.length === 0)}
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    </div>{/* end setup-right-panel */}

                </div>{/* end setup-panels */}
            </main>
        </div>
    );
}

export default InterviewSetup;
