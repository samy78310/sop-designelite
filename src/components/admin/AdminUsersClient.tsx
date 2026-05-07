"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Key } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  must_change_password: boolean;
  created_at: string;
}

export function AdminUsersClient({ initialUsers }: { initialUsers: AdminUser[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, password }),
    });

    if (res.ok) {
      const data = await res.json();
      setUsers((prev) => [data, ...prev]);
      setShowForm(false);
      setEmail("");
      setName("");
      setPassword("");
    } else {
      const data = await res.json();
      setError(data.error || "Erreur lors de la création.");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string, userEmail: string) => {
    if (!confirm(`Supprimer l'utilisateur ${userEmail} ?`)) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <span className="text-sm font-medium text-foreground">
            {users.length} utilisateur{users.length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>

        {showForm && (
          <div className="px-5 py-4 bg-muted/30 border-b border-border">
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Nom</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Prénom Nom"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="email@designelite.co"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Mot de passe initial
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition disabled:opacity-60"
                >
                  {saving ? "Création..." : "Créer"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-1.5 border border-border rounded-lg text-sm hover:bg-muted transition"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="divide-y divide-border">
          {users.map((user) => (
            <div key={user.id} className="flex items-center gap-4 px-5 py-3.5">
              <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">{user.name}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </div>
              {user.must_change_password && (
                <span className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 px-2 py-0.5 rounded-full">
                  <Key className="w-3 h-3" />
                  MDP à changer
                </span>
              )}
              <span className="text-xs text-muted-foreground hidden md:block">
                {formatDate(user.created_at)}
              </span>
              <button
                onClick={() => handleDelete(user.id, user.email)}
                className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/20 text-muted-foreground hover:text-red-500 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
