import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET() {
  try {
    // Create tables
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    await sql`
      CREATE TABLE IF NOT EXISTS admin_users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        must_change_password BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        order_index INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
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
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS helpfulness_votes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
        vote BOOLEAN NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Indexes
    await sql`CREATE INDEX IF NOT EXISTS articles_category_idx ON articles(category_id)`;
    await sql`CREATE INDEX IF NOT EXISTS articles_published_idx ON articles(published)`;
    await sql`CREATE INDEX IF NOT EXISTS categories_order_idx ON categories(order_index)`;
    await sql`CREATE INDEX IF NOT EXISTS articles_order_idx ON articles(order_index)`;

    return NextResponse.json({ ok: true, message: "Database schema created successfully." });
  } catch (err) {
    return NextResponse.json(
      { error: "Setup failed", details: String(err) },
      { status: 500 }
    );
  }
}
