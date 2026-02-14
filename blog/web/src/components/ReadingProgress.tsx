import { useEffect, useState } from 'react';

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, scrollPercent)));
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div
      className="fixed left-0 top-0 h-screen w-[3px] z-50"
      style={{ background: `rgb(var(--border))` }}
    >
      <div
        className="w-full transition-all duration-100"
        style={{
          height: `${progress}%`,
          background: `rgb(var(--progress))`,
        }}
      />
    </div>
  );
}
