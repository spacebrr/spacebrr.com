// TypeScript declarations for virtual modules

declare module 'virtual:blog' {
  export interface BlogPost {
    slug: string;
    title: string;
    date: string;
    description?: string;
    tags?: string[];
    content: string;
    priority?: number;
  }

  export const blogData: BlogPost[];
  export const getAllPosts: () => BlogPost[];
  export const getRecentPosts: (count?: number) => BlogPost[];
  export const getPostBySlug: (slug: string) => BlogPost | undefined;
}
