import React, { useRef, useEffect, useCallback } from 'react';
import characterImg from '../assets/character.png';
import './AvatarViewer.css';

/**
 * AvatarViewer — Photo-based animated interviewer
 *
 * Architecture designed for future lip-sync:
 *   - `canvasRef`  : overlay canvas for mouth animation (currently draws nothing)
 *   - `isTalking`  : when true, triggers subtle head-nod + talking wave bar
 *   - Future: pass viseme callbacks → draw mouth shapes on canvas in sync with audio
 */
function AvatarViewer({ isTalking = false, isSetup = false }) {
    const containerRef = useRef(null);

    return (
        <div
            ref={containerRef}
            className={`av-root ${isSetup ? 'av-setup' : 'av-session'} ${isTalking ? 'av-talking' : 'av-idle'}`}
        >
            {/* ── Vignette overlay (cinematic framing) */}
            <div className="av-vignette" />

            {/* ── Character photo wrapper to prevent Safari WebKit texture bleed ── */}
            <div className="av-photo-wrapper">
                <img
                    src={characterImg}
                    alt="AI Interviewer"
                    className="av-photo"
                    draggable={false}
                />
            </div>

            {/* ── Talking border glow ring */}
            <div className="av-talking-ring" />

            {/* ── Canvas overlay (lip-sync hook — currently transparent) */}
            {/*
             *  LIP SYNC TODO:
             *  1. Add `canvasRef` as ref to the <canvas> below
             *  2. In a useEffect driven by audio visemes, call:
             *       ctx.clearRect(...)
             *       ctx.drawImage(mouthShapeForViseme, x, y, w, h)
             *  3. Overlay is already positioned over the mouth region
             */}
            <canvas
                className="av-lipsync-canvas"
                aria-hidden="true"
            />

            {/* ── Voice wave bar (visible when talking) */}
            <div className="av-wave-bar">
                {[...Array(5)].map((_, i) => (
                    <span key={i} className="av-wave" style={{ '--i': i }} />
                ))}
            </div>

            {/* ── Status badge */}
            <div className="av-badge">
                <span className={`av-badge-dot ${isTalking ? 'active' : ''}`} />
                <span className="av-badge-text">
                    {isTalking ? 'Speaking...' : 'AI Interviewer'}
                </span>
            </div>
        </div>
    );
}

export default AvatarViewer;
