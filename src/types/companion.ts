import type { LocalizedText, Coordinate, Period, SourceRef } from './common';

export interface Companion {
  id: string;
  name: LocalizedText;
  kunya?: LocalizedText;
  laqab?: LocalizedText;
  clan?: LocalizedText;
  tribe_id?: string;
  birth_year?: number;
  death_year?: number;
  birth_place?: Coordinate & { name: LocalizedText };
  death_place?: Coordinate & { name: LocalizedText };
  period: Period;
  rank?: string;
  conversion_order?: number;
  gender: 'male' | 'female';
  biography: LocalizedText;
  notable_events: string[];
  events_participated: string[];
  relationships: CompanionRelation[];
  hadith_count?: number;
  museum_item_ids: string[];
  sources: SourceRef[];
  image_url?: string;
}

export interface CompanionRelation {
  type: 'parent' | 'child' | 'spouse' | 'sibling' | 'teacher' | 'student' | 'companion' | 'muahat';
  target_id: string;
  label?: LocalizedText;
}

export interface TeacherStudentEdge {
  from: string;
  to: string;
  subject?: string;
  strength?: number;
}
