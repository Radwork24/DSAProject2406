import { useEffect, useRef } from 'react';
import { createTimeline } from 'animejs';

const FeatureText = () => {
    const containerRef = useRef(null);
    const features = [
        { text: "Explanations mode", color: "#00ff88" }, // Cyan/Green
        { text: "Debug mode", color: "#ff4d6d" },        // Pink/Red
        { text: "Hint mode", color: "#ffd700" }          // Gold/Yellow
    ];

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Clear existing content
        container.innerHTML = '';

        // Create elements for each feature
        const featureEls = features.map((feature, index) => {
            const el = document.createElement('span');
            el.textContent = feature.text;
            el.style.position = 'absolute';
            el.style.whiteSpace = 'nowrap';
            el.style.transformOrigin = 'left center';
            el.style.opacity = index === 0 ? '1' : '0';
            el.style.transform = index === 0 ? 'scaleX(1)' : 'scaleX(0)';
            el.style.color = index === 0 ? feature.color : 'rgba(255, 255, 255, 0)';
            el.style.display = 'inline-block';
            el.style.fontWeight = '700'; // Make it bold
            el.style.fontSize = '1.2em'; // Increase size
            container.appendChild(el);
            return el;
        });

        let currentIndex = 0;
        let timeoutId;

        const animateNext = () => {
            const nextIndex = (currentIndex + 1) % features.length;
            const currentEl = featureEls[currentIndex];
            const nextEl = featureEls[nextIndex];
            const nextColor = features[nextIndex].color;

            // Reset next element state before animating in
            nextEl.style.transform = 'scaleX(0) translateX(20px)';
            nextEl.style.opacity = '0';
            nextEl.style.color = 'rgba(255, 255, 255, 0)';

            // Create timeline
            const tl = createTimeline({
                defaults: {
                    easing: 'easeInOutExpo',
                    duration: 1000
                },
                onComplete: () => {
                    currentIndex = nextIndex;
                    timeoutId = setTimeout(animateNext, 2000);
                }
            });

            // Compress current element
            tl.add(currentEl, {
                scaleX: 0,
                opacity: 0,
                color: 'rgba(255, 255, 255, 0)',
                translateX: -20,
                duration: 800
            });

            // Expand next element
            tl.add(nextEl, {
                scaleX: 1,
                opacity: 1,
                color: nextColor,
                translateX: 0,
                duration: 800
            }, '-=600'); // Overlap animations
        };

        // Start animation loop after initial delay
        timeoutId = setTimeout(animateNext, 2000);

        return () => {
            clearTimeout(timeoutId);
        };
    }, []);

    return (
        <span
            ref={containerRef}
            className="feature-text-container"
            style={{
                display: 'inline-block',
                position: 'relative',
                width: '300px', // Increased width for larger text
                height: '1.2em',
                verticalAlign: 'bottom',
                marginLeft: '10px'
            }}
        />
    );
};

export default FeatureText;
