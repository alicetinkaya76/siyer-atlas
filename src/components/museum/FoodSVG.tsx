/**
 * Mesa-i Nebevî — Food SVG Illustrations
 * Hand-crafted, Islamic art-inspired SVG illustrations for each food item.
 * Consistent 200×200 viewBox, CSS variable theming, warm earth-tone palette.
 */

import React from 'react';

interface FoodSVGProps {
  foodId: string;
  size?: number;
  className?: string;
}

/* ─── Islamic geometric border frame ─── */
function Frame({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Background */}
      <rect width="200" height="200" rx="16" fill={`${color}08`} />

      {/* Corner ornaments */}
      <g opacity="0.12" stroke={color} strokeWidth="0.8" fill="none">
        {/* Top-left */}
        <path d="M8 28 L8 8 L28 8" />
        <path d="M14 8 L8 14" />
        <circle cx="8" cy="8" r="2" fill={color} />
        {/* Top-right */}
        <path d="M172 8 L192 8 L192 28" />
        <path d="M186 8 L192 14" />
        <circle cx="192" cy="8" r="2" fill={color} />
        {/* Bottom-left */}
        <path d="M8 172 L8 192 L28 192" />
        <path d="M8 186 L14 192" />
        <circle cx="8" cy="192" r="2" fill={color} />
        {/* Bottom-right */}
        <path d="M192 172 L192 192 L172 192" />
        <path d="M192 186 L186 192" />
        <circle cx="192" cy="192" r="2" fill={color} />
      </g>

      {/* Subtle border */}
      <rect x="4" y="4" width="192" height="192" rx="14" stroke={color} strokeWidth="0.5" opacity="0.08" />

      {/* Content */}
      {children}
    </svg>
  );
}

/* ─── Individual Food Illustrations ─── */

function AcveHurmasi() {
  return (
    <Frame color="#8B4513">
      {/* Branch */}
      <path d="M70 35 Q100 30 130 35" stroke="#5C3317" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M65 37 Q100 32 135 37" stroke="#6B3E1F" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />

      {/* Date cluster - 7 dates (hadith reference) */}
      {[
        { cx: 75, cy: 58, rx: 9, ry: 14 },
        { cx: 95, cy: 55, rx: 9, ry: 15 },
        { cx: 115, cy: 53, rx: 9, ry: 14 },
        { cx: 85, cy: 80, rx: 9, ry: 14 },
        { cx: 105, cy: 78, rx: 9, ry: 15 },
        { cx: 125, cy: 76, rx: 9, ry: 14 },
        { cx: 100, cy: 100, rx: 10, ry: 15 },
      ].map((d, i) => (
        <g key={i}>
          {/* Stem */}
          <line x1={d.cx} y1={d.cy - d.ry} x2={d.cx} y2={35} stroke="#5C3317" strokeWidth="1" opacity="0.4" />
          {/* Date body */}
          <ellipse cx={d.cx} cy={d.cy} rx={d.rx} ry={d.ry}
            fill={i === 6 ? '#4A2400' : '#5C2D00'}
            stroke="#3A1A00" strokeWidth="0.5"
          />
          {/* Highlight */}
          <ellipse cx={d.cx - 2} cy={d.cy - 3} rx={d.rx * 0.4} ry={d.ry * 0.5}
            fill="white" opacity="0.08"
          />
        </g>
      ))}

      {/* "7" badge */}
      <circle cx="155" cy="110" r="14" fill="#d4af37" opacity="0.15" />
      <text x="155" y="115" textAnchor="middle" fill="#d4af37" fontSize="14" fontWeight="bold" fontFamily="serif">٧</text>

      {/* Plate */}
      <ellipse cx="100" cy="150" rx="55" ry="12" fill="#8B4513" opacity="0.08" />
      <ellipse cx="100" cy="148" rx="50" ry="10" fill="none" stroke="#8B4513" strokeWidth="0.8" opacity="0.15" />

      {/* Label */}
      <text x="100" y="178" textAnchor="middle" fill="#8B4513" fontSize="10" fontFamily="serif" opacity="0.6">عجوة المدينة</text>
    </Frame>
  );
}

function TazeHurma() {
  return (
    <Frame color="#D2691E">
      {/* Palm frond */}
      <path d="M50 25 Q100 15 150 25" stroke="#2D5016" strokeWidth="2" fill="none" />
      {[40, 60, 80, 100, 120, 140, 160].map((x, i) => (
        <path key={i} d={`M${x} ${25 - Math.abs(100 - x) * 0.05} Q${x + (x < 100 ? -15 : 15)} ${10} ${x + (x < 100 ? -25 : 25)} ${5}`}
          stroke="#3A6B22" strokeWidth="1" fill="none" opacity="0.5" />
      ))}

      {/* Fresh dates (lighter, amber color) */}
      {[
        { cx: 70, cy: 65 }, { cx: 90, cy: 60 }, { cx: 110, cy: 58 }, { cx: 130, cy: 63 },
        { cx: 80, cy: 88 }, { cx: 100, cy: 85 }, { cx: 120, cy: 87 },
      ].map((d, i) => (
        <g key={i}>
          <line x1={d.cx} y1={d.cy - 12} x2={d.cx} y2={26} stroke="#5C3317" strokeWidth="0.8" opacity="0.3" />
          <ellipse cx={d.cx} cy={d.cy} rx={8} ry={12}
            fill="#D2691E" stroke="#A0522D" strokeWidth="0.5"
          />
          <ellipse cx={d.cx - 1} cy={d.cy - 2} rx={3} ry={5} fill="white" opacity="0.12" />
        </g>
      ))}

      {/* Mizac indicator — warm glow */}
      <circle cx="100" cy="135" r="20" fill="#D2691E" opacity="0.06" />
      <text x="100" y="139" textAnchor="middle" fill="#D2691E" fontSize="9" fontFamily="serif" opacity="0.5">حارّ</text>

      <text x="100" y="178" textAnchor="middle" fill="#D2691E" fontSize="10" fontFamily="serif" opacity="0.6">الرُّطَب</text>
    </Frame>
  );
}

function Karpuz() {
  return (
    <Frame color="#2E8B57">
      {/* Whole watermelon */}
      <ellipse cx="100" cy="85" rx="50" ry="40" fill="#2E8B57" stroke="#1B5E37" strokeWidth="1" />
      {/* Stripes */}
      {[-30, -15, 0, 15, 30].map((offset, i) => (
        <path key={i} d={`M${100 + offset} 45 Q${100 + offset + 3} 85 ${100 + offset} 125`}
          stroke="#1B5E37" strokeWidth="2" fill="none" opacity="0.3" />
      ))}
      {/* Highlight */}
      <ellipse cx="85" cy="72" rx="18" ry="12" fill="white" opacity="0.06" />

      {/* Cut slice */}
      <path d="M120 110 L170 140 L120 170 Z" fill="#E74C3C" stroke="#C0392B" strokeWidth="1" />
      {/* Rind */}
      <path d="M120 110 L170 140 L120 170" fill="none" stroke="#2E8B57" strokeWidth="4" strokeLinejoin="round" />
      {/* Seeds */}
      {[
        { x: 135, y: 135 }, { x: 140, y: 148 }, { x: 148, y: 140 },
        { x: 130, y: 145 }, { x: 143, y: 155 },
      ].map((s, i) => (
        <ellipse key={i} cx={s.x} cy={s.y} rx="2" ry="3" fill="#2C1810" transform={`rotate(${20 + i * 15} ${s.x} ${s.y})`} />
      ))}

      <text x="100" y="190" textAnchor="middle" fill="#2E8B57" fontSize="10" fontFamily="serif" opacity="0.6">البطيخ</text>
    </Frame>
  );
}

function Tirit() {
  return (
    <Frame color="#B8860B">
      {/* Bowl */}
      <path d="M45 95 Q45 140 100 145 Q155 140 155 95" fill="#A0522D" opacity="0.15" />
      <ellipse cx="100" cy="95" rx="55" ry="18" fill="#CD853F" stroke="#A0522D" strokeWidth="1" />
      <ellipse cx="100" cy="95" rx="50" ry="15" fill="#DEB887" stroke="#A0522D" strokeWidth="0.5" />

      {/* Bread pieces (torn) */}
      {[
        "M70 88 Q75 80 85 82 Q88 88 82 92 Q75 94 70 88",
        "M90 82 Q96 76 105 78 Q108 84 102 88 Q94 90 90 82",
        "M110 85 Q118 78 125 82 Q128 88 120 92 Q112 90 110 85",
      ].map((d, i) => (
        <path key={i} d={d} fill="#F5DEB3" stroke="#DEB887" strokeWidth="0.5" />
      ))}

      {/* Meat pieces */}
      {[
        { x: 82, y: 75 }, { x: 108, y: 72 }, { x: 95, y: 70 },
      ].map((m, i) => (
        <ellipse key={i} cx={m.x} cy={m.y} rx={6} ry={4} fill="#8B4513" stroke="#6B3410" strokeWidth="0.5"
          transform={`rotate(${-10 + i * 15} ${m.x} ${m.y})`} />
      ))}

      {/* Squash pieces (beloved) */}
      <ellipse cx="75" cy="78" rx="5" ry="4" fill="#FF8C00" stroke="#E07000" strokeWidth="0.5" opacity="0.9" />
      <ellipse cx="115" cy="76" rx="4" ry="5" fill="#FF8C00" stroke="#E07000" strokeWidth="0.5" opacity="0.9" />

      {/* Steam */}
      {[85, 100, 115].map((x, i) => (
        <path key={i} d={`M${x} 60 Q${x + 5} 50 ${x} 40 Q${x - 5} 30 ${x} 20`}
          stroke="#A0522D" strokeWidth="1" fill="none" opacity="0.1" strokeLinecap="round" />
      ))}

      <text x="100" y="175" textAnchor="middle" fill="#B8860B" fontSize="10" fontFamily="serif" opacity="0.6">الثَّريد</text>
    </Frame>
  );
}

function Kabak() {
  return (
    <Frame color="#FF8C00">
      {/* Gourd body */}
      <path d="M100 40 Q60 50 55 90 Q50 130 75 150 Q90 160 100 160 Q110 160 125 150 Q150 130 145 90 Q140 50 100 40 Z"
        fill="#FF8C00" stroke="#E07000" strokeWidth="1" />
      {/* Ribs */}
      {[-20, -8, 5, 18].map((offset, i) => (
        <path key={i} d={`M${100 + offset} 42 Q${95 + offset} 100 ${100 + offset} 158`}
          stroke="#E07000" strokeWidth="1" fill="none" opacity="0.25" />
      ))}
      {/* Stem */}
      <path d="M97 40 Q98 30 100 25 Q102 30 103 40" fill="#5C3317" stroke="#4A2810" strokeWidth="0.5" />
      {/* Leaf */}
      <path d="M103 30 Q115 20 120 28 Q115 35 103 32" fill="#3A6B22" stroke="#2D5016" strokeWidth="0.5" opacity="0.7" />
      {/* Highlight */}
      <path d="M80 60 Q85 90 85 120" stroke="white" strokeWidth="3" fill="none" opacity="0.08" strokeLinecap="round" />

      <text x="100" y="185" textAnchor="middle" fill="#FF8C00" fontSize="10" fontFamily="serif" opacity="0.6">الدُّبّاء</text>
    </Frame>
  );
}

function Telbine() {
  return (
    <Frame color="#DAA520">
      {/* Bowl */}
      <path d="M40 90 Q40 145 100 150 Q160 145 160 90" fill="#8B7355" opacity="0.12" />
      <ellipse cx="100" cy="90" rx="60" ry="20" fill="#CD853F" stroke="#8B7355" strokeWidth="1" />
      <ellipse cx="100" cy="90" rx="55" ry="17" fill="#F5DEB3" stroke="#DEB887" strokeWidth="0.5" />

      {/* Soup surface */}
      <ellipse cx="100" cy="88" rx="48" ry="13" fill="#DAA520" opacity="0.3" />

      {/* Honey drizzle */}
      <path d="M80 85 Q90 82 100 85 Q110 88 120 85" stroke="#FFD700" strokeWidth="2" fill="none" opacity="0.5" strokeLinecap="round" />

      {/* Steam — more prominent (healing) */}
      {[80, 95, 110].map((x, i) => (
        <g key={i} opacity={0.15}>
          <path d={`M${x} 68 Q${x + 6} 55 ${x} 42 Q${x - 6} 30 ${x} 18`}
            stroke="#DAA520" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>
      ))}

      {/* Heart symbol (heals grief) */}
      <path d="M95 55 Q95 48 100 48 Q105 48 105 55 L100 62 Z"
        fill="#DAA520" opacity="0.2" />

      {/* Barley grains around */}
      {[
        { x: 35, y: 130 }, { x: 50, y: 140 }, { x: 145, y: 135 }, { x: 160, y: 128 },
      ].map((g, i) => (
        <ellipse key={i} cx={g.x} cy={g.y} rx="4" ry="2" fill="#DAA520" opacity="0.2"
          transform={`rotate(${30 + i * 20} ${g.x} ${g.y})`} />
      ))}

      <text x="100" y="178" textAnchor="middle" fill="#DAA520" fontSize="10" fontFamily="serif" opacity="0.6">التَّلبينة</text>
    </Frame>
  );
}

function Bal() {
  return (
    <Frame color="#FFD700">
      {/* Honey jar */}
      <path d="M75 60 L75 130 Q75 150 100 150 Q125 150 125 130 L125 60" fill="#FFD700" opacity="0.15" stroke="#DAA520" strokeWidth="1" />
      {/* Jar rim */}
      <rect x="70" y="55" width="60" height="10" rx="3" fill="#CD853F" stroke="#A0522D" strokeWidth="0.5" />
      {/* Honey level */}
      <path d="M78 80 L78 128 Q78 145 100 145 Q122 145 122 128 L122 80" fill="#FFD700" opacity="0.4" />
      {/* Honey drip */}
      <path d="M100 55 L100 45 Q95 40 100 35 Q105 30 100 25" stroke="#FFD700" strokeWidth="2" fill="none" opacity="0.3" strokeLinecap="round" />

      {/* Honey dipper */}
      <line x1="135" y1="40" x2="110" y2="80" stroke="#8B7355" strokeWidth="2.5" strokeLinecap="round" />
      {[0, 5, 10, 15].map((y, i) => (
        <ellipse key={i} cx="110" cy={80 + y} rx="7" ry="2.5" fill="#CD853F" stroke="#A0522D" strokeWidth="0.5" />
      ))}
      {/* Dripping honey from dipper */}
      <path d="M110 98 Q112 105 110 112" stroke="#FFD700" strokeWidth="2" fill="none" opacity="0.5" strokeLinecap="round" />

      {/* Quran reference indicator */}
      <text x="100" y="170" textAnchor="middle" fill="#DAA520" fontSize="8" fontFamily="serif" opacity="0.4">فيه شفاءٌ للنّاس</text>
      <text x="100" y="185" textAnchor="middle" fill="#FFD700" fontSize="10" fontFamily="serif" opacity="0.6">العسل</text>
    </Frame>
  );
}

function Zeytinyagi() {
  return (
    <Frame color="#556B2F">
      {/* Olive branch */}
      <path d="M40 50 Q80 35 140 45 Q160 50 170 60" stroke="#556B2F" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Leaves */}
      {[
        { x: 55, y: 45, a: -30 }, { x: 75, y: 38, a: -20 }, { x: 95, y: 36, a: -10 },
        { x: 115, y: 38, a: 5 }, { x: 135, y: 42, a: 15 }, { x: 155, y: 52, a: 25 },
        { x: 65, y: 52, a: 30 }, { x: 85, y: 48, a: 20 }, { x: 105, y: 45, a: 10 },
        { x: 125, y: 48, a: -15 },
      ].map((l, i) => (
        <ellipse key={i} cx={l.x} cy={l.y} rx="8" ry="3.5"
          fill={i % 2 === 0 ? '#556B2F' : '#6B8E23'} opacity="0.6"
          transform={`rotate(${l.a} ${l.x} ${l.y})`} />
      ))}
      {/* Olives */}
      {[
        { x: 70, y: 42 }, { x: 110, y: 38 }, { x: 145, y: 48 },
      ].map((o, i) => (
        <g key={i}>
          <ellipse cx={o.x} cy={o.y} rx="5" ry="6" fill="#2F4F2F" stroke="#1C3A1C" strokeWidth="0.5" />
          <ellipse cx={o.x - 1} cy={o.y - 1} rx="1.5" ry="2" fill="white" opacity="0.1" />
        </g>
      ))}

      {/* Oil bottle */}
      <path d="M85 85 L85 145 Q85 155 100 155 Q115 155 115 145 L115 85" fill="#556B2F" opacity="0.1" stroke="#556B2F" strokeWidth="0.8" />
      <rect x="90" y="78" width="20" height="10" rx="2" fill="#8B7355" stroke="#6B5B3E" strokeWidth="0.5" />
      {/* Oil inside */}
      <path d="M88 100 L88 143 Q88 152 100 152 Q112 152 112 143 L112 100" fill="#808000" opacity="0.25" />

      <text x="100" y="180" textAnchor="middle" fill="#556B2F" fontSize="9" fontFamily="serif" opacity="0.6">زيت الزيتون</text>
    </Frame>
  );
}

function KurekEti() {
  return (
    <Frame color="#A0522D">
      {/* Plate */}
      <ellipse cx="100" cy="140" rx="60" ry="15" fill="#A0522D" opacity="0.08" />
      <ellipse cx="100" cy="138" rx="55" ry="12" fill="none" stroke="#A0522D" strokeWidth="0.8" opacity="0.15" />

      {/* Shoulder meat (bone-in) */}
      <path d="M60 80 Q55 100 65 120 Q75 135 100 135 Q125 135 135 120 Q145 100 140 80 Q130 65 100 60 Q70 65 60 80 Z"
        fill="#A0522D" stroke="#8B3A10" strokeWidth="1" />
      {/* Bone */}
      <path d="M100 65 Q95 50 90 40" stroke="#F5DEB3" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="88" cy="38" r="5" fill="#F5DEB3" stroke="#DEB887" strokeWidth="0.5" />
      {/* Meat texture */}
      <path d="M70 90 Q85 85 100 90 Q115 95 130 90" stroke="#8B3A10" strokeWidth="0.5" fill="none" opacity="0.2" />
      <path d="M75 105 Q90 100 105 105 Q120 110 135 105" stroke="#8B3A10" strokeWidth="0.5" fill="none" opacity="0.2" />
      {/* Highlight */}
      <path d="M75 80 Q85 75 95 80" stroke="white" strokeWidth="2" fill="none" opacity="0.06" strokeLinecap="round" />

      <text x="100" y="175" textAnchor="middle" fill="#A0522D" fontSize="10" fontFamily="serif" opacity="0.6">الذِّراع</text>
    </Frame>
  );
}

function Sirke() {
  return (
    <Frame color="#8B0000">
      {/* Jar/amphora */}
      <path d="M85 50 L80 55 L78 130 Q78 150 100 152 Q122 150 122 130 L120 55 L115 50"
        fill="#8B0000" opacity="0.1" stroke="#8B0000" strokeWidth="1" />
      {/* Jar neck */}
      <rect x="88" y="42" width="24" height="12" rx="3" fill="#CD853F" stroke="#A0522D" strokeWidth="0.5" />
      {/* Handles */}
      <path d="M78 70 Q65 65 63 80 Q62 95 78 95" stroke="#8B0000" strokeWidth="1.5" fill="none" opacity="0.3" />
      <path d="M122 70 Q135 65 137 80 Q138 95 122 95" stroke="#8B0000" strokeWidth="1.5" fill="none" opacity="0.3" />
      {/* Liquid level */}
      <path d="M82 80 L82 128 Q82 147 100 148 Q118 147 118 128 L118 80" fill="#8B0000" opacity="0.2" />
      {/* Label area */}
      <rect x="86" y="95" width="28" height="25" rx="3" fill="none" stroke="#8B0000" strokeWidth="0.5" opacity="0.2" />
      <text x="100" y="112" textAnchor="middle" fill="#8B0000" fontSize="8" fontFamily="serif" opacity="0.3">خلّ</text>

      <text x="100" y="178" textAnchor="middle" fill="#8B0000" fontSize="9" fontFamily="serif" opacity="0.5">نِعمَ الإدامُ الخلّ</text>
    </Frame>
  );
}

function Sut() {
  return (
    <Frame color="#4A6FA5">
      {/* Bowl/cup */}
      <path d="M55 80 Q55 135 100 140 Q145 135 145 80" fill="#4A6FA5" opacity="0.06" />
      <ellipse cx="100" cy="80" rx="45" ry="15" fill="#E8E0D0" stroke="#C0B8A8" strokeWidth="1" />
      <ellipse cx="100" cy="80" rx="40" ry="12" fill="white" opacity="0.5" stroke="#E0D8C8" strokeWidth="0.5" />

      {/* Milk surface */}
      <ellipse cx="100" cy="78" rx="35" ry="10" fill="white" opacity="0.3" />

      {/* Isra night — crescent moon and stars */}
      <g opacity="0.2">
        <path d="M100 30 Q90 20 95 10 Q105 15 110 10 Q115 20 100 30 Z" fill="#d4af37" />
        <circle cx="75" cy="20" r="1.5" fill="#d4af37" />
        <circle cx="130" cy="18" r="1" fill="#d4af37" />
        <circle cx="85" cy="12" r="1" fill="#d4af37" />
        <circle cx="120" cy="25" r="1.5" fill="#d4af37" />
      </g>

      {/* Pouring indication */}
      <path d="M60 55 Q70 48 80 55" stroke="white" strokeWidth="1" fill="none" opacity="0.15" />

      <text x="100" y="168" textAnchor="middle" fill="#4A6FA5" fontSize="8" fontFamily="serif" opacity="0.4">اخترتَ الفِطرة</text>
      <text x="100" y="183" textAnchor="middle" fill="#4A6FA5" fontSize="10" fontFamily="serif" opacity="0.6">اللبن</text>
    </Frame>
  );
}

function Kess() {
  return (
    <Frame color="#8B7355">
      {/* Dried yogurt rounds */}
      {[
        { cx: 70, cy: 80, r: 18 }, { cx: 105, cy: 75, r: 20 }, { cx: 135, cy: 82, r: 17 },
        { cx: 85, cy: 110, r: 19 }, { cx: 118, cy: 108, r: 18 },
      ].map((d, i) => (
        <g key={i}>
          <circle cx={d.cx} cy={d.cy} r={d.r} fill="#F5DEB3" stroke="#DEB887" strokeWidth="0.8" />
          <circle cx={d.cx} cy={d.cy} r={d.r * 0.6} fill="none" stroke="#DEB887" strokeWidth="0.3" opacity="0.3" />
          {/* Texture dots */}
          <circle cx={d.cx - 3} cy={d.cy - 2} r="1" fill="#DEB887" opacity="0.3" />
          <circle cx={d.cx + 4} cy={d.cy + 1} r="0.8" fill="#DEB887" opacity="0.2" />
        </g>
      ))}

      {/* Wheat grains */}
      {[{ x: 55, y: 140 }, { x: 65, y: 145 }, { x: 140, y: 138 }].map((g, i) => (
        <ellipse key={i} cx={g.x} cy={g.y} rx="3" ry="1.5" fill="#DAA520" opacity="0.3"
          transform={`rotate(${20 + i * 25} ${g.x} ${g.y})`} />
      ))}

      <text x="100" y="178" textAnchor="middle" fill="#8B7355" fontSize="10" fontFamily="serif" opacity="0.6">المَضيرة</text>
    </Frame>
  );
}

function KuyrukYagi() {
  return (
    <Frame color="#DAA520">
      {/* Fat block */}
      <path d="M60 70 L60 120 Q60 135 80 140 L120 140 Q140 135 140 120 L140 70 Q140 55 120 50 L80 50 Q60 55 60 70 Z"
        fill="#FAEBD7" stroke="#DEB887" strokeWidth="1" />
      {/* Texture lines */}
      {[65, 80, 95, 110, 125].map((y, i) => (
        <line key={i} x1={65} y1={y} x2={135} y2={y} stroke="#DEB887" strokeWidth="0.3" opacity="0.3" />
      ))}
      {/* Melting drops */}
      <path d="M85 140 Q85 150 88 155" stroke="#DAA520" strokeWidth="1.5" fill="none" opacity="0.3" strokeLinecap="round" />
      <path d="M110 140 Q112 148 110 153" stroke="#DAA520" strokeWidth="1.5" fill="none" opacity="0.3" strokeLinecap="round" />

      <text x="100" y="178" textAnchor="middle" fill="#DAA520" fontSize="10" fontFamily="serif" opacity="0.6">السِّلائي</text>
    </Frame>
  );
}

function FatoutEkmegi() {
  return (
    <Frame color="#DEB887">
      {/* Flatbread stack */}
      {[0, 8, 16].map((offset, i) => (
        <g key={i}>
          <ellipse cx={100} cy={100 - offset} rx={50 - i * 2} ry={15 - i}
            fill={i === 0 ? '#DEB887' : i === 1 ? '#E8D5B0' : '#F0E6D0'}
            stroke="#C4A87C" strokeWidth="0.8" />
          {/* Bread spots */}
          {[
            { x: 80 + i * 3, y: 96 - offset }, { x: 110 - i * 2, y: 98 - offset },
            { x: 95, y: 93 - offset },
          ].map((s, j) => (
            <circle key={j} cx={s.x} cy={s.y} rx={2} ry={1.5} fill="#C4A87C" opacity="0.2" />
          ))}
        </g>
      ))}

      {/* Torn piece */}
      <path d="M145 110 Q155 100 160 108 Q165 118 155 125 Q145 120 145 110" fill="#F0E6D0" stroke="#C4A87C" strokeWidth="0.5" />

      <text x="100" y="155" textAnchor="middle" fill="#C4A87C" fontSize="10" fontFamily="serif" opacity="0.6">الفتوت</text>
    </Frame>
  );
}

/* ─── MAIN COMPONENT ─── */
const SVG_MAP: Record<string, () => React.ReactNode> = {
  acve_hurmasi: AcveHurmasi,
  taze_hurma: TazeHurma,
  karpuz: Karpuz,
  tirit: Tirit,
  kabak: Kabak,
  telbine: Telbine,
  bal: Bal,
  zeytinyagi: Zeytinyagi,
  kess: Kess,
  kuyruk_yagi: KuyrukYagi,
  fatout_ekmegi: FatoutEkmegi,
  et_kurek: KurekEti,
  sirke: Sirke,
  sut: Sut,
};

export function FoodSVG({ foodId, size = 200, className = '' }: FoodSVGProps) {
  const Component = SVG_MAP[foodId];

  if (!Component) {
    return (
      <div className={className} style={{ width: size, height: size }}>
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <rect width="200" height="200" rx="16" fill="var(--bg-tertiary)" />
          <text x="100" y="105" textAnchor="middle" fill="var(--text-tertiary)" fontSize="40">🍽️</text>
        </svg>
      </div>
    );
  }

  return (
    <div className={className} style={{ width: size, height: size }}>
      <Component />
    </div>
  );
}

export default FoodSVG;
