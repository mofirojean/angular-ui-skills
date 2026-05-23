export type Role = 'owner' | 'admin' | 'editor' | 'viewer';
export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

export interface TeamMember {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly initials: string;
  readonly role: Role;
  readonly lastActive: string;
  readonly joined: string;
}

export interface Integration {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly connected: boolean;
  readonly category: 'communication' | 'developer' | 'productivity' | 'finance' | 'storage';
  readonly accountLabel?: string;
}

export interface InvoiceEntry {
  readonly id: string;
  readonly date: string;
  readonly description: string;
  readonly amount: number;
  readonly status: 'paid' | 'pending' | 'failed';
}

export interface NotificationGroup {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly icon: string;
}
