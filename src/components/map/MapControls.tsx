import { useMapStore, type MapLayerKey } from '@/stores/useMapStore';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface LayerDef {
  key: MapLayerKey;
  icon: string;
  color: string;
  label: { tr: string; en: string; ar: string };
}

const LAYERS: LayerDef[] = [
  { key: 'battles', icon: '⚔️', color: '#b91c1c', label: { tr: 'Savaşlar', en: 'Battles', ar: 'الغزوات' } },
  { key: 'locations', icon: '📍', color: '#1d4ed8', label: { tr: 'Mekânlar', en: 'Locations', ar: 'الأماكن' } },
  { key: 'companions', icon: '👤', color: '#7c3aed', label: { tr: 'Sahâbîler', en: 'Companions', ar: 'الصحابة' } },
  { key: 'tribes', icon: '🏕️', color: '#a16207', label: { tr: 'Kabileler', en: 'Tribes', ar: 'القبائل' } },
  { key: 'tradeRoutes', icon: '🐪', color: '#d97706', label: { tr: 'Ticaret Yolları', en: 'Trade Routes', ar: 'طرق التجارة' } },
  { key: 'hijrah', icon: '🕌', color: '#15803d', label: { tr: 'Hicret Güzergâhı', en: 'Hijrah Route', ar: 'طريق الهجرة' } },
  { key: 'museum', icon: '🏛️', color: '#0891b2', label: { tr: 'Müze Pinleri', en: 'Museum Pins', ar: 'دبابيس المتحف' } },
  { key: 'geography', icon: '⛰️', color: '#7c3aed', label: { tr: 'Coğrafya', en: 'Geography', ar: 'الجغرافيا' } },
];

export function MapControls() {
  const { i18n } = useTranslation();
  const lang = i18n.language as 'tr' | 'en' | 'ar';
  const { activeLayers, toggleLayer } = useMapStore();
  const [expanded, setExpanded] = useState(true);

  return (
    <div
      className="map-controls-wrapper absolute top-3 right-3 z-[1000]"
      style={{ maxWidth: 220 }}
    >
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-xl transition-all"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(var(--glass-blur))',
          WebkitBackdropFilter: 'blur(var(--glass-blur))',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--shadow-md)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-display)',
        }}
      >
        <span style={{ fontSize: 16 }}>🗂️</span>
        <span>{lang === 'tr' ? 'Katmanlar' : lang === 'ar' ? 'الطبقات' : 'Layers'}</span>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ fontSize: 12, marginInlineStart: 'auto' }}
        >
          ▼
        </motion.span>
      </button>

      {/* Layer list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mt-2 overflow-hidden rounded-xl"
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(var(--glass-blur))',
              WebkitBackdropFilter: 'blur(var(--glass-blur))',
              border: '1px solid var(--glass-border)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div className="p-2 flex flex-col gap-1">
              {LAYERS.map((layer) => {
                const active = activeLayers.includes(layer.key);
                return (
                  <button
                    key={layer.key}
                    type="button"
                    onClick={() => toggleLayer(layer.key)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-start"
                    style={{
                      background: active ? `${layer.color}18` : 'transparent',
                      border: active ? `1px solid ${layer.color}40` : '1px solid transparent',
                      color: active ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    }}
                  >
                    {/* Color dot */}
                    <span
                      className="flex-shrink-0 rounded-full transition-all"
                      style={{
                        width: 10,
                        height: 10,
                        background: active ? layer.color : 'var(--border-color)',
                        boxShadow: active ? `0 0 6px ${layer.color}60` : 'none',
                      }}
                    />
                    <span style={{ fontSize: 14 }}>{layer.icon}</span>
                    <span className="text-xs font-medium truncate">{layer.label[lang]}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
