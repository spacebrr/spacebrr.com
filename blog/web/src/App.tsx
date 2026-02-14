import { ThemeProvider } from 'next-themes';
import { Navigation } from './components/Navigation';
import { Home } from './components/Home';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BlogDetail from './routes/blog.$slug';

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <BrowserRouter>
        <div className="min-h-screen">
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}
