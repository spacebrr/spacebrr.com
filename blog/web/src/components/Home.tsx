import { Link } from 'react-router-dom';
import { useState } from 'react';
import { getAllPosts } from 'virtual:blog';

export function Home() {
  const posts = getAllPosts();
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const hoveredPost = posts.find((p) => p.slug === hoveredSlug);

  return (
    <main className="max-w-[38rem] mx-auto px-6 py-24">
      <header className="mb-20">
        <h1 className="text-[1.75rem] mb-2">tyson chan</h1>
        <p className="text-[rgb(var(--text-muted))]">ai coordination research</p>
      </header>

      <section className="relative">
        <ul className="space-y-3">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                to={`/blog/${post.slug}`}
                className="flex justify-between items-baseline gap-4 no-underline group"
                onMouseEnter={() => setHoveredSlug(post.slug)}
                onMouseLeave={() => setHoveredSlug(null)}
              >
                <span className="group-hover:text-[rgb(var(--text-muted))] transition-colors">
                  {post.title}
                </span>
                <span className="text-sm text-[rgb(var(--text-muted))] tabular-nums shrink-0">
                  {new Date(post.date).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {hoveredPost?.description && (
          <div className="hidden lg:block absolute left-full top-0 ml-12 w-72 text-sm text-[rgb(var(--text-muted))] italic leading-relaxed">
            "{hoveredPost.description}"
          </div>
        )}
      </section>
    </main>
  );
}
