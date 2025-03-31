import { useEffect, useRef, useState, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const PaperPlaneBackground = () => {
  const { darkMode } = useContext(ThemeContext);
  console.log("PaperPlaneBackground: darkMode =", darkMode);

  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const planesRef = useRef([]);
  const animationFrameRef = useRef(null);
  const lastPlaneTimeRef = useRef(Date.now());
  const isInitializedRef = useRef(false);

  // ---------------------------
  // 1. Setup / Resize Handling
  // ---------------------------
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const width = window.innerWidth;
        const height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        setDimensions({ width, height });

        // Create initial planes if not already done
        if (!isInitializedRef.current && width > 0) {
          const initialCount = Math.floor(Math.random() * 4) + 5;
          for (let i = 0; i < initialCount; i++) {
            const plane = createPlane();
            // Randomize starting position
            plane.x = Math.random() * width;
            plane.y = Math.random() * height * 0.8 + height * 0.1;
            planesRef.current.push(plane);
          }
          isInitializedRef.current = true;
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // ---------------------------
  // 2. Track Mouse Movement
  // ---------------------------
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // ---------------------------
  // 3. Plane Drawing (Side View)
  // ---------------------------
  const drawPlane = (ctx, plane) => {
    const { x, y, rotation, size, color } = plane;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(size * 0.5, size * 0.5); // Scale down for subtlety
    
    // LinkedIn colors with transparency for subtlety
    const logoColor = darkMode ? 
      'rgba(120, 190, 255, 0.3)' : // Light blue in dark mode
      'rgba(10, 102, 194, 0.25)';   // LinkedIn blue in light mode
    
    // Draw the standard LinkedIn logo (rounded square with "in")
    // Rounded square background
    ctx.beginPath();
    ctx.roundRect(-20, -20, 40, 40, 8);
    ctx.fillStyle = logoColor;
    ctx.fill();
    
    // Draw the "in" text
    ctx.fillStyle = darkMode ? 
      'rgba(0, 0, 0, 0.5)' : // Dark text in dark mode
      'rgba(255, 255, 255, 0.7)'; // White text in light mode
    
    // Letter "i"
    ctx.beginPath();
    ctx.rect(-12, -8, 4, 16);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(-10, -12, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Letter "n"
    ctx.beginPath();
    ctx.rect(-2, -8, 4, 16);
    ctx.fill();
    
    // Curved part of "n"
    ctx.beginPath();
    ctx.moveTo(2, -8);
    ctx.lineTo(6, -8);
    ctx.quadraticCurveTo(12, -8, 12, -2);
    ctx.lineTo(12, 8);
    ctx.lineTo(8, 8);
    ctx.lineTo(8, -2);
    ctx.quadraticCurveTo(8, -4, 6, -4);
    ctx.lineTo(2, -4);
    ctx.closePath();
    ctx.fill();
    
    // Add subtle outline
    ctx.beginPath();
    ctx.roundRect(-20, -20, 40, 40, 8);
    ctx.strokeStyle = darkMode ? 
      'rgba(150, 210, 255, 0.2)' : // Light blue outline in dark mode
      'rgba(10, 102, 194, 0.15)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    
    ctx.restore();
  };
  

  // ---------------------------
  // 4. Create a New Plane
  // ---------------------------
  const createPlane = () => {
    const side = Math.random() > 0.5 ? 'left' : 'right';
    const y = Math.random() * dimensions.height * 0.7 + dimensions.height * 0.15;
    const size = Math.random() * 0.5 + 0.8;
    const speed = Math.random() * 2 + 3;

    let color;
    if (darkMode) {
      // Brighter colors for dark mode
      const brightness = Math.floor(Math.random() * 55 + 200); // 200-255 range
      color = `rgb(${brightness}, ${brightness}, 255)`;
      console.log("Creating dark mode plane with color:", color);
    } else {
      // Lighter blue or variation for light mode
      const blueShade = Math.floor(Math.random() * 30 + 200);
      color = `rgb(${blueShade}, ${blueShade + 20}, 255)`;
      console.log("Creating light mode plane with color:", color);
    }

    return {
      x: side === 'left' ? -50 : dimensions.width + 50,
      y,
      rotation: side === 'left' ? 0 : Math.PI, // Facing right if from left, left if from right
      size,
      speed: side === 'left' ? speed : -speed,
      color,
      wobble: {
        amplitude: Math.random() * 0.8 + 0.3,
        frequency: Math.random() * 0.015 + 0.005,
        offset: Math.random() * Math.PI * 2
      },
      active: true
    };
  };

  // ---------------------------
  // 5. Main Animation Loop
  // ---------------------------
  useEffect(() => {
    if (!canvasRef.current || !dimensions.width) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      const now = Date.now();
      // Randomly spawn new planes every ~1-2 seconds
      if (now - lastPlaneTimeRef.current > Math.random() * 1000 + 1000) {
        const planeCount = Math.random() < 0.25 ? 2 : 1;
        for (let i = 0; i < planeCount; i++) {
          planesRef.current.push(createPlane());
        }
        lastPlaneTimeRef.current = now;
      }

      // Update and draw each plane
      planesRef.current = planesRef.current.filter((plane) => {
        plane.x += plane.speed;
        const time = now * 0.001;
        // Simple wobble on the y-axis
        plane.y += Math.sin(time * plane.wobble.frequency + plane.wobble.offset) * plane.wobble.amplitude;

        // Mouse repulsion effect
        const dx = mousePosition.x - plane.x;
        const dy = mousePosition.y - plane.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 200) {
          const angle = Math.atan2(dy, dx);
          const repelForce = (200 - distance) / 2000;
          plane.x -= Math.cos(angle) * repelForce * 10;
          plane.y -= Math.sin(angle) * repelForce * 10;

          // Slight rotation away from mouse
          const baseRotation = plane.speed > 0 ? 0 : Math.PI;
          const targetRotation = baseRotation + (Math.PI / 12) * Math.sin(angle);
          plane.rotation = plane.rotation * 0.95 + targetRotation * 0.05;
        } else {
          // Gradually return to default rotation
          const targetRotation = plane.speed > 0 ? 0 : Math.PI;
          plane.rotation = plane.rotation * 0.98 + targetRotation * 0.02;
        }

        // Draw the plane
        drawPlane(ctx, plane);

        // Keep the plane if it's still on screen (+ some margin)
        return plane.x > -100 && plane.x < dimensions.width + 100;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [dimensions, mousePosition, darkMode]);

  // ---------------------------
  // 6. Render the Canvas
  // ---------------------------
  return (
    <canvas
      ref={canvasRef}
      className="paper-plane-background"
      style={{
        display: 'block',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
        opacity: 1,
        visibility: 'visible',
      }}
    />
  );
};

export default PaperPlaneBackground;
