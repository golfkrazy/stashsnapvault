import React, { useRef, useEffect, useState } from 'react';

interface CameraPreviewProps {
    onCapture: (blob: Blob) => void;
    onCancel: () => void;
}

const CameraPreview: React.FC<CameraPreviewProps> = ({ onCapture, onCancel }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' },
                    audio: false
                });
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (err) {
                console.error('Error accessing camera:', err);
                setError('Could not access camera. Please check permissions.');
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (context) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        onCapture(blob);
                    }
                }, 'image/jpeg', 0.8);
            }
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'black',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {error ? (
                <div style={{ color: 'white', textAlign: 'center', padding: '2rem' }}>
                    <p>{error}</p>
                    <button className="btn" onClick={onCancel} style={{ marginTop: '1rem' }}>Back</button>
                </div>
            ) : (
                <>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain' }}
                    />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />

                    <div style={{
                        position: 'absolute',
                        bottom: '2rem',
                        display: 'flex',
                        gap: '2rem',
                        alignItems: 'center'
                    }}>
                        <button
                            onClick={onCancel}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                color: 'white',
                                padding: '1rem',
                                borderRadius: '50%',
                                cursor: 'pointer'
                            }}
                        >
                            ✕
                        </button>
                        <button
                            onClick={capturePhoto}
                            style={{
                                width: '70px',
                                height: '70px',
                                borderRadius: '50%',
                                border: '5px solid white',
                                background: 'rgba(255,255,255,0.3)',
                                cursor: 'pointer'
                            }}
                        />
                        <div style={{ width: '50px' }} /> {/* Spacer */}
                    </div>
                </>
            )}
        </div>
    );
};

export default CameraPreview;
