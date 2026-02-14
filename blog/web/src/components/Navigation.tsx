import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

export function Navigation() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  if (isHome) {
    return (
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[rgb(var(--bg))]">
      <div className="max-w-[38rem] mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="no-underline text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] transition-colors">
          tyson chan
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
