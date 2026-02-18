import React from 'react';
import { useTheme } from '../hooks/useTheme.ts'; // Adjust path as needed

const StylingGuideline: React.FC = () => {
    const theme = useTheme();

    return (
        <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
            <h1>Styling Guidelines</h1>
            <p>This page showcases all available styles from theme.ts</p>

            {/* Colors Section */}
            <section style={{ marginBottom: '3rem' }}>
                <h2>Colors</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                    {Object.entries(theme.colors || {}).map(([key, value]) => (
                        <div key={key}>
                            <div
                                style={{
                                    width: '100%',
                                    height: '100px',
                                    backgroundColor: String(value),
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                }}
                            />
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>{key}</p>
                            <code style={{ fontSize: '0.75rem', color: '#666' }}>{String(value)}</code>
                        </div>
                    ))}
                </div>
            </section>

            {/* Typography Section */}
            <section style={{ marginBottom: '3rem' }}>
                <h2>Typography</h2>
                {theme.typography && Object.entries(theme.typography).map(([key, style]) => (
                    <div key={key} style={{ marginBottom: '1rem' }}>
                        <p style={style as React.CSSProperties}>{key} - The quick brown fox jumps over the lazy dog</p>
                        <code style={{ fontSize: '0.75rem', color: '#666' }}>{JSON.stringify(style)}</code>
                    </div>
                ))}
            </section>

            {/* Spacing Section */}
            <section style={{ marginBottom: '3rem' }}>
                <h2>Spacing</h2>
                {theme.spacing && Object.entries(theme.spacing).map(([key, value]) => (
                    <div key={key} style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div
                                style={{
                                    width: String(value),
                                    height: '20px',
                                    backgroundColor: '#007ACC',
                                    borderRadius: '2px',
                                }}
                            />
                            <span>{key}: {String(value)}</span>
                        </div>
                    </div>
                ))}
            </section>

            {/* Shadows Section */}
            <section>
                <h2>Shadows</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {theme.shadows && Object.entries(theme.shadows).map(([key, value]) => (
                        <div
                            key={key}
                            style={{
                                padding: '2rem',
                                backgroundColor: '#fff',
                                boxShadow: String(value),
                                borderRadius: '4px',
                            }}
                        >
                            <p style={{ margin: '0' }}>{key}</p>
                            <code style={{ fontSize: '0.75rem', color: '#666' }}>{String(value)}</code>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default StylingGuideline;