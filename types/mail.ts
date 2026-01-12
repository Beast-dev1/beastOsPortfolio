export interface Email {
  _id?: string;
  id?: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  date: Date | string;
  image?: string;
  name: string;
  starred: boolean;
  bin: boolean;
  type: string;
  read?: boolean;
  folder?: 'inbox' | 'sent' | 'drafts';
}

export interface ComposeEmailData {
  to: string;
  from: string;
  subject: string;
  body: string;
  name: string;
  type?: string;
  date?: Date;
}
