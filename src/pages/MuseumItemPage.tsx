import { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useData } from '@/hooks/useData';
import { useLocalizedField } from '@/hooks/useLocalizedField';
import { getCategoryColor, getCategoryIcon } from '@/config/museum';
import { Spinner } from '@/components/common/Spinner';
import { MuseumImage } from '@/components/common/MuseumImage';
import type { LocalizedText } from '@/types';

interface MuseumItem {
  id: string;
  subcategory: string;
  name: LocalizedText;
  alternate_names?: string[];
  type?: any;
  material?: any;
  period?: string;
  date_acquired?: any;
  description: any;
  historical_context?: any;
  period_comparison?: any;
  related_persons?: any[];
  related_events?: any[];
  quran_refs?: any[];
  hadith_refs?: any[];
  sources?: any[];
  current_location?: any;
  authenticity_note?: any;
  visual_type?: string;
  visual_description?: any;
  dimensions?: any;
  exhibition_note?: any;
  tags?: string[];
  atlas_cross_ref?: any;
  coordinates?: { lat: number; lng: number };
  image?: string;
}

interface CategoryData {
  category: string;
  items: MuseumItem[];
}

export default function MuseumItemPage() {
  const { category, id } = useParams<{ category: string; id: string }>();
  const { localize, lang } = useLocalizedField();
  const navigate = useNavigate();

  const { data: catData, isLoading } = useData<CategoryData>(
    category ? `museum/museum_${category}` : '__none__',
    !!category,
  );

  const item = useMemo(() => catData?.items?.find((it) => it.id === id), [catData, id]);
  const color = getCategoryColor(category ?? '');

  if (isLoading) return <div className="flex h-[60vh] items-center justify-center"><Spinner size="lg" /></div>;

  if (!item) {
    return (
      <div className="flex flex-col items-center gap-4 p-12 text-center">
        <span className="text-4xl">❌</span>
        <p style={{ color: 'var(--text-secondary)' }}>{lang === 'en' ? 'Item not found' : 'Öğe bulunamadı'}</p>
        <Link to={`/museum/${category ?? ''}`} className="text-sm underline" style={{ color: 'var(--text-accent)' }}>← {lang === 'en' ? 'Back' : 'Geri'}</Link>
      </div>
    );
  }

  const txt = (v: any): string => {
    if (!v) return '';
    if (typeof v === 'string') return v;
    if (typeof v === 'number') return String(v);
    if (v.tr || v.en || v.ar) return localize(v);
    if (typeof v === 'object') {
      return Object.entries(v).map(([k, val]) => k + ': ' + String(val)).join(', ');
    }
    return String(v);
  };

  return (
    <div className="page-enter flex flex-col gap-4 p-4 pb-24 sm:p-6">
      <div className="mx-auto w-full max-w-4xl">
        <Link to={`/museum/${category ?? ''}`} className="mb-4 inline-flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>
          ← {lang === 'en' ? 'Back to list' : 'Listeye dön'}
        </Link>

        {/* ─── Hero Card ─── */}
        <div className="card mb-6 overflow-hidden">
          {/* Hero Image */}
          <MuseumImage
            src={item.image}
            alt={localize(item.name)}
            category={category ?? ''}
            className="w-full"
            aspectRatio="16/9"
            rounded=""
          />

          <div className="p-5 sm:p-6" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl" style={{ background: `${color}12`, border: `2px solid ${color}40` }}>
                {getCategoryIcon(category ?? '')}
              </span>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold sm:text-2xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{localize(item.name)}</h1>
                {item.alternate_names && item.alternate_names.length > 0 && (
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--text-tertiary)' }}>{item.alternate_names.join(' · ')}</p>
                )}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="badge" style={{ background: `${color}12`, color, border: `1px solid ${color}25` }}>
                    {item.subcategory.replace(/_/g, ' ')}
                  </span>
                  {item.period && <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>{item.period}</span>}
                  {item.visual_type && item.visual_type !== 'none' && (
                    <span className="badge" style={{ background: 'rgba(124,58,237,0.08)', color: '#7c3aed' }}>{item.visual_type.replace(/_/g, ' ')}</span>
                  )}
                  {item.coordinates && (
                    <button
                      type="button"
                      onClick={() => navigate(`/map?fly=${item.coordinates!.lat},${item.coordinates!.lng},12`)}
                      className="badge cursor-pointer transition-all hover:scale-105"
                      style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--text-accent)', border: '1px solid rgba(212,175,55,0.2)' }}
                    >
                      🗺️ {lang === 'ar' ? 'عرض على الخريطة' : lang === 'en' ? 'Show on Map' : 'Haritada Göster'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-px sm:grid-cols-4" style={{ background: 'var(--border-color)' }}>
            {[
              { label: lang === 'en' ? 'Material' : 'Malzeme', value: txt(item.material) || '—', icon: '🔩' },
              { label: lang === 'en' ? 'Dimensions' : 'Boyutlar', value: txt(item.dimensions) || '—', icon: '📏' },
              { label: lang === 'en' ? 'Location' : 'Bulunduğu Yer', value: txt(item.current_location) || '—', icon: '🏛️' },
              { label: lang === 'en' ? 'Type' : 'Tür', value: txt(item.type) || '—', icon: '📋' },
            ].map((s, i) => (
              <div key={i} className="p-3" style={{ background: 'var(--bg-secondary)' }}>
                <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{s.icon} {s.label}</p>
                <p className="text-xs font-medium mt-0.5 line-clamp-2" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Description ─── */}
        <div className="card p-5 sm:p-6 mb-4">
          <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-accent)' }}>📜 {lang === 'en' ? 'Description' : 'Açıklama'}</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{txt(item.description)}</p>
        </div>

        {/* ─── Historical Context ─── */}
        {item.historical_context && (
          <div className="card p-5 sm:p-6 mb-4">
            <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-accent)' }}>📚 {lang === 'en' ? 'Historical Context' : 'Tarihî Bağlam'}</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{txt(item.historical_context)}</p>
          </div>
        )}

        {/* ─── Period Comparison ─── */}
        {item.period_comparison && (
          <div className="card p-5 sm:p-6 mb-4">
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-accent)' }}>⚖️ {lang === 'en' ? 'Before & After Islam' : 'İslâm Öncesi ve Sonrası'}</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg p-3" style={{ background: 'rgba(161,98,7,0.06)', border: '1px solid rgba(161,98,7,0.15)' }}>
                <p className="text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: '#a16207' }}>{lang === 'en' ? 'Pre-Islamic' : 'İslâm Öncesi'}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>{txt((item.period_comparison as any).jahiliyya || (item.period_comparison as any).pre_islamic)}</p>
              </div>
              <div className="rounded-lg p-3" style={{ background: 'rgba(21,128,61,0.06)', border: '1px solid rgba(21,128,61,0.15)' }}>
                <p className="text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: '#15803d' }}>{lang === 'en' ? 'Islamic' : 'İslâmî'}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>{txt((item.period_comparison as any).islamic)}</p>
              </div>
            </div>
          </div>
        )}

        {/* ─── Cross References ─── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
          {/* Related Persons */}
          {item.related_persons && item.related_persons.length > 0 && (
            <div className="card p-4">
              <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--text-accent)' }}>👤 {lang === 'en' ? 'Related Persons' : 'İlgili Kişiler'}</h3>
              <div className="flex flex-col gap-1">
                {item.related_persons.map((p: any, i: number) => {
                  const name = txt(p.name || p.id || '');
                  const detail = txt(p.relation || p.role || '');
                  const linkId = p.id;
                  const inner = (
                    <div className="flex items-center gap-2 rounded px-2 py-1.5 text-xs transition-colors hover:bg-[var(--bg-tertiary)]" style={{ color: 'var(--text-primary)' }}>
                      <span>👤</span> {name} {detail && <span className="ml-auto text-[10px]" style={{ color: 'var(--text-tertiary)' }}>({detail})</span>}
                    </div>
                  );
                  return linkId
                    ? <Link key={`${linkId}-${i}`} to={`/companions/${linkId}`} style={{ textDecoration: 'none' }}>{inner}</Link>
                    : <div key={i}>{inner}</div>;
                })}
              </div>
            </div>
          )}

          {/* Related Events */}
          {item.related_events && item.related_events.length > 0 && (
            <div className="card p-4">
              <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--text-accent)' }}>⚔️ {lang === 'en' ? 'Related Events' : 'İlgili Olaylar'}</h3>
              <div className="flex flex-col gap-1">
                {item.related_events.map((ev: any, i: number) => {
                  const name = txt(ev.name || ev.event || '');
                  const detail = ev.year_ce ? `${ev.year_ce} CE` : (ev.role ? txt(ev.role) : '');
                  const linkId = ev.id;
                  const inner = (
                    <div className="flex items-center gap-2 rounded px-2 py-1.5 text-xs transition-colors hover:bg-[var(--bg-tertiary)]" style={{ color: 'var(--text-primary)' }}>
                      <span>⚔️</span> {name} {detail && <span className="ml-auto text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{detail}</span>}
                    </div>
                  );
                  return linkId
                    ? <Link key={`${linkId}-${i}`} to={`/battles/${linkId}`} style={{ textDecoration: 'none' }}>{inner}</Link>
                    : <div key={i}>{inner}</div>;
                })}
              </div>
            </div>
          )}
        </div>

        {/* ─── Quran & Hadith Refs ─── */}
        {((item.quran_refs && item.quran_refs.length > 0) || (item.hadith_refs && item.hadith_refs.length > 0)) && (
          <div className="card p-5 sm:p-6 mb-4">
            {item.quran_refs && item.quran_refs.length > 0 && (
              <div className="mb-3">
                <h3 className="text-xs font-semibold mb-1" style={{ color: 'var(--text-accent)' }}>📖 {lang === 'en' ? "Qur'an References" : "Kur'ân Referansları"}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {item.quran_refs.map((r: any, i: number) => {
                    const label = typeof r === 'string' ? r : (r.surah && r.ayah ? `${r.surah}:${r.ayah}` : txt(r));
                    return (
                      <span key={i} className="px-2 py-0.5 rounded text-xs" style={{ background: 'rgba(212,175,55,0.08)', color: 'var(--text-accent)', border: '1px solid rgba(212,175,55,0.15)' }}>{label}</span>
                    );
                  })}
                </div>
              </div>
            )}
            {item.hadith_refs && item.hadith_refs.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold mb-1" style={{ color: 'var(--text-accent)' }}>📜 {lang === 'en' ? 'Hadith References' : 'Hadis Referansları'}</h3>
                <div className="flex flex-col gap-1">
                  {item.hadith_refs.map((r: any, i: number) => {
                    const label = typeof r === 'string' ? r : (r.collection ? `${r.collection}${r.book ? ', ' + r.book : ''}${r.number ? ' #' + r.number : ''}` : txt(r));
                    return <p key={i} className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</p>;
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── Sources ─── */}
        {item.sources && item.sources.length > 0 && (
          <div className="card p-5 sm:p-6">
            <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--text-accent)' }}>📎 {lang === 'en' ? 'Sources' : 'Kaynaklar'}</h3>
            <div className="flex flex-col gap-1.5">
              {item.sources.map((s: any, i: number) => (
                <p key={i} className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {typeof s === 'string' ? s : (s.author ? <>{s.author}, <em>{s.title}</em>{s.volume ? `, c. ${s.volume}` : ''}{s.page ? `, s. ${s.page}` : ''}</> : txt(s))}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Authenticity note */}
        {item.authenticity_note && (
          <div className="mt-4 rounded-lg p-3" style={{ background: 'rgba(161,98,7,0.06)', border: '1px solid rgba(161,98,7,0.15)' }}>
            <p className="text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: '#a16207' }}>⚠️ {lang === 'en' ? 'Authenticity Note' : 'Otantiklik Notu'}</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{txt(item.authenticity_note)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
