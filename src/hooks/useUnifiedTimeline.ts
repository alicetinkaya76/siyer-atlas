import { useMemo } from 'react';
import { useData } from '@/hooks/useData';
import type { TimelineEntry, ProphetEventsData, UnifiedEvent } from '@/types';

/** Category mapping from v2.12 types */
function mapCategory(type: string): UnifiedEvent['category'] {
  switch (type) {
    case 'gazve': return 'battle';
    case 'seriyye': return 'seriyye';
    case 'fetih': return 'conquest';
    case 'ridde': return 'battle';
    case 'fitne': return 'battle';
    case 'deniz_savasi': return 'battle';
    case 'olay': return 'milestone';
    default: return 'milestone';
  }
}

function yearToPeriod(year: number): 'mekke' | 'medine' | 'hulefa' {
  if (year < 622) return 'mekke';
  if (year < 632) return 'medine';
  return 'hulefa';
}

/**
 * Merges timeline.json (90 military) + prophet_events.json (30 general)
 * into a single sorted UnifiedEvent[] for the D3 chart.
 */
export function useUnifiedTimeline() {
  const { data: timeline, isLoading: tLoading } = useData<TimelineEntry[]>('timeline');
  const { data: prophetData, isLoading: pLoading } = useData<ProphetEventsData>('prophet_events');

  const events = useMemo<UnifiedEvent[]>(() => {
    const result: UnifiedEvent[] = [];

    // 1) Military events from timeline.json
    if (timeline) {
      for (const t of timeline) {
        result.push({
          id: t.battle_id,
          name: t.name,
          year_ce: t.year_ce,
          period: yearToPeriod(t.year_ce),
          category: mapCategory(t.type),
          tier: t.tier,
          lat: t.lat || undefined,
          lng: t.lng || undefined,
          result: t.result,
          battle_id: t.battle_id,
        });
      }
    }

    // 2) General events from prophet_events.json
    if (prophetData?.entries) {
      for (const pe of prophetData.entries) {
        // Avoid duplicates — prophet_events are milestones, not battles
        result.push({
          id: pe.id,
          name: pe.event.tr || pe.event.en || '',
          year_ce: pe.date_ce,
          period: yearToPeriod(pe.date_ce),
          category: 'milestone',
          tier: 1, // prophet events are all tier 1
          lat: undefined,
          lng: undefined,
        });
      }
    }

    // Sort by year_ce
    result.sort((a, b) => a.year_ce - b.year_ce);
    return result;
  }, [timeline, prophetData]);

  return {
    events,
    isLoading: tLoading || pLoading,
    militaryCount: timeline?.length ?? 0,
    prophetCount: prophetData?.entries?.length ?? 0,
  };
}
