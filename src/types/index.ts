export interface Category {
  id: string;
  title: string;
  slug: string;
  order_index: number;
  created_at: string;
  article_count?: number;
}

export interface Article {
  id: string;
  category_id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  order_index: number;
  published: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface HelpfulnessVote {
  id: string;
  article_id: string;
  vote: boolean;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  must_change_password: boolean;
  created_at: string;
}

export interface NavCategory {
  id: string;
  title: string;
  slug: string;
  order_index: number;
  articles: NavArticle[];
}

export interface NavArticle {
  id: string;
  title: string;
  slug: string;
  order_index: number;
}

export interface SearchResult {
  id: string;
  title: string;
  slug: string;
  description: string;
  category_title: string;
  category_slug: string;
}
