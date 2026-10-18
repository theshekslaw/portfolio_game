import tokens from '@/data/tokens.json';
import type { Category, ModeKey, Page, Theme } from './types';

export const professions = tokens.professions as Record<ModeKey, Theme>;
export const pages = tokens.pages as Record<string, Page>;
export const catalog = tokens.catalog as Category[];
