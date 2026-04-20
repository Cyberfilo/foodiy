'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText } from 'lucide-react';
import { pushToast } from '@/components/ui/toast';

interface DietUploaderProps {
  onSubmit: (args: { name: string; text?: string; file?: File }) => Promise<void>;
  busy?: boolean;
}

export function DietUploader({ onSubmit, busy }: DietUploaderProps) {
  const [name, setName] = React.useState('');
  const [text, setText] = React.useState('');
  const [file, setFile] = React.useState<File | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      pushToast('Dai un nome alla dieta', 'error');
      return;
    }
    if (!text.trim() && !file) {
      pushToast('Incolla il testo o carica un file', 'error');
      return;
    }
    await onSubmit({ name: name.trim(), text: text.trim() || undefined, file: file || undefined });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="diet-name">Nome</Label>
        <Input
          id="diet-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="es. Mediterranea 1800kcal"
          className="mt-1"
          disabled={busy}
        />
      </div>
      <div>
        <Label htmlFor="diet-text">Testo della dieta (o incolla qui)</Label>
        <Textarea
          id="diet-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Incolla il piano del nutrizionista, oppure scrivi: 1800 kcal/giorno, 120g proteine, 200g carbo, 60g grassi, niente zuccheri raffinati..."
          className="mt-1 min-h-40"
          disabled={busy}
        />
      </div>
      <div>
        <Label>Oppure carica un file (PDF, DOCX, TXT)</Label>
        <label className="mt-1 flex items-center gap-2 rounded-xl border border-dashed border-border-strong bg-bg-elev hover:bg-bg-elev-2 px-4 py-3 cursor-pointer">
          <Upload className="h-4 w-4 text-fg-muted" />
          <span className="text-sm">
            {file ? (
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" /> {file.name}
              </span>
            ) : (
              <span className="text-fg-muted">Scegli file…</span>
            )}
          </span>
          <input
            type="file"
            accept=".pdf,.docx,.txt,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            disabled={busy}
          />
        </label>
      </div>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? 'Analisi…' : 'Analizza & salva dieta'}
      </Button>
    </form>
  );
}
