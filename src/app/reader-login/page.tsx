"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ReaderLoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/docs";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/reader-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push(from);
        router.refresh();
      } else {
        setError("Mot de passe incorrect. Réessayez.");
        setLoading(false);
      }
    } catch {
      setError("Impossible de contacter le serveur. Réessayez.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-brand-500 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">DE</span>
            </div>
            <span className="text-xl font-semibold text-foreground">Design Elite</span>
          </div>
          <p className="text-muted-foreground text-sm text-center mt-2">
            Base de connaissances interne
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-foreground mb-1">Accès protégé</h1>
          <p className="text-sm text-muted-foreground mb-5">
            Entrez le mot de passe de l&apos;équipe pour continuer.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                placeholder="••••••••••••"
                autoFocus
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition disabled:opacity-60"
            >
              {loading ? "Vérification..." : "Accéder"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ReaderLoginPage() {
  return (
    <Suspense>
      <ReaderLoginForm />
    </Suspense>
  );
}
