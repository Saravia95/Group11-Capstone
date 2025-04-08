// BeatVisualizer.tsx
import React, { useRef, useEffect, useState } from 'react';
import socketClient from '../config/socketIOClient';

interface BeatVisualizerProps {
  width?: number;
  height?: number;
}

const BeatVisualizer: React.FC<BeatVisualizerProps> = ({ width = 800, height = 800 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [position, setPosition] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [trackID, setTrackID] = useState<string>('');

  const [beatInterval, setBeatInterval] = useState<number>(0);

  const particlesRef = useRef<
    {
      x: number;
      y: number;
      radius: number;
      speed: number;
      life: number;
      color: string;
      angle: number;
    }[]
  >([]);

  useEffect(() => {}, []);

  useEffect(() => {
    socketClient.on(
      'audioData',
      (data: {
        track_id: string;
        track_position: number;
        track_duration: number;
        track_beat_interval: number;
      }) => {
        console.log('Received audio data:', data.track_position);
        setTrackID(data.track_id);
        setPosition(data.track_position);
        setDuration(data.track_duration);
        setBeatInterval(data.track_beat_interval);
        // setTimeout(() => setPosition(0), 1000);
        // setTimeout(() => setDuration(0), 1000);
        // setTimeout(() => setBeatInterval(2), 1000);
      },
    );
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = width / 2;
    const centerY = height / 2;
    let rotation = 0;

    const addParticles = (count: number, boost: number) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + boost;
        particlesRef.current.push({
          x: centerX,
          y: centerY,
          radius: Math.random() * 5 + 2,
          speed,
          life: 1.0,
          color: `hsl(${Math.random() * 360}, 100%, 50%)`,
          angle,
        });
      }
    };

    const updateVisualization = () => {
      console.log(position);
      const progress = isNaN(position / duration) ? 0 : position / duration;
      const hue = progress * 360; // Hue based on progress from 0 to 360
      const pulse = Math.sin(progress * Math.PI * 2) * 0.5 + 0.5; // Smooth sine wave oscillation from 0 to 1 based on progress

      // Scale the visualization based on pulse
      const scaleFactor = 1 + (pulse * 0.8 - 0.4); // scale between 0.6 and 1.4

      // Fill the canvas with a fading background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, width * scaleFactor, height * scaleFactor);

      // Add particles (optional based on your logic)
      if (position > 0) {
        // addParticles(20, position / 20);
      }

      particlesRef.current = particlesRef.current.filter((p) => p.life > 0);
      particlesRef.current.forEach((p) => {
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;
        p.life -= 0.02;
        p.radius *= 0.98;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.closePath();
      });

      rotation += 0.02;

      for (let i = 0; i < 5; i++) {
        const baseRadius = width / 4 + i * 10 + pulse * 20;
        let radius = baseRadius + position * 2;

        // Ensure radius is valid
        if (isNaN(radius) || !isFinite(radius)) {
          console.error(
            'Invalid radius value:',
            radius,
            'Base radius:',
            baseRadius,
            'Pulse:',
            pulse,
            'Position:',
            position,
          );
          radius = 100; // Fallback value for radius
        }

        let validHue = hue + i * 20;
        let validPulse = pulse * 0.8 + 0.2;

        // Ensure hue and pulse are valid numbers
        if (isNaN(validHue) || !isFinite(validHue)) {
          console.error('Invalid hue value:', validHue);
          validHue = 0; // Fallback hue value
        }

        if (isNaN(validPulse) || !isFinite(validPulse)) {
          console.error('Invalid pulse value:', validPulse);
          validPulse = 0.1; // Fallback pulse value
        }

        // Create the gradient with valid values
        const gradient = ctx.createRadialGradient(
          centerX,
          centerY,
          radius - 5,
          centerX,
          centerY,
          radius + 5,
        );

        const colorStop1 = `hsla(${validHue}, 80%, 50%, 0)`;
        const colorStop2 = `hsla(${validHue}, 80%, 70%, ${validPulse})`;
        const colorStop3 = `hsla(${validHue}, 80%, 50%, 0)`;

        gradient.addColorStop(0, colorStop1);
        gradient.addColorStop(0.5, colorStop2);
        gradient.addColorStop(1, colorStop3);

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, rotation + i * 0.5, rotation + i * 0.5 + Math.PI * 1.5);
        ctx.lineWidth = 20 + position / 5;
        ctx.strokeStyle = gradient;
        ctx.stroke();
        ctx.closePath();
      }

      // Request the next frame for animation
      requestAnimationFrame(updateVisualization);
    };

    // Call updateVisualization to start the animation loop
    updateVisualization();

    return () => {};
  }, [position, duration, beatInterval]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        background: '#000',
        borderRadius: '50%',
        position: 'absolute',
        top: 150,
        left: 150,
        zIndex: -1,
      }}
    />
  );
};

export default BeatVisualizer;
