'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface DropdownOption {
    value: string;
    label: string;
    icon?: string;
    iconUrl?: string;
    size?: 'small' | 'normal';
}

interface CustomDropdownProps {
    options: DropdownOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
}

export default function CustomDropdown({ options, value, onChange, placeholder = 'Select...', label }: CustomDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="input-group">
            {label && <div className="section-label">{label}</div>}
            <div ref={dropdownRef} style={{ position: 'relative' }}>
                {/* Dropdown Button */}
                <div
                    className="input-wrapper"
                    onClick={() => setIsOpen(!isOpen)}
                    style={{ cursor: 'pointer' }}
                >
                    <div
                        className="input-field"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            paddingRight: '40px',
                            cursor: 'pointer'
                        }}
                    >
                        {selectedOption ? (
                            <>
                                <span style={{ flex: 1, color: '#fff' }}>{selectedOption.label}</span>
                                {(selectedOption.icon || selectedOption.iconUrl) && (
                                    <div
                                        style={{
                                            width: selectedOption.size === 'small' ? '40px' : '50px',
                                            height: selectedOption.size === 'small' ? '40px' : '50px',
                                            borderRadius: '8px',
                                            background: selectedOption.iconUrl ? 'transparent' : '#222',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            color: '#888',
                                            flexShrink: 0,
                                            overflow: 'hidden',
                                            padding: selectedOption.iconUrl ? (selectedOption.size === 'small' ? '6px' : '8px') : '6px'
                                        }}
                                    >
                                        {selectedOption.iconUrl ? (
                                            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                                <Image
                                                    src={selectedOption.iconUrl}
                                                    alt={selectedOption.label}
                                                    fill
                                                    style={{
                                                        objectFit: 'contain',
                                                        maxWidth: '100%',
                                                        maxHeight: '100%'
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            selectedOption.icon
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <span style={{ color: '#666' }}>{placeholder}</span>
                        )}

                        {/* Dropdown Arrow */}
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#888"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                                position: 'absolute',
                                right: '16px',
                                transition: 'transform 0.2s',
                                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                            }}
                        >
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                </div>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            left: 0,
                            right: 0,
                            background: '#1a1a1a',
                            border: '1px solid #333',
                            borderRadius: '12px',
                            maxHeight: '300px',
                            overflowY: 'auto',
                            zIndex: 1000,
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                            animation: 'slideDown 0.2s ease-out'
                        }}
                    >
                        {options.map((option) => (
                            <div
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                style={{
                                    padding: '12px 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    cursor: 'pointer',
                                    background: value === option.value ? '#222' : 'transparent',
                                    borderBottom: '1px solid #222',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    if (value !== option.value) {
                                        e.currentTarget.style.background = '#1f1f1f';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (value !== option.value) {
                                        e.currentTarget.style.background = 'transparent';
                                    }
                                }}
                            >
                                <span style={{ flex: 1, color: '#fff', fontSize: '16px', fontWeight: '500' }}>
                                    {option.label}
                                </span>
                                {value === option.value && (
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#4CAF50"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        style={{ marginRight: '8px' }}
                                    >
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                )}
                                {(option.icon || option.iconUrl) && (
                                    <div
                                        style={{
                                            width: option.size === 'small' ? '40px' : '50px',
                                            height: option.size === 'small' ? '40px' : '50px',
                                            borderRadius: '8px',
                                            background: option.iconUrl ? 'transparent' : '#2a2a2a',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            color: '#888',
                                            flexShrink: 0,
                                            overflow: 'hidden',
                                            padding: option.iconUrl ? (option.size === 'small' ? '6px' : '8px') : '6px'
                                        }}
                                    >
                                        {option.iconUrl ? (
                                            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                                <Image
                                                    src={option.iconUrl}
                                                    alt={option.label}
                                                    fill
                                                    style={{
                                                        objectFit: 'contain',
                                                        maxWidth: '100%',
                                                        maxHeight: '100%'
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            option.icon
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`
            @keyframes slideDown {
               from {
                  opacity: 0;
                  transform: translateY(-10px);
               }
               to {
                  opacity: 1;
                  transform: translateY(0);
               }
            }
         `}</style>
        </div>
    );
}
