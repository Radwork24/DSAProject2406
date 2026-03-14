import React from 'react';
import './LevelTransition.css'; // Reusing some base styles if needed, but mainly specific styles

const ReportModal = ({ report, onClose, onNext }) => {
    if (!report) return null;

    const isSuccess = report.status === 'Accepted';

    return (
        <div className="report-modal-overlay">
            <div className="report-card">
                <div className={`report-header ${isSuccess ? 'success' : 'error'}`}>
                    <h2>{isSuccess ? '🎉 Level Cleared!' : '⚠️ Keep Trying!'}</h2>
                    <span className="status-badge">{report.status}</span>
                </div>

                <div className="report-content">
                    {/* Stats Row */}
                    <div className="stats-row">
                        <div className="stat-item">
                            <span className="stat-label">Runtime</span>
                            <span className="stat-value">{report.stats.runtime || 'N/A'}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Memory</span>
                            <span className="stat-value">{report.stats.memory || 'N/A'}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Time Complexity</span>
                            <span className="stat-value">{report.stats.timeComplexity || 'N/A'}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Space Complexity</span>
                            <span className="stat-value">{report.stats.spaceComplexity || 'N/A'}</span>
                        </div>
                    </div>

                    {/* Feedback Section */}
                    {report.feedback && report.feedback.length > 0 && (
                        <div className="feedback-section">
                            <h3>Feedback</h3>
                            <ul>
                                {report.feedback.map((point, idx) => (
                                    <li key={idx}>{point}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Optimization Tips */}
                    {report.optimizationTips && (
                        <div className="tips-section">
                            <h3>Optimization Tips</h3>
                            <p>{report.optimizationTips}</p>
                        </div>
                    )}
                </div>

                <div className="report-actions">
                    <button className="btn-secondary" onClick={onClose}>
                        {isSuccess ? 'Review Code' : 'Try Again'}
                    </button>
                    {isSuccess && (
                        <button className="btn-primary" onClick={onNext}>
                            Next Level ➜
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportModal;
