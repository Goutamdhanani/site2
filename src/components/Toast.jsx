import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

const toastData = [
  { text: '🔥 Priya from Mumbai just booked a consultation', time: '2 mins ago' },
  { text: '⚡ Rohan from Delhi started a project', time: '47 mins ago' },
  { text: '🎉 DataFlow renewed for year 3 with oddwebs', time: 'Today' },
  { text: '📱 A founder from Bangalore is viewing Mobile Apps', time: 'Now' },
  { text: '🚀 2 consultation slots remaining this month', time: 'Urgent' },
];

export default function Toast() {
  const [current, setCurrent] = useState(null);
  const toastRef = useRef(null);
  const indexRef = useRef(0);

  useEffect(() => {
    const showToast = () => {
      const data = toastData[indexRef.current % toastData.length];
      setCurrent(data);
      indexRef.current++;

      setTimeout(() => {
        if (toastRef.current) {
          gsap.fromTo(toastRef.current,
            { y: 100, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
          );
        }
      }, 50);

      setTimeout(() => {
        if (toastRef.current) {
          gsap.to(toastRef.current, {
            y: 100, opacity: 0, duration: 0.5, ease: 'power3.in',
            onComplete: () => setCurrent(null)
          });
        }
      }, 4000);
    };

    // First toast after 6 seconds
    const firstTimeout = setTimeout(showToast, 6000);
    // Then every 8 seconds
    const interval = setInterval(showToast, 8000);

    return () => {
      clearTimeout(firstTimeout);
      clearInterval(interval);
    };
  }, []);

  if (!current) return null;

  return (
    <div className="toast-container">
      <div className="toast" ref={toastRef}>
        <span className="toast-text">{current.text}</span>
        <span className="toast-time">{current.time}</span>
      </div>
    </div>
  );
}
