'use client';

import React from 'react';
import Image from 'next/image';

interface NotificationBarProps {
    show: boolean;
    title: string;
    message: string;
    onClose: () => void;
}

export default function NotificationBar({ show, title, message, onClose }: NotificationBarProps) {
    return (
        <div
            style={{
                position: 'fixed',
                top: '20px',
                left: show ? '20px' : '-450px',
                zIndex: 9999,
                transition: 'left 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                maxWidth: '420px',
                width: '100%'
            }}
        >
            <div
                style={{
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Gradient accent bar on left */}
                <div
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '4px',
                        background: 'linear-gradient(180deg, #ff006e 0%, #8338ec 50%, #3a86ff 100%)'
                    }}
                />

                {/* nFKs Logo */}
                <div
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #ff006e 0%, #8338ec 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(255, 0, 110, 0.3)',
                        marginLeft: '8px'
                    }}
                >
                    <div style={{ position: 'relative', width: '28px', height: '28px' }}>
                        <Image src="/nfks_logo.png" alt="nFKs" fill style={{ objectFit: 'contain' }} />
                    </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                    <h4
                        style={{
                            margin: 0,
                            fontSize: '15px',
                            fontWeight: '600',
                            color: '#ffffff',
                            marginBottom: '2px',
                            letterSpacing: '-0.01em'
                        }}
                    >
                        {title}
                    </h4>
                    <p
                        style={{
                            margin: 0,
                            fontSize: '13px',
                            color: '#a0a0a0',
                            lineHeight: '1.4',
                            letterSpacing: '-0.01em'
                        }}
                    >
                        {message}
                    </p>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#666',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        borderRadius: '6px',
                        flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#666';
                        e.currentTarget.style.background = 'transparent';
                    }}
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        </div>
    );
}
