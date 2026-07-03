export class CancelledError extends Error {
  constructor() {
    super('Cancelled');
    this.name = 'CancelledError';
  }
}

export class CancelToken {
  private _cancelled = false;
  private listeners = new Set<() => void>();

  get cancelled(): boolean {
    return this._cancelled;
  }

  cancel(): void {
    if (this._cancelled) return;
    this._cancelled = true;
    for (const listener of this.listeners) listener();
    this.listeners.clear();
  }

  throwIfCancelled(): void {
    if (this._cancelled) throw new CancelledError();
  }

  onCancel(listener: () => void): () => void {
    if (this._cancelled) {
      listener();
      return () => {};
    }
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}