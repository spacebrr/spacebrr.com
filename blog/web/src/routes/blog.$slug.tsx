import { useParams, Link } from 'react-router-dom';
import { getPostBySlug } from 'virtual:blog';
import { ReadingProgress } from '../components/ReadingProgress';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = getPostBySlug(slug || '');

  if (!post) {
    return (
      <main className="max-w-[38rem] mx-auto px-6 py-24">
        <p>Post not found</p>
        <Link to="/">Back</Link>
      </main>
    );
  }

  return (
    <>
      <ReadingProgress />
      <main className="max-w-[38rem] mx-auto px-6 py-24">
        <header className="mb-12">
          <time className="text-sm text-[rgb(var(--text-muted))] tracking-wide">
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          <h1 className="text-[1.75rem] leading-tight mt-3">{post.title}</h1>
        </header>

        <article
          className="prose"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <footer className="mt-20 pt-8 border-t border-[rgb(var(--border))]">
          <Link to="/" className="text-[rgb(var(--text-muted))] no-underline hover:text-[rgb(var(--text))] transition-colors">
            ← all posts
          </Link>
        </footer>
      </main>
    </>
  );
}
