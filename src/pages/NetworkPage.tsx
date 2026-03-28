import { useState, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useData } from '@/hooks/useData';
import { useLocalizedField } from '@/hooks/useLocalizedField';
import { ListSkeleton } from '@/components/common/Skeleton';
import type { LocalizedText } from '@/types';

/* ─── Types ─── */
interface TabiinNode {
  id: string;
  name: LocalizedText;
  city?: string;
  death_ce?: number;
  tabaka?: number;
  generation?: string;
  specialization?: string;
  teachers?: string[];
  school?: string;
  gender?: string;
}

interface TSEdge {
  source: string;
  target: string;
  type?: string;
}

interface MuahatPair {
  muhajir: string;
  ansar: string;
  muhajir_name: string;
  ansar_name: string;
  note?: string;
}

interface CompanionNode {
  id: string;
  name: LocalizedText;
  category?: string;
}

interface TribeNode {
  id: string;
  name: LocalizedText;
  center_lat?: number;
  center_lng?: number;
  description?: string;
  region?: string;
  territory_description?: string;
  type?: string;
  clans?: { id: string; name: string; note?: string }[];
}

type NetworkView = 'teacher-student' | 'tribes' | 'muahat';

/* ─── Simple Force-Directed Layout ─── */
interface SimNode {
  id: string;
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  group: string;
  size: number;
}
interface SimEdge {
  source: string;
  target: string;
}

function runForceLayout(nodes: SimNode[], edges: SimEdge[], width: number, height: number, iterations = 80) {
  // Initialize positions
  for (const n of nodes) {
    n.x = width / 2 + (Math.random() - 0.5) * width * 0.8;
    n.y = height / 2 + (Math.random() - 0.5) * height * 0.8;
    n.vx = 0;
    n.vy = 0;
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const k = Math.sqrt((width * height) / nodes.length) * 0.8;

  for (let iter = 0; iter < iterations; iter++) {
    const temp = 1 - iter / iterations;

    // Repulsion
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i]!, b = nodes[j]!;
        let dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const force = (k * k) / dist * temp * 0.5;
        dx = (dx / dist) * force;
        dy = (dy / dist) * force;
        a.vx += dx; a.vy += dy;
        b.vx -= dx; b.vy -= dy;
      }
    }

    // Attraction
    for (const e of edges) {
      const a = nodeMap.get(e.source), b = nodeMap.get(e.target);
      if (!a || !b) continue;
      let dx = b.x - a.x, dy = b.y - a.y;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
      const force = (dist / k) * temp * 0.3;
      dx = (dx / dist) * force;
      dy = (dy / dist) * force;
      a.vx += dx; a.vy += dy;
      b.vx -= dx; b.vy -= dy;
    }

    // Gravity toward center
    for (const n of nodes) {
      n.vx += (width / 2 - n.x) * 0.005 * temp;
      n.vy += (height / 2 - n.y) * 0.005 * temp;
    }

    // Apply
    for (const n of nodes) {
      const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
      const maxSpeed = 10 * temp;
      if (speed > maxSpeed) {
        n.vx = (n.vx / speed) * maxSpeed;
        n.vy = (n.vy / speed) * maxSpeed;
      }
      n.x += n.vx;
      n.y += n.vy;
      n.x = Math.max(30, Math.min(width - 30, n.x));
      n.y = Math.max(30, Math.min(height - 30, n.y));
      n.vx *= 0.7;
      n.vy *= 0.7;
    }
  }

  return { nodes, edges };
}

/* ─── GROUP COLORS ─── */
const GROUP_COLORS: Record<string, string> = {
  sahabe: '#d4af37',
  tabiin: '#2e5984',
  tabiin_1: '#2e5984',
  tabiin_2: '#15803d',
  tabiin_3: '#7c3aed',
  muhajir: '#8b4513',
  ansar: '#2e5984',
  medine: '#15803d',
  kufe: '#b91c1c',
  basra: '#d97706',
  mekke: '#a16207',
  misir: '#0891b2',
  default: '#6b7280',
  // Tribe regions
  'Mekke': '#a16207',
  'Medine': '#15803d',
  'Hicaz': '#d4af37',
  'Necid': '#8b4513',
  'Yemen': '#0891b2',
  'Kuzey Arabistan': '#b91c1c',
  'Güney Arabistan': '#7c3aed',
  'Suriye Çölü': '#d97706',
};

/* ─── MAIN COMPONENT ─── */
export default function NetworkPage() {
  const { t } = useTranslation('pages');
  const { localize } = useLocalizedField();
  const navigate = useNavigate();

  // Determine active sub-view from URL
  const pathSegment = window.location.pathname.split('/').pop() ?? '';
  const activeView: NetworkView =
    pathSegment === 'tribes' ? 'tribes' :
    pathSegment === 'muahat' ? 'muahat' :
    'teacher-student';

  const { data: tabieen, isLoading: lt } = useData<TabiinNode[]>('tabieen');
  const { data: tsEdges, isLoading: le } = useData<TSEdge[]>('teacher_student_edges');
  const { data: muahat, isLoading: lm } = useData<MuahatPair[]>('muahat');
  const { data: companions } = useData<CompanionNode[]>('companions');
  const { data: tribes, isLoading: ltb } = useData<TribeNode[]>('tribes');

  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const WIDTH = 900, HEIGHT = 600;

  // Build graph data
  const graph = useMemo(() => {
    if (activeView === 'tribes') {
      if (!tribes) return null;
      const nodes: SimNode[] = [];
      const edges: SimEdge[] = [];

      // Normalize region for grouping
      const normalizeRegion = (r?: string): string => {
        if (!r) return 'default';
        const low = r.toLowerCase();
        if (low.includes('mekke')) return 'Mekke';
        if (low.includes('medine')) return 'Medine';
        if (low.includes('hicaz')) return 'Hicaz';
        if (low.includes('necid') || low.includes('yemâme')) return 'Necid';
        if (low.includes('yemen') || low.includes('hadra')) return 'Yemen';
        if (low.includes('güney')) return 'Güney Arabistan';
        if (low.includes('kuzey') || low.includes('şam') || low.includes('ürdün')) return 'Kuzey Arabistan';
        if (low.includes('suriye') || low.includes('irak') || low.includes('mezopotamya')) return 'Suriye Çölü';
        return 'default';
      };

      // Build nodes
      for (const t of tribes) {
        const label = localize(t.name);
        const region = normalizeRegion(t.region);
        const clanCount = t.clans?.length ?? 0;
        nodes.push({ id: t.id, label, x: 0, y: 0, vx: 0, vy: 0, group: region, size: Math.min(4 + clanCount * 0.8, 14) });
      }

      // Build edges: connect tribes in same region (nearest neighbors only)
      const regionGroups = new Map<string, string[]>();
      for (const n of nodes) {
        const arr = regionGroups.get(n.group) || [];
        arr.push(n.id);
        regionGroups.set(n.group, arr);
      }
      for (const [, ids] of regionGroups) {
        for (let i = 0; i < ids.length; i++) {
          for (let j = i + 1; j < Math.min(i + 3, ids.length); j++) {
            edges.push({ source: ids[i]!, target: ids[j]! });
          }
        }
      }

      return runForceLayout(nodes, edges, WIDTH, HEIGHT, 80);
    }

    if (activeView === 'muahat') {
      if (!muahat || !companions) return null;
      const compMap = new Map(companions.map((c) => [c.id, c]));
      const nodes: SimNode[] = [];
      const edges: SimEdge[] = [];
      const seen = new Set<string>();

      for (const pair of muahat) {
        if (!seen.has(pair.muhajir)) {
          const c = compMap.get(pair.muhajir);
          nodes.push({ id: pair.muhajir, label: pair.muhajir_name || (c ? localize(c.name) : pair.muhajir), x: 0, y: 0, vx: 0, vy: 0, group: 'muhajir', size: 6 });
          seen.add(pair.muhajir);
        }
        if (!seen.has(pair.ansar)) {
          const c = compMap.get(pair.ansar);
          nodes.push({ id: pair.ansar, label: pair.ansar_name || (c ? localize(c.name) : pair.ansar), x: 0, y: 0, vx: 0, vy: 0, group: 'ansar', size: 6 });
          seen.add(pair.ansar);
        }
        edges.push({ source: pair.muhajir, target: pair.ansar });
      }

      return runForceLayout(nodes, edges, WIDTH, HEIGHT, 60);
    }

    // Teacher-student
    if (!tabieen || !tsEdges || !companions) return null;
    const compMap = new Map(companions.map((c) => [c.id, c]));
    const tabMap = new Map(tabieen.map((t) => [t.id, t]));
    const nodes: SimNode[] = [];
    const edges: SimEdge[] = [];

    // Only include nodes that have at least one edge
    const connectedIds = new Set<string>();
    for (const e of tsEdges) {
      connectedIds.add(e.source);
      connectedIds.add(e.target);
    }

    // Limit to top ~150 most connected nodes for performance
    const degreeMap = new Map<string, number>();
    for (const e of tsEdges) {
      degreeMap.set(e.source, (degreeMap.get(e.source) ?? 0) + 1);
      degreeMap.set(e.target, (degreeMap.get(e.target) ?? 0) + 1);
    }
    const topIds = [...degreeMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 150)
      .map(([id]) => id);
    const topSet = new Set(topIds);

    for (const id of topIds) {
      const comp = compMap.get(id);
      const tab = tabMap.get(id);
      const label = comp ? localize(comp.name) : tab ? localize(tab.name) : id;
      const group = comp ? 'sahabe' : tab?.city ?? 'default';
      const degree = degreeMap.get(id) ?? 1;
      nodes.push({ id, label, x: 0, y: 0, vx: 0, vy: 0, group, size: Math.min(3 + degree, 12) });
    }

    for (const e of tsEdges) {
      if (topSet.has(e.source) && topSet.has(e.target)) {
        edges.push(e);
      }
    }

    return runForceLayout(nodes, edges, WIDTH, HEIGHT, 100);
  }, [activeView, tabieen, tsEdges, muahat, companions, tribes, localize]);

  // Highlighted edges for hovered/selected node
  const highlightedEdges = useMemo(() => {
    const target = selectedNode ?? hoveredNode;
    if (!target || !graph) return new Set<number>();
    const set = new Set<number>();
    graph.edges.forEach((e, i) => {
      if (e.source === target || e.target === target) set.add(i);
    });
    return set;
  }, [selectedNode, hoveredNode, graph]);

  const connectedNodeIds = useMemo(() => {
    const target = selectedNode ?? hoveredNode;
    if (!target || !graph) return new Set<string>();
    const set = new Set<string>([target]);
    for (const e of graph.edges) {
      if (e.source === target) set.add(e.target);
      if (e.target === target) set.add(e.source);
    }
    return set;
  }, [selectedNode, hoveredNode, graph]);

  const VIEWS: { key: NetworkView; label: string; icon: string }[] = [
    { key: 'teacher-student', label: t('network_tab_teacher'), icon: '📚' },
    { key: 'tribes', label: t('network_tab_tribes'), icon: '🏕️' },
    { key: 'muahat', label: t('network_tab_muahat'), icon: '🤝' },
  ];

  const isLoading = lt || le || lm || ltb;

  return (
    <div className="page-enter flex flex-col gap-4 p-4 pb-24 sm:p-6">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <span className="text-2xl">🕸️</span>
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              {t('network_title')}
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              {t('network_subtitle', { tabieen: tabieen?.length ?? 350, edges: tsEdges?.length ?? 674, tribes: tribes?.length ?? 124, muahat: muahat?.length ?? 21 })}
            </p>
          </div>
        </div>

        {/* Sub-view tabs */}
        <div className="mb-4 flex gap-1 overflow-x-auto rounded-lg p-1" style={{ background: 'var(--bg-tertiary)' }}>
          {VIEWS.map((v) => (
            <button
              key={v.key}
              onClick={() => navigate(`/network/${v.key}`)}
              className="flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all"
              style={{
                background: activeView === v.key ? 'var(--bg-secondary)' : 'transparent',
                color: activeView === v.key ? 'var(--text-primary)' : 'var(--text-tertiary)',
                boxShadow: activeView === v.key ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <span>{v.icon}</span>
              <span>{v.label}</span>
            </button>
          ))}
        </div>

        {isLoading && <ListSkeleton count={8} />}

        {!isLoading && graph && (
          <div className="card overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
            {/* Legend */}
            <div className="flex flex-wrap gap-2 p-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
              {activeView === 'muahat' ? (
                <>
                  <span className="flex items-center gap-1.5 text-xs"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: GROUP_COLORS.muhajir }} /> {t('network_legend_muhajir')}</span>
                  <span className="flex items-center gap-1.5 text-xs"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: GROUP_COLORS.ansar }} /> {t('network_legend_ansar')}</span>
                </>
              ) : activeView === 'tribes' ? (
                <>
                  {['Mekke', 'Medine', 'Hicaz', 'Necid', 'Yemen', 'Kuzey Arabistan', 'Güney Arabistan', 'Suriye Çölü'].map((r) => (
                    <span key={r} className="flex items-center gap-1.5 text-xs"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: GROUP_COLORS[r] ?? GROUP_COLORS.default }} /> {r}</span>
                  ))}
                </>
              ) : (
                <>
                  <span className="flex items-center gap-1.5 text-xs"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: GROUP_COLORS.sahabe }} /> {t('network_legend_sahabi')}</span>
                  <span className="flex items-center gap-1.5 text-xs"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: GROUP_COLORS.medine }} /> Medîne</span>
                  <span className="flex items-center gap-1.5 text-xs"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: GROUP_COLORS.kufe }} /> Kûfe</span>
                  <span className="flex items-center gap-1.5 text-xs"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: GROUP_COLORS.basra }} /> Basra</span>
                  <span className="flex items-center gap-1.5 text-xs"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: GROUP_COLORS.mekke }} /> Mekke</span>
                </>
              )}
            </div>

            {/* SVG Graph */}
            <svg
              ref={svgRef}
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              className="w-full"
              style={{ background: 'var(--bg-secondary)', minHeight: 400, maxHeight: 600, cursor: 'grab' }}
              onClick={() => setSelectedNode(null)}
            >
              {/* Edges */}
              {graph.edges.map((e, i) => {
                const sn = graph.nodes.find((n) => n.id === e.source);
                const tn = graph.nodes.find((n) => n.id === e.target);
                if (!sn || !tn) return null;
                const highlighted = highlightedEdges.has(i);
                const anyActive = selectedNode || hoveredNode;
                return (
                  <line
                    key={i}
                    x1={sn.x} y1={sn.y} x2={tn.x} y2={tn.y}
                    stroke={highlighted ? 'var(--text-accent)' : 'var(--border-color)'}
                    strokeWidth={highlighted ? 1.5 : 0.5}
                    opacity={anyActive ? (highlighted ? 0.8 : 0.08) : 0.2}
                  />
                );
              })}

              {/* Nodes */}
              {graph.nodes.map((n) => {
                const anyActive = selectedNode || hoveredNode;
                const isConnected = connectedNodeIds.has(n.id);
                const isSelected = n.id === selectedNode || n.id === hoveredNode;
                const color = GROUP_COLORS[n.group] ?? GROUP_COLORS.default;
                return (
                  <g
                    key={n.id}
                    transform={`translate(${n.x},${n.y})`}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredNode(n.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={(e) => { e.stopPropagation(); setSelectedNode(n.id === selectedNode ? null : n.id); }}
                    opacity={anyActive ? (isConnected ? 1 : 0.15) : 1}
                  >
                    <circle r={n.size} fill={color} stroke={isSelected ? '#fff' : 'none'} strokeWidth={isSelected ? 2 : 0} />
                    {(isSelected || (n.size >= 6 && !anyActive)) && (
                      <text
                        y={n.size + 10}
                        textAnchor="middle"
                        fill="var(--text-primary)"
                        fontSize={isSelected ? 10 : 7}
                        fontWeight={isSelected ? 700 : 400}
                        style={{ pointerEvents: 'none' }}
                      >
                        {n.label.length > 20 ? n.label.slice(0, 20) + '…' : n.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Selected node info */}
            {selectedNode && (() => {
              const node = graph.nodes.find((n) => n.id === selectedNode);
              const tribeData = activeView === 'tribes' ? tribes?.find((t) => t.id === selectedNode) : null;
              return (
                <div className="p-3 flex items-center gap-3" style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-tertiary)' }}>
                  <span className="text-lg">{activeView === 'tribes' ? '🏕️' : '👤'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                      {node?.label ?? selectedNode}
                    </p>
                    {tribeData ? (
                      <>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          {tribeData.region ?? ''}{tribeData.clans?.length ? ` · ${tribeData.clans.length} kol` : ''}
                        </p>
                        {tribeData.description && (
                          <p className="mt-1 text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                            {tribeData.description}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {t('network_connections', { count: connectedNodeIds.size - 1 })}
                      </p>
                    )}
                  </div>
                  {activeView !== 'tribes' && (
                    <Link
                      to={`/companions/${selectedNode}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium shrink-0"
                      style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--text-accent)', textDecoration: 'none' }}
                    >
                      {t('network_view_profile')} →
                    </Link>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
