import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { useMapStore } from '@/stores/useMapStore';
import { useLocalizedField } from '@/hooks/useLocalizedField';
import { ERA_RANGES, TIMELINE_START, TIMELINE_END } from '@/config/constants';
import type { UnifiedEvent } from '@/types';

/* ─── EVENT CATEGORY CONFIG ─── */

const CAT_COLORS: Record<string, string> = {
  battle: '#dc2626',
  seriyye: '#f97316',
  conquest: '#ea580c',
  milestone: '#d4af37',
  political: '#1d4ed8',
  revelation: '#7c3aed',
  migration: '#15803d',
};

const CAT_ICONS: Record<string, string> = {
  battle: '⚔️',
  seriyye: '🏹',
  conquest: '🏴',
  milestone: '★',
  political: '👑',
  revelation: '📖',
  migration: '🕌',
};

/* ─── ERA COLORS ─── */

const ERA_VIS = {
  mekke: { bg: 'rgba(161, 98, 7, 0.08)', border: '#a16207', text: '#a16207' },
  medine: { bg: 'rgba(21, 128, 61, 0.08)', border: '#15803d', text: '#15803d' },
  hulefa: { bg: 'rgba(29, 78, 216, 0.08)', border: '#1d4ed8', text: '#1d4ed8' },
};

interface TimelineChartProps {
  events: UnifiedEvent[];
}

export function TimelineChart({ events }: TimelineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 1200, height: 480 });
  const [tooltip, setTooltip] = useState<{ x: number; y: number; event: UnifiedEvent } | null>(null);

  const { currentYear, setCurrentYear } = useTimelineStore();
  const { setView } = useMapStore();
  const { localize } = useLocalizedField();

  // Observe container size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width } = entry.contentRect;
      setDims({ width: Math.max(width, 600), height: 480 });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Draw D3 chart
  useEffect(() => {
    if (!svgRef.current || events.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 30, bottom: 60, left: 30 };
    const w = dims.width - margin.left - margin.right;
    const h = dims.height - margin.top - margin.bottom;

    const g = svg
      .attr('width', dims.width)
      .attr('height', dims.height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // ─── X SCALE ───
    const xScale = d3.scaleLinear().domain([TIMELINE_START, TIMELINE_END]).range([0, w]);

    // ─── ERA BANDS ───
    const eras = Object.entries(ERA_RANGES) as [keyof typeof ERA_RANGES, (typeof ERA_RANGES)[keyof typeof ERA_RANGES]][];
    for (const [key, era] of eras) {
      const c = ERA_VIS[key];
      const x1 = xScale(era.start);
      const x2 = xScale(era.end);

      g.append('rect')
        .attr('x', x1).attr('y', 0).attr('width', x2 - x1).attr('height', h)
        .attr('fill', c.bg).attr('rx', 6);

      g.append('text')
        .attr('x', (x1 + x2) / 2).attr('y', -10)
        .attr('text-anchor', 'middle').attr('fill', c.text)
        .attr('font-size', 11).attr('font-weight', 700)
        .attr('font-family', 'var(--font-display)').attr('opacity', 0.8)
        .text(localize(era.label));

      if (key !== 'mekke') {
        g.append('line')
          .attr('x1', x1).attr('y1', 0).attr('x2', x1).attr('y2', h)
          .attr('stroke', c.border).attr('stroke-width', 1)
          .attr('stroke-dasharray', '4,4').attr('opacity', 0.4);
      }
    }

    // ─── AXIS ───
    const xAxis = d3.axisBottom(xScale).tickFormat((d) => `${d}`).ticks(15);
    g.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(xAxis)
      .call((sel) => {
        sel.selectAll('text').attr('fill', 'var(--text-tertiary)').attr('font-size', 10);
        sel.selectAll('line').attr('stroke', 'var(--border-color)');
        sel.select('.domain').attr('stroke', 'var(--border-color)');
      });

    // ─── CURRENT YEAR LINE ───
    g.append('line')
      .attr('x1', xScale(currentYear)).attr('y1', -5)
      .attr('x2', xScale(currentYear)).attr('y2', h + 5)
      .attr('stroke', 'var(--text-accent)').attr('stroke-width', 2).attr('opacity', 0.8);

    g.append('text')
      .attr('x', xScale(currentYear)).attr('y', h + 35)
      .attr('text-anchor', 'middle').attr('fill', 'var(--text-accent)')
      .attr('font-size', 12).attr('font-weight', 700)
      .attr('font-family', 'var(--font-display)')
      .text(`${currentYear} CE`);

    // ─── SWIM LANES ───
    // Separate milestones (top) from battles (bottom), stack within year
    const topCounts = new Map<number, number>();
    const botCounts = new Map<number, number>();

    function getYPos(ev: UnifiedEvent): number {
      const isMilestone = ev.category === 'milestone' || ev.category === 'political' || ev.category === 'revelation' || ev.category === 'migration';
      const map = isMilestone ? topCounts : botCounts;
      const count = map.get(ev.year_ce) ?? 0;
      map.set(ev.year_ce, count + 1);

      if (isMilestone) {
        return 30 + count * 22; // top zone
      }
      // Battle zone — start from middle
      const baseY = h * 0.45;
      return baseY + count * 20;
    }

    // ─── EVENT DOTS ───
    const dotGroups = g.selectAll('.event-dot')
      .data(events)
      .enter()
      .append('g')
      .attr('class', 'event-dot')
      .attr('transform', (d) => `translate(${xScale(d.year_ce)},${getYPos(d)})`)
      .style('cursor', 'pointer');

    dotGroups.append('circle')
      .attr('r', (d) => {
        if (d.tier === 1) return 6;
        if (d.tier === 2) return 4.5;
        return 3.5;
      })
      .attr('fill', (d) => CAT_COLORS[d.category] ?? '#6b7280')
      .attr('stroke', 'var(--bg-secondary)')
      .attr('stroke-width', 1.5)
      .attr('opacity', (d) => d.year_ce <= currentYear ? 1 : 0.2)
      .style('transition', 'opacity 0.3s ease');

    // Hover
    dotGroups
      .on('mouseenter', function (event, d) {
        d3.select(this).select('circle').transition().duration(150).attr('r', 9);
        const rect = svgRef.current!.getBoundingClientRect();
        setTooltip({ x: event.clientX - rect.left, y: event.clientY - rect.top - 10, event: d });
      })
      .on('mouseleave', function (_, d) {
        const r = d.tier === 1 ? 6 : d.tier === 2 ? 4.5 : 3.5;
        d3.select(this).select('circle').transition().duration(150).attr('r', r);
        setTooltip(null);
      })
      .on('click', (_event, d) => {
        setCurrentYear(d.year_ce);
        if (d.lat && d.lng) {
          setView({ lat: d.lat, lng: d.lng }, 9);
        }
      });

    // ─── DRAG TO SCRUB ───
    const dragArea = g.append('rect')
      .attr('x', 0).attr('y', h).attr('width', w).attr('height', 50)
      .attr('fill', 'transparent').style('cursor', 'ew-resize');

    const drag = d3.drag<SVGRectElement, unknown>()
      .on('drag', (event) => {
        const year = Math.round(xScale.invert(event.x));
        setCurrentYear(Math.max(TIMELINE_START, Math.min(TIMELINE_END, year)));
      });

    dragArea.call(drag);

  }, [dims, events, currentYear, localize, setCurrentYear, setView]);

  return (
    <div ref={containerRef} className="relative w-full overflow-x-auto">
      <svg ref={svgRef} className="block" />

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute z-50 pointer-events-none rounded-lg px-3 py-2"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--shadow-lg)',
            maxWidth: 260,
          }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <span style={{ fontSize: 13 }}>{CAT_ICONS[tooltip.event.category] ?? '•'}</span>
            <span
              className="text-xs font-bold leading-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              {tooltip.event.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs tabular-nums" style={{ color: 'var(--text-tertiary)' }}>
              {tooltip.event.year_ce} CE
            </span>
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ background: CAT_COLORS[tooltip.event.category] ?? '#6b7280' }}
            />
            <span className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>
              {tooltip.event.category}
            </span>
            {tooltip.event.result && (
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                · {tooltip.event.result.slice(0, 40)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
