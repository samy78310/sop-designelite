import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const SEED_CONTENT = {
  categories: [
    { title: "Onboarding", slug: "onboarding" },
    { title: "Production", slug: "production" },
    { title: "Gestion clients", slug: "gestion-clients" },
    { title: "Designers", slug: "designers" },
    { title: "Finance & Admin", slug: "finance-admin" },
  ],
  articles: {
    onboarding: [
      {
        title: "Bienvenue chez Design Elite",
        slug: "bienvenue",
        description: "Tout ce que vous devez savoir pour bien démarrer.",
        published: true,
        content: `<h2>Bienvenue dans l'équipe !</h2>
<p>Design Elite est une agence de design par abonnement. Notre mission est de fournir un design de haute qualité de manière rapide, prévisible et scalable.</p>
<div class="callout-info" data-callout="info"><span class="callout-icon">ℹ️</span><span class="callout-content">Avant de commencer, assurez-vous d'avoir accès à tous les outils listés ci-dessous. Contactez un PM si ce n'est pas le cas.</span></div>
<h2>Outils essentiels</h2>
<ul>
<li><strong>Figma</strong> — outil principal de design</li>
<li><strong>Monday.com</strong> — gestion des tâches et projets clients</li>
<li><strong>Claap</strong> — enregistrement et partage de vidéos internes</li>
<li><strong>Slack</strong> — communication d'équipe</li>
<li><strong>Notion</strong> — documentation supplémentaire</li>
</ul>
<h2>Première semaine</h2>
<p>La première semaine est dédiée à l'apprentissage de nos processus. Vous travaillerez en binôme avec un PM pour comprendre le flux de travail complet.</p>
<div class="callout-warning" data-callout="warning"><span class="callout-icon">⚠️</span><span class="callout-content">Ne commencez aucun projet client sans avoir lu l'ensemble des SOPs de production. Les erreurs de process ont un impact direct sur la satisfaction client.</span></div>`,
      },
    ],
    production: [
      {
        title: "Comment rédiger un brief",
        slug: "rediger-un-brief",
        description: "Processus standard pour la création de briefs internes à destination des designers.",
        published: true,
        content: `<h2>Objectif du brief</h2>
<p>Le brief interne est le document de référence transmis au designer pour lui permettre de démarrer un projet sans ambiguïté. Un brief bien rédigé évite les allers-retours inutiles et garantit une livraison conforme aux attentes client.</p>

<h2>Structure standard d'un brief</h2>
<p>Chaque brief doit impérativement contenir les sections suivantes :</p>
<ol>
<li><strong>Contexte client</strong> — Qui est le client, son secteur, son positionnement</li>
<li><strong>Objectif de la demande</strong> — Ce qu'il cherche à accomplir avec ce design</li>
<li><strong>Format et livrables attendus</strong> — Dimensions, formats de fichiers, nombre de variantes</li>
<li><strong>Références visuelles</strong> — Screenshots, liens, exemples approuvés</li>
<li><strong>Charte graphique</strong> — Couleurs hex, typographies, logos fournis</li>
<li><strong>Deadline</strong> — Date et heure de livraison attendue</li>
</ol>

<h2>Où trouver les infos client</h2>
<p>Toutes les informations nécessaires se trouvent dans la tâche Monday.com du client. Vérifiez systématiquement :</p>
<ul>
<li>Le dossier Figma dédié au client (accès dans Monday)</li>
<li>Les échanges précédents dans les commentaires de la tâche</li>
<li>Le document de brand guidelines s'il existe</li>
</ul>

<div class="callout-info" data-callout="info"><span class="callout-icon">ℹ️</span><span class="callout-content">En cas de doute sur la demande client, demandez toujours une clarification AVANT de rédiger le brief. Il est plus rapide de poser une question que de corriger un livraison incorrecte.</span></div>

<h2>Bonnes pratiques</h2>
<ul>
<li>Rédigez le brief en français, sauf si le designer est anglophone</li>
<li>Soyez concis et précis — évitez les formulations vagues comme "style moderne"</li>
<li>Indiquez toujours une deadline claire avec fuseau horaire (ex: 17h00 Paris)</li>
<li>Attachez toutes les ressources directement dans la tâche Monday</li>
</ul>

<div class="callout-warning" data-callout="warning"><span class="callout-icon">⚠️</span><span class="callout-content">Un brief incomplet est la première cause de révisions et de délais supplémentaires. Prenez 10 minutes de plus pour vous assurer que tout est clair.</span></div>

<h2>Vidéo explicative</h2>
<p>Regardez ce walkthrough complet de rédaction de brief :</p>
<div class="claap-embed-wrapper" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:24px 0;" data-claap-id="demo-brief-walkthrough"><iframe src="https://app.claap.io/embed/demo-brief-walkthrough" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;" allowfullscreen allow="autoplay; fullscreen"></iframe></div>

<h2>Template de brief</h2>
<p>Un template Google Docs est disponible dans le dossier partagé "Templates Production". Dupliquez-le pour chaque nouveau brief, ne modifiez jamais l'original.</p>`,
      },
      {
        title: "Processus de révision",
        slug: "processus-revision",
        description: "Comment gérer les demandes de révision des clients.",
        published: true,
        content: `<h2>Politique de révisions</h2>
<p>Design Elite inclut un nombre limité de révisions par abonnement. Il est important de bien comprendre et communiquer cette politique aux clients.</p>
<h2>Étapes</h2>
<ol>
<li>Recevoir la demande de révision dans Monday</li>
<li>Évaluer si la demande entre dans le scope du brief original</li>
<li>Informer le designer et mettre à jour la priorité de la tâche</li>
</ol>`,
      },
    ],
    "gestion-clients": [
      {
        title: "Onboarding d'un nouveau client",
        slug: "onboarding-nouveau-client",
        description: "Les étapes pour accueillir et configurer un nouveau client.",
        published: true,
        content: `<h2>Checklist d'onboarding</h2>
<p>Lorsqu'un nouveau client souscrit à Design Elite, suivez cette checklist dans l'ordre.</p>
<ul>
<li>Créer la fiche client dans Monday.com</li>
<li>Envoyer l'email de bienvenue avec les accès</li>
<li>Planifier l'appel de kickoff (30 min)</li>
<li>Créer le dossier Figma dédié</li>
</ul>`,
      },
    ],
    designers: [
      {
        title: "Standards de livraison Figma",
        slug: "standards-livraison-figma",
        description: "Conventions et standards à respecter pour chaque livraison Figma.",
        published: true,
        content: `<h2>Organisation des fichiers</h2>
<p>Chaque fichier Figma livré doit respecter une structure précise pour faciliter la prise en main par le client.</p>
<h2>Nommage des calques</h2>
<p>Tous les calques doivent être nommés en anglais, de manière descriptive. Évitez "Rectangle 1" ou "Group 3".</p>`,
      },
    ],
    "finance-admin": [
      {
        title: "Facturation et paiements",
        slug: "facturation-paiements",
        description: "Processus de facturation mensuelle et suivi des paiements.",
        published: true,
        content: `<h2>Cycle de facturation</h2>
<p>La facturation est envoyée le premier de chaque mois via Stripe. Les abonnements sont automatiquement renouvelés.</p>
<div class="callout-warning" data-callout="warning"><span class="callout-icon">⚠️</span><span class="callout-content">En cas d'échec de paiement, suivre la procédure de relance dans les 48h pour éviter l'interruption de service.</span></div>`,
      },
    ],
  },
};

export async function GET() {
  try {
    // Create admin user
    const adminEmail = "admin@designelite.co";
    const existing = await sql`SELECT id FROM admin_users WHERE email = ${adminEmail}`;

    if (existing.rows.length === 0) {
      const hash = await bcrypt.hash("admin123", 12);
      await sql`
        INSERT INTO admin_users (id, email, name, password_hash, must_change_password)
        VALUES (${uuidv4()}, ${adminEmail}, ${"Admin Design Elite"}, ${hash}, true)
      `;
    }

    // Create categories
    const categoryIds: Record<string, string> = {};
    for (let i = 0; i < SEED_CONTENT.categories.length; i++) {
      const cat = SEED_CONTENT.categories[i];
      const existingCat = await sql`SELECT id FROM categories WHERE slug = ${cat.slug}`;
      if (existingCat.rows.length === 0) {
        const id = uuidv4();
        await sql`
          INSERT INTO categories (id, title, slug, order_index)
          VALUES (${id}, ${cat.title}, ${cat.slug}, ${i})
        `;
        categoryIds[cat.slug] = id;
      } else {
        categoryIds[cat.slug] = existingCat.rows[0].id;
      }
    }

    // Create articles
    for (const [catSlug, articles] of Object.entries(SEED_CONTENT.articles)) {
      const categoryId = categoryIds[catSlug];
      if (!categoryId) continue;

      for (let i = 0; i < articles.length; i++) {
        const article = articles[i];
        const existingArt = await sql`SELECT id FROM articles WHERE slug = ${article.slug}`;
        if (existingArt.rows.length === 0) {
          const now = new Date().toISOString();
          await sql`
            INSERT INTO articles (id, category_id, title, slug, description, content, order_index, published, created_at, updated_at)
            VALUES (${uuidv4()}, ${categoryId}, ${article.title}, ${article.slug}, ${article.description}, ${article.content}, ${i}, ${article.published}, ${now}, ${now})
          `;
        }
      }
    }

    return NextResponse.json({ ok: true, message: "Seed data created successfully." });
  } catch (err) {
    return NextResponse.json(
      { error: "Seed failed", details: String(err) },
      { status: 500 }
    );
  }
}
