import React, { useState, useEffect } from "react";
import "./SplashScreen.css";

interface SplashScreenProps {
    onFadeComplete?: () => void;
    duration?: number;
}

const SplashScreen: React.FC<SplashScreenProps> = ({
    onFadeComplete,
    duration = 2500
}) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsFading(true);
        }, duration);

        const fadeTimer = setTimeout(() => {
            setIsVisible(false);
            if (onFadeComplete) onFadeComplete();
        }, duration + 800); // 800ms for CSS transition

        return () => {
            clearTimeout(timer);
            clearTimeout(fadeTimer);
        };
    }, [duration, onFadeComplete]);

    if (!isVisible) return null;

    return (
        <div className={`splash-container ${isFading ? "fade-out" : ""}`}>
            <img src="/splash_screen.png" alt="StashSnap Vault Splash Screen" className="splash-image" />
        </div>
    );
};

export default SplashScreen;
