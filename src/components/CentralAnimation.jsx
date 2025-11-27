import { useEffect, useRef } from 'react';
import { animate } from 'animejs';

const CentralAnimation = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const svg = canvasRef.current;
        const centerX = 300;
        const centerY = 300;

        // Clear any existing content
        svg.innerHTML = '';

        // Create defs for gradients
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

        // Main ring gradient
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', 'ringGradient');
        gradient.setAttribute('gradientUnits', 'userSpaceOnUse');
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '100%');
        gradient.setAttribute('y2', '100%');

        const stops = [
            { offset: '0%', color: '#00ff88' },
            { offset: '25%', color: '#ffff00' },
            { offset: '50%', color: '#ff4444' },
            { offset: '75%', color: '#ff8800' },
            { offset: '100%', color: '#00ffff' }
        ];

        stops.forEach(stop => {
            const stopEl = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stopEl.setAttribute('offset', stop.offset);
            stopEl.setAttribute('style', `stop-color:${stop.color};stop-opacity:1`);
            gradient.appendChild(stopEl);
        });

        defs.appendChild(gradient);
        svg.appendChild(defs);

        // Main gradient ring
        const mainRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        mainRing.setAttribute('cx', centerX);
        mainRing.setAttribute('cy', centerY);
        mainRing.setAttribute('r', 240);
        mainRing.setAttribute('fill', 'none');
        mainRing.setAttribute('stroke', 'url(#ringGradient)');
        mainRing.setAttribute('stroke-width', '3');
        mainRing.classList.add('main-ring');
        svg.appendChild(mainRing);

        // Outer tick marks circle
        const outerTicksRadius = 230;
        const numOuterTicks = 120;
        for (let i = 0; i < numOuterTicks; i++) {
            const angle = (i / numOuterTicks) * Math.PI * 2;
            const x1 = centerX + Math.cos(angle) * outerTicksRadius;
            const y1 = centerY + Math.sin(angle) * outerTicksRadius;
            const x2 = centerX + Math.cos(angle) * (outerTicksRadius - 8);
            const y2 = centerY + Math.sin(angle) * (outerTicksRadius - 8);

            const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            tick.setAttribute('x1', x1);
            tick.setAttribute('y1', y1);
            tick.setAttribute('x2', x2);
            tick.setAttribute('y2', y2);
            tick.setAttribute('stroke', i % 10 === 0 ? '#666' : '#444');
            tick.setAttribute('stroke-width', i % 10 === 0 ? '2' : '1');
            tick.classList.add('outer-tick');
            svg.appendChild(tick);
        }

        // Inner tick marks circle
        const innerTicksRadius = 200;
        const numInnerTicks = 80;
        for (let i = 0; i < numInnerTicks; i++) {
            const angle = (i / numInnerTicks) * Math.PI * 2;
            const x1 = centerX + Math.cos(angle) * innerTicksRadius;
            const y1 = centerY + Math.sin(angle) * innerTicksRadius;
            const x2 = centerX + Math.cos(angle) * (innerTicksRadius - 6);
            const y2 = centerY + Math.sin(angle) * (innerTicksRadius - 6);

            const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            tick.setAttribute('x1', x1);
            tick.setAttribute('y1', y1);
            tick.setAttribute('x2', x2);
            tick.setAttribute('y2', y2);
            tick.setAttribute('stroke', '#555');
            tick.setAttribute('stroke-width', '1');
            tick.classList.add('inner-tick');
            svg.appendChild(tick);
        }

        // Dark background circle
        const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        bgCircle.setAttribute('cx', centerX);
        bgCircle.setAttribute('cy', centerY);
        bgCircle.setAttribute('r', 180);
        bgCircle.setAttribute('fill', '#1a1a1a');
        svg.appendChild(bgCircle);

        // Gray overlay circles
        const grayCircle1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        grayCircle1.setAttribute('cx', centerX - 40);
        grayCircle1.setAttribute('cy', centerY);
        grayCircle1.setAttribute('r', 100);
        grayCircle1.setAttribute('fill', '#333');
        grayCircle1.setAttribute('opacity', '0.5');
        svg.appendChild(grayCircle1);

        const grayCircle2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        grayCircle2.setAttribute('cx', centerX + 40);
        grayCircle2.setAttribute('cy', centerY);
        grayCircle2.setAttribute('r', 100);
        grayCircle2.setAttribute('fill', '#444');
        grayCircle2.setAttribute('opacity', '0.5');
        svg.appendChild(grayCircle2);

        // Red diamond shape with horizontal lines
        const diamondGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        diamondGroup.classList.add('diamond-group');

        const diamondSize = 120;
        const numLines = 40;
        const lineSpacing = diamondSize / numLines;

        for (let i = 0; i < numLines; i++) {
            const y = centerY - diamondSize / 2 + i * lineSpacing;
            const distFromCenter = Math.abs(y - centerY);
            const width = diamondSize - distFromCenter;

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', centerX - width / 2);
            line.setAttribute('y1', y);
            line.setAttribute('x2', centerX + width / 2);
            line.setAttribute('y2', y);
            line.setAttribute('stroke', '#ff4444');
            line.setAttribute('stroke-width', '2');
            line.setAttribute('opacity', '0.8');
            line.classList.add('diamond-line');
            diamondGroup.appendChild(line);
        }
        svg.appendChild(diamondGroup);

        // Animated dots on the main ring
        const numDots = 12;
        const dots = [];
        for (let i = 0; i < numDots; i++) {
            const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dot.setAttribute('r', '4');
            dot.setAttribute('fill', '#ff4444');
            dot.classList.add('animated-dot');
            svg.appendChild(dot);
            dots.push(dot);
        }

        // Arc decorations
        const numArcs = 3;
        for (let i = 0; i < numArcs; i++) {
            const arcRadius = 250 + i * 15;
            const arc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const startAngle = Math.PI * 0.6;
            const endAngle = Math.PI * 0.9;

            const x1 = centerX + Math.cos(startAngle) * arcRadius;
            const y1 = centerY + Math.sin(startAngle) * arcRadius;
            const x2 = centerX + Math.cos(endAngle) * arcRadius;
            const y2 = centerY + Math.sin(endAngle) * arcRadius;

            arc.setAttribute('d', `M ${x1} ${y1} A ${arcRadius} ${arcRadius} 0 0 1 ${x2} ${y2}`);
            arc.setAttribute('fill', 'none');
            arc.setAttribute('stroke', '#ff8800');
            arc.setAttribute('stroke-width', '2');
            arc.setAttribute('opacity', '0.6');
            arc.classList.add('arc-decoration');
            svg.appendChild(arc);
        }

        // Animations using Anime.js v4 API
        // Rotate the main ring gradient
        animate('.main-ring', {
            rotate: 360,
            duration: 20000,
            ease: 'linear',
            loop: true
        });

        // Rotate diamond group
        animate('.diamond-group', {
            rotate: 360,
            duration: 8000,
            ease: 'linear',
            loop: true,
            transformOrigin: `${centerX}px ${centerY}px`
        });

        // Animate dots around the ring
        let dotProgress = 0;
        const updateDots = () => {
            dotProgress = (dotProgress + 0.5) % 360;
            dots.forEach((dot, index) => {
                const angle = ((dotProgress + (index * (360 / numDots))) % 360) * (Math.PI / 180);
                const x = centerX + Math.cos(angle) * 240;
                const y = centerY + Math.sin(angle) * 240;
                dot.setAttribute('cx', x);
                dot.setAttribute('cy', y);
            });
            requestAnimationFrame(updateDots);
        };
        updateDots();

        // Pulse the gray circles
        animate([grayCircle1, grayCircle2], {
            opacity: [0.3, 0.6],
            duration: 2000,
            ease: 'inOutSine',
            alternate: true,
            loop: true
        });

        // Rotate outer ticks slowly
        animate('.outer-tick', {
            rotate: 360,
            duration: 40000,
            ease: 'linear',
            loop: true,
            transformOrigin: `${centerX}px ${centerY}px`
        });

        // Rotate inner ticks in opposite direction
        animate('.inner-tick', {
            rotate: -360,
            duration: 30000,
            ease: 'linear',
            loop: true,
            transformOrigin: `${centerX}px ${centerY}px`
        });

        // Pulse arc decorations
        const arcs = document.querySelectorAll('.arc-decoration');
        arcs.forEach((arc, index) => {
            animate(arc, {
                opacity: [0.3, 0.8],
                duration: 3000,
                ease: 'inOutSine',
                alternate: true,
                loop: true,
                delay: index * 500
            });
        });

    }, []);

    return (
        <svg
            ref={canvasRef}
            id="animation-canvas"
            viewBox="0 0 600 600"
            xmlns="http://www.w3.org/2000/svg"
        />
    );
};

export default CentralAnimation;
