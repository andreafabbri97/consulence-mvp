"use client";

import { FormEvent, ChangeEvent, useState } from "react";

import { ConsultantNote } from "@/lib/types";

interface Props {
  notes: ConsultantNote[];
  onAdd: (content: string) => Promise<void>;
}

export function ConsultantDesk({ notes, onAdd }: Props) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    await onAdd(content.trim());
    setContent("");
    setLoading(false);
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Desk Consulente</h3>
        <p className="text-sm text-slate-500">Note private e workflow</p>
      </div>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <textarea
          className="w-full rounded-2xl border border-slate-200 p-3 text-sm focus:border-brand-500 focus:outline-none"
          rows={3}
          placeholder="Aggiungi insight o to-do..."
          value={content}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-60"
        >
          {loading ? "Salvataggio..." : "Salva nota"}
        </button>
      </form>
      <div className="mt-4 space-y-3">
        {notes.map((note) => (
          <article key={note.note_id} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">
              {new Date(note.created_at).toLocaleString("it-IT")} — {note.author}
            </p>
            <p className="mt-1 text-sm text-slate-700">{note.content}</p>
          </article>
        ))}
        {!notes.length && <p className="text-sm text-slate-500">Ancora nessuna nota salvata.</p>}
      </div>
    </div>
  );
}
