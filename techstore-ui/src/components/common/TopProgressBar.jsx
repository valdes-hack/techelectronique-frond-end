import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * YouTube-style top loading progress bar.
 * Appears as a sleek glowing gradient line at the very top of the window
 * when navigating between pages, just like YouTube / GitHub.
 */
const TopProgressBar = () => {
    const location = useLocation();
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Trigger quick start on route change
        setVisible(true);
        setProgress(25);

        const t1 = setTimeout(() => setProgress(65), 80);
        const t2 = setTimeout(() => setProgress(90), 180);
        const t3 = setTimeout(() => {
            setProgress(100);
            const t4 = setTimeout(() => {
                setVisible(false);
                setProgress(0);
            }, 250);
            return () => clearTimeout(t4);
        }, 320);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, [location.pathname, location.search]);

    if (!visible && progress === 0) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[999999] pointer-events-none h-[3px] bg-transparent">
            <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-200 ease-out shadow-[0_0_12px_rgba(99,102,241,0.8)]"
                style={{
                    width: `${progress}%`,
                    opacity: visible ? 1 : 0,
                    transitionProperty: 'width, opacity',
                }}
            />
        </div>
    );
};

export default TopProgressBar;
