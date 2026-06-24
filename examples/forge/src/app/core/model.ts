export interface Reviewer {
  readonly id: string;
  readonly name: string;
  readonly handle: string;
  readonly role: string;
  readonly avatarUrl: string | null;
}
