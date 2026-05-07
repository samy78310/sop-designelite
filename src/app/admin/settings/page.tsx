"use client";

import { useState } from "react";
import { Save } from "lucide-react";

export default function AdminSettingsPage() {
  const [readerPassword, setReaderPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ readerPassword }),
    });

    if (res.ok) {
      setSaved(true);
      setReaderPassword("");
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError("Erreur lors de la sauvegarde.");
    }
    setSaving(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configuration générale de la base de connaissances.
        </p>
      </div>

      <div className="max-w-lg space-y-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-base font-semibold text-foreground mb-1">
            Mot de passe lecteur
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Le mot de passe partagé pour accéder à la documentation (/docs).
            Actuellement défini via la variable d&apos;environnement <code className="text-xs bg-muted px-1 py-0.5 rounded">READER_PASSWORD</code>.
          </p>

          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm text-blue-700 dark:text-blue-300 mb-4">
            ℹ️ Pour modifier le mot de passe lecteur, mettez à jour la variable d&apos;environnement <code className="font-mono text-xs">READER_PASSWORD</code> dans votre déploiement Vercel.
          </div>

          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Nouveau mot de passe lecteur
              </label>
              <input
                type="password"
                value={readerPassword}
                onChange={(e) => setReaderPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                placeholder="Nouveau mot de passe..."
                minLength={8}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            {saved && <p className="text-sm text-green-600">Sauvegardé !</p>}
            <button
              type="submit"
              disabled={saving || !readerPassword}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {saving ? "Sauvegarde..." : "Sauvegarder"}
            </button>
          </form>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-base font-semibold text-foreground mb-1">Base de données</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Initialiser ou réinitialiser le schéma de la base de données.
          </p>
          <a
            href="/api/db/setup"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition"
          >
            Initialiser la base de données →
          </a>
        </div>
      </div>
    </div>
  );
}
