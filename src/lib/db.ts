import { sql } from "@vercel/postgres";
export { sql };

export async function getNavigation() {
  const { rows } = await sql`
    SELECT
      c.id as category_id,
      c.title as category_title,
      c.slug as category_slug,
      c.order_index as category_order,
      a.id as article_id,
      a.title as article_title,
      a.slug as article_slug,
      a.order_index as article_order
    FROM categories c
    LEFT JOIN articles a ON a.category_id = c.id AND a.published = true
    ORDER BY c.order_index ASC, a.order_index ASC
  `;

  const categoryMap = new Map<string, {
    id: string;
    title: string;
    slug: string;
    order_index: number;
    articles: Array<{ id: string; title: string; slug: string; order_index: number }>;
  }>();

  for (const row of rows) {
    if (!categoryMap.has(row.category_id)) {
      categoryMap.set(row.category_id, {
        id: row.category_id,
        title: row.category_title,
        slug: row.category_slug,
        order_index: row.category_order,
        articles: [],
      });
    }
    if (row.article_id) {
      categoryMap.get(row.category_id)!.articles.push({
        id: row.article_id,
        title: row.article_title,
        slug: row.article_slug,
        order_index: row.article_order,
      });
    }
  }

  return Array.from(categoryMap.values());
}

export async function getArticle(categorySlug: string, articleSlug: string) {
  const { rows } = await sql`
    SELECT a.*, c.title as category_title, c.slug as category_slug
    FROM articles a
    JOIN categories c ON a.category_id = c.id
    WHERE c.slug = ${categorySlug} AND a.slug = ${articleSlug} AND a.published = true
    LIMIT 1
  `;
  return rows[0] || null;
}

export async function getArticleById(id: string) {
  const { rows } = await sql`
    SELECT a.*, c.title as category_title, c.slug as category_slug
    FROM articles a
    JOIN categories c ON a.category_id = c.id
    WHERE a.id = ${id}
    LIMIT 1
  `;
  return rows[0] || null;
}

export async function getFirstPublishedArticle() {
  const { rows } = await sql`
    SELECT a.slug as article_slug, c.slug as category_slug
    FROM articles a
    JOIN categories c ON a.category_id = c.id
    WHERE a.published = true
    ORDER BY c.order_index ASC, a.order_index ASC
    LIMIT 1
  `;
  return rows[0] || null;
}

export async function getAdjacentArticles(categorySlug: string, articleSlug: string) {
  const nav = await getNavigation();

  const allArticles: Array<{ categorySlug: string; slug: string; title: string }> = [];
  for (const cat of nav) {
    for (const art of cat.articles) {
      allArticles.push({ categorySlug: cat.slug, slug: art.slug, title: art.title });
    }
  }

  const currentIndex = allArticles.findIndex(
    (a) => a.categorySlug === categorySlug && a.slug === articleSlug
  );

  return {
    prev: currentIndex > 0 ? allArticles[currentIndex - 1] : null,
    next: currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null,
  };
}

export async function searchArticles(query: string) {
  const { rows } = await sql`
    SELECT
      a.id,
      a.title,
      a.slug,
      a.description,
      c.title as category_title,
      c.slug as category_slug
    FROM articles a
    JOIN categories c ON a.category_id = c.id
    WHERE a.published = true
      AND (
        to_tsvector('french', a.title || ' ' || COALESCE(a.description, '') || ' ' || COALESCE(a.content, ''))
        @@ plainto_tsquery('french', ${query})
        OR a.title ILIKE ${'%' + query + '%'}
        OR a.description ILIKE ${'%' + query + '%'}
      )
    ORDER BY c.order_index ASC, a.order_index ASC
    LIMIT 20
  `;
  return rows;
}

export async function getAllArticlesAdmin() {
  const { rows } = await sql`
    SELECT a.*, c.title as category_title, c.slug as category_slug
    FROM articles a
    JOIN categories c ON a.category_id = c.id
    ORDER BY c.order_index ASC, a.order_index ASC
  `;
  return rows;
}

export async function getAllCategories() {
  const { rows } = await sql`
    SELECT c.*, COUNT(a.id)::int as article_count
    FROM categories c
    LEFT JOIN articles a ON a.category_id = c.id
    GROUP BY c.id
    ORDER BY c.order_index ASC
  `;
  return rows;
}

export async function getVoteCounts(articleId: string) {
  const { rows } = await sql`
    SELECT
      COUNT(*) FILTER (WHERE vote = true)::int as helpful,
      COUNT(*) FILTER (WHERE vote = false)::int as not_helpful
    FROM helpfulness_votes
    WHERE article_id = ${articleId}
  `;
  return rows[0] || { helpful: 0, not_helpful: 0 };
}
