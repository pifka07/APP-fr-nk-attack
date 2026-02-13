import { useState } from 'react';

export function usePullToRefresh(onRefresh) {
    const [touchStart, setTouchStart] = useState(0);
    const [pullDistance, setPullDistance] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    const handleTouchStart = (e) => {
        if (window.scrollY === 0) {
            setTouchStart(e.touches[0].clientY);
        }
    };

    const handleTouchMove = (e) => {
        if (touchStart > 0 && window.scrollY === 0) {
            const distance = e.touches[0].clientY - touchStart;
            if (distance > 0) {
                setPullDistance(Math.min(distance, 100));
            }
        }
    };

    const handleTouchEnd = async () => {
        if (pullDistance > 60) {
            setRefreshing(true);
            try {
                await onRefresh();
            } finally {
                setRefreshing(false);
                setPullDistance(0);
            }
        } else {
            setPullDistance(0);
        }
        setTouchStart(0);
    };

    return {
        touchHandlers: {
            onTouchStart: handleTouchStart,
            onTouchMove: handleTouchMove,
            onTouchEnd: handleTouchEnd
        },
        pullDistance,
        refreshing
    };
}