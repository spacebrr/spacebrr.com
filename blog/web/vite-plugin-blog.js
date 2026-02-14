/**
 * Vite plugin to transform canon/blog/*.md into blog data at build time
 * Zero ceremony, automatic regeneration, no committed artifacts
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkHtml from 'remark-html';

function extractTitle(markdown) {
  const lines = markdown.split('\n').filter(Boolean);
  const firstLine = lines[0]?.trim() || '';
  if (firstLine.startsWith('# ')) {
    return firstLine.replace(/^#\s*/, '');
  }
  return 'Untitled';
}

function extractDescription(markdown) {
  const lines = markdown
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  for (const line of lines.slice(1)) {
    if (line.length > 50 && !line.startsWith('#') && !line.startsWith('```')) {
      return line;
    }
  }
  return '';
}

function stripFirstHeader(markdown) {
  const lines = markdown.split('\n');
  if (lines[0]?.trim().startsWith('# ')) {
    return lines.slice(1).join('\n').trim();
  }
  return markdown;
}

export function blogPlugin() {
  return {
    name: 'blog',
    resolveId(id) {
      if (id === 'virtual:blog') return id;
    },
    async load(id) {
      if (id !== 'virtual:blog') return;

      const sourceDir = process.env.BLOG_PATH || join(process.env.HOME, 'space/repos/tysonchan.com');

      try {
        const files = readdirSync(sourceDir).filter((f) => f.endsWith('.md'));
        const posts = [];

        for (const file of files) {
          const slug = file.replace('.md', '');
          const raw = readFileSync(join(sourceDir, file), 'utf-8');
          const { data: frontmatter, content: markdown } = matter(raw);

          const title = frontmatter.title || extractTitle(markdown);
          const description =
            frontmatter.description || extractDescription(markdown);
          const date = frontmatter.date || '2025-09-02';
          const tags = frontmatter.tags || ['ai'];

          // Priority from numbered filenames
          let priority = 999;
          const numberMatch = file.match(/^(\d+)_/);
          if (numberMatch) priority = parseInt(numberMatch[1]);

          // Strip first H1 since we render title separately
          const contentWithoutHeader = stripFirstHeader(markdown);
          const html = await remark()
            .use(remarkHtml)
            .process(contentWithoutHeader);

          posts.push({
            slug,
            title,
            date,
            description,
            tags,
            priority,
            content: String(html),
          });
        }

        // Sort by priority
        posts.sort((a, b) => {
          if (a.priority !== b.priority) return a.priority - b.priority;
          return new Date(b.date) - new Date(a.date);
        });

        return `
export const blogData = ${JSON.stringify(posts, null, 2)};

export const getAllPosts = () => blogData.sort((a, b) => (a.priority || 0) - (b.priority || 0));
export const getRecentPosts = (count = 2) => getAllPosts().slice(0, count);
export const getPostBySlug = (slug) => blogData.find(post => post.slug === slug);
`;
      } catch (error) {
        console.warn('Blog plugin: Could not load blog files:', error.message);
        return `
export const blogData = [];
export const getAllPosts = () => [];
export const getRecentPosts = () => [];
export const getPostBySlug = () => undefined;
`;
      }
    },
  };
}
