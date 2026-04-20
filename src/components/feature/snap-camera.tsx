'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Camera, RotateCw, X } from 'lucide-react';

interface SnapCameraProps {
  onCapture: (file: File, preview: string) => void;
  disabled?: boolean;
}

export function SnapCamera({ onCapture, disabled }: SnapCameraProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [file, setFile] = React.useState<File | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setPreview(url);
    setFile(f);
    onCapture(f, url);
  }

  function retake() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFile(null);
    inputRef.current?.click();
  }

  function clear() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFile(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  if (preview) {
    return (
      <div className="relative w-full aspect-[4/5] rounded-xl2 overflow-hidden bg-bg-elev-2 border border-border">
        <img src={preview} alt="preview" className="h-full w-full object-cover" />
        <div className="absolute top-2 right-2 flex gap-2">
          <Button
            type="button"
            size="icon"
            variant="secondary"
            onClick={retake}
            aria-label="Riscatta"
            disabled={disabled}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="secondary"
            onClick={clear}
            aria-label="Rimuovi"
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <label className="block w-full">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
      <div className="flex flex-col items-center justify-center gap-3 aspect-[4/5] rounded-xl2 border-2 border-dashed border-border-strong bg-bg-elev text-fg-muted hover:bg-bg-elev-2 transition-colors cursor-pointer">
        <Camera className="h-10 w-10 text-fg-subtle" />
        <div className="text-sm font-medium">Tocca per scattare una foto</div>
        <div className="text-xs text-fg-subtle">Meglio se dall'alto, con il piatto intero</div>
      </div>
    </label>
  );
}
