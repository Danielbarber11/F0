export enum Screen {
  AUTH = 'AUTH',
  TERMS = 'TERMS',
  HOME = 'HOME',
  WORKSPACE = 'WORKSPACE'
}

export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface ChatMessage {
  id: string;
  role: Role;
  text: string;
  timestamp: number;
  isError?: boolean;
}

export interface ProjectConfig {
  prompt: string;
  language: string;
  model: string;
  files?: FileList | null;
}

export interface GeneratedCode {
  language: string;
  code: string;
}

export interface User {
  email: string;
  password?: string; // Optional for Google Auth
  name?: string;
  picture?: string;
  hasAcceptedTerms: boolean;
}