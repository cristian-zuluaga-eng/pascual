"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";

// ============================================================================
// FILE UPLOAD - Componente para subida de archivos
// ============================================================================

interface FileInfo {
  file: File;
  id: string;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
}

interface FileUploadProps {
  /** Callback cuando se seleccionan archivos */
  onFilesSelected?: (files: File[]) => void;
  /** Callback para cada archivo (para upload real) */
  onUpload?: (file: File) => Promise<void>;
  /** Tipos de archivo aceptados */
  accept?: string;
  /** Permitir múltiples archivos */
  multiple?: boolean;
  /** Tamaño máximo en bytes */
  maxSize?: number;
  /** Número máximo de archivos */
  maxFiles?: number;
  /** Etiqueta del campo */
  label?: string;
  /** Descripción o instrucciones */
  description?: string;
  /** Deshabilitar el campo */
  disabled?: boolean;
  /** Variante visual */
  variant?: "default" | "compact";
  /** Clase CSS adicional */
  className?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const getFileIcon = (type: string): string => {
  if (type.startsWith("image/")) return "🖼️";
  if (type.startsWith("video/")) return "🎬";
  if (type.startsWith("audio/")) return "🎵";
  if (type.includes("pdf")) return "📄";
  if (type.includes("zip") || type.includes("rar")) return "📦";
  if (type.includes("text") || type.includes("document")) return "📝";
  return "📎";
};

export function FileUpload({
  onFilesSelected,
  onUpload,
  accept,
  multiple = true,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 10,
  label,
  description,
  disabled = false,
  variant = "default",
  className = "",
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFiles = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || disabled) return;

    const newFiles: FileInfo[] = [];
    const errors: string[] = [];

    Array.from(selectedFiles).forEach((file) => {
      // Validar número de archivos
      if (files.length + newFiles.length >= maxFiles) {
        errors.push(`Máximo ${maxFiles} archivos permitidos`);
        return;
      }

      // Validar tamaño
      if (file.size > maxSize) {
        errors.push(`${file.name} excede el tamaño máximo (${formatFileSize(maxSize)})`);
        return;
      }

      newFiles.push({
        file,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        progress: 0,
        status: "pending",
      });
    });

    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
      onFilesSelected?.(newFiles.map(f => f.file));

      // Simular upload si hay callback
      if (onUpload) {
        for (const fileInfo of newFiles) {
          try {
            setFiles(prev => prev.map(f =>
              f.id === fileInfo.id ? { ...f, status: "uploading" } : f
            ));

            // Simular progreso
            for (let i = 0; i <= 100; i += 20) {
              await new Promise(r => setTimeout(r, 100));
              setFiles(prev => prev.map(f =>
                f.id === fileInfo.id ? { ...f, progress: i } : f
              ));
            }

            await onUpload(fileInfo.file);

            setFiles(prev => prev.map(f =>
              f.id === fileInfo.id ? { ...f, status: "completed", progress: 100 } : f
            ));
          } catch (error) {
            setFiles(prev => prev.map(f =>
              f.id === fileInfo.id ? { ...f, status: "error", error: "Error al subir" } : f
            ));
          }
        }
      }
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    // Reset input para permitir seleccionar el mismo archivo
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAll = () => {
    setFiles([]);
  };

  if (variant === "compact") {
    return (
      <div className={className}>
        {label && (
          <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
            {label}
          </label>
        )}
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleInputChange}
            disabled={disabled}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            className={`
              px-3 py-2 font-mono text-sm rounded-sm border transition-colors
              ${disabled
                ? "opacity-50 cursor-not-allowed bg-zinc-900 border-zinc-800 text-zinc-500"
                : "bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-[#00d9ff] hover:text-[#00d9ff]"
              }
            `}
          >
            Seleccionar archivo
          </button>
          {files.length > 0 && (
            <span className="font-mono text-xs text-zinc-500">
              {files.length} archivo{files.length !== 1 && "s"} seleccionado{files.length !== 1 && "s"}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
          {label}
        </label>
      )}

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-sm p-8 text-center
          transition-all duration-200
          ${disabled
            ? "opacity-50 cursor-not-allowed border-zinc-800 bg-zinc-900/50"
            : isDragging
              ? "border-[#00d9ff] bg-[#00d9ff]/5 cursor-copy"
              : "border-zinc-700 hover:border-zinc-600 bg-zinc-900/30 cursor-pointer"
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        {/* Icon */}
        <div className={`text-4xl mb-3 ${isDragging ? "text-[#00d9ff]" : "text-zinc-600"}`}>
          {isDragging ? "📥" : "📁"}
        </div>

        {/* Text */}
        <p className={`font-mono text-sm ${isDragging ? "text-[#00d9ff]" : "text-zinc-400"}`}>
          {isDragging ? "Suelta los archivos aquí" : "Arrastra archivos aquí o haz click para seleccionar"}
        </p>

        {description && (
          <p className="font-mono text-xs text-zinc-600 mt-2">{description}</p>
        )}

        <p className="font-mono text-[10px] text-zinc-600 mt-2">
          Máx: {formatFileSize(maxSize)} por archivo • {maxFiles} archivos
          {accept && ` • ${accept}`}
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-zinc-500">
              {files.length} archivo{files.length !== 1 && "s"}
            </span>
            <button
              onClick={clearAll}
              className="font-mono text-[10px] text-zinc-500 hover:text-[#ff006e] transition-colors"
            >
              Limpiar todo
            </button>
          </div>

          {files.map((fileInfo) => (
            <div
              key={fileInfo.id}
              className="flex items-center gap-3 p-2 bg-zinc-900 rounded-sm border border-zinc-800"
            >
              {/* Icon */}
              <span className="text-lg">{getFileIcon(fileInfo.file.type)}</span>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs text-white truncate">{fileInfo.file.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-[10px] text-zinc-500">
                    {formatFileSize(fileInfo.file.size)}
                  </span>
                  {fileInfo.status === "uploading" && (
                    <span className="font-mono text-[10px] text-[#00d9ff]">
                      {fileInfo.progress}%
                    </span>
                  )}
                  {fileInfo.status === "completed" && (
                    <span className="font-mono text-[10px] text-[#39ff14]">✓ Completado</span>
                  )}
                  {fileInfo.status === "error" && (
                    <span className="font-mono text-[10px] text-[#ff006e]">{fileInfo.error}</span>
                  )}
                </div>

                {/* Progress bar */}
                {fileInfo.status === "uploading" && (
                  <div className="mt-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#00d9ff] transition-all duration-200"
                      style={{ width: `${fileInfo.progress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Remove button */}
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(fileInfo.id); }}
                className="p-1 text-zinc-500 hover:text-[#ff006e] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FileUpload;
