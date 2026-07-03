const AUDIO_EXTENSIONS = /\.(mp3|flac|wav|ogg|m4a|aac|opus|webm)$/i;

export function isAudioLike(file: File): boolean {
  if (file.type.startsWith('audio/')) return true;
  return AUDIO_EXTENSIONS.test(file.name);
}

export function supportsDirectoryPicker(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof (window as { showDirectoryPicker?: unknown }).showDirectoryPicker ===
      'function'
  );
}

interface FileSystemDirectoryHandleLike {
  name: string;
  values(): AsyncIterable<FileSystemHandleLike>;
}

interface FileSystemFileHandleLike {
  kind: 'file';
  name: string;
  getFile(): Promise<File>;
}

type FileSystemHandleLike =
  | ({ kind: 'directory' } & FileSystemDirectoryHandleLike)
  | FileSystemFileHandleLike;

export async function pickAudioDirectory(): Promise<File[] | null> {
  if (!supportsDirectoryPicker()) return null;
  const pick = (
    window as unknown as {
      showDirectoryPicker: (options?: {
        mode?: 'read' | 'readwrite';
      }) => Promise<FileSystemDirectoryHandleLike>;
    }
  ).showDirectoryPicker;
  try {
    const root = await pick({ mode: 'read' });
    const files: File[] = [];
    await collectAudio(root, files);
    return files;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return [];
    throw err;
  }
}

async function collectAudio(
  dir: FileSystemDirectoryHandleLike,
  out: File[],
): Promise<void> {
  for await (const handle of dir.values()) {
    if (handle.kind === 'file') {
      const file = await handle.getFile();
      if (isAudioLike(file)) out.push(file);
    } else {
      await collectAudio(handle, out);
    }
  }
}