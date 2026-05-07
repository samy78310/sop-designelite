-- Design Elite SOP Knowledge Base
-- Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Admin users
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  must_change_password BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories (sections in the sidebar)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Articles
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  content TEXT DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helpfulness votes
CREATE TABLE IF NOT EXISTS helpfulness_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  vote BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Full text search index
CREATE INDEX IF NOT EXISTS articles_search_idx ON articles
  USING GIN (to_tsvector('french', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(content, '')));

CREATE INDEX IF NOT EXISTS articles_category_idx ON articles(category_id);
CREATE INDEX IF NOT EXISTS articles_published_idx ON articles(published);
CREATE INDEX IF NOT EXISTS categories_order_idx ON categories(order_index);
CREATE INDEX IF NOT EXISTS articles_order_idx ON articles(order_index);
