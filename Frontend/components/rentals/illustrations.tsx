import React from 'react';

const P = '#2F5D3F'; // pine
const M = '#7A8B5C'; // moss
const L = '#C8D5B6'; // light sage

function Kayak() {
  return <>
    <ellipse cx="60" cy="48" rx="50" ry="16" fill={M} />
    <ellipse cx="60" cy="48" rx="36" ry="10" fill={P} />
    <ellipse cx="60" cy="45" rx="11" ry="6" fill={L} />
    <line x1="12" y1="36" x2="108" y2="58" stroke={P} strokeWidth="3" strokeLinecap="round"/>
    <ellipse cx="16" cy="34" rx="8" ry="4" fill={M} transform="rotate(-20 16 34)"/>
    <ellipse cx="104" cy="60" rx="8" ry="4" fill={M} transform="rotate(-20 104 60)"/>
  </>;
}

function Tent() {
  return <>
    <line x1="5" y1="75" x2="115" y2="75" stroke={P} strokeWidth="2"/>
    <polygon points="60,10 8,75 112,75" fill={M}/>
    <polygon points="60,10 24,75 96,75" fill={P}/>
    <path d="M42,75 A18,22 0 0,1 78,75" fill={L}/>
    <line x1="60" y1="10" x2="60" y2="4" stroke={M} strokeWidth="2" strokeLinecap="round"/>
  </>;
}

function Backpack() {
  return <>
    <rect x="28" y="22" width="64" height="58" rx="12" fill={M}/>
    <path d="M44,22 Q60,10 76,22" stroke={P} strokeWidth="3" fill="none" strokeLinecap="round"/>
    <rect x="36" y="36" width="48" height="22" rx="5" fill={P}/>
    <rect x="36" y="62" width="48" height="14" rx="4" fill={P}/>
    <line x1="28" y1="32" x2="18" y2="78" stroke={P} strokeWidth="5" strokeLinecap="round"/>
    <line x1="92" y1="32" x2="102" y2="78" stroke={P} strokeWidth="5" strokeLinecap="round"/>
  </>;
}

function SleepingBag() {
  return <>
    <path d="M60,8 C88,8 96,28 96,50 C96,72 84,82 60,84 C36,82 24,72 24,50 C24,28 32,8 60,8 Z" fill={M}/>
    <path d="M60,18 C80,18 86,34 86,50 C86,66 78,74 60,76 C42,74 34,66 34,50 C34,34 40,18 60,18 Z" fill={P}/>
    <line x1="60" y1="20" x2="60" y2="74" stroke={L} strokeWidth="1.5" strokeDasharray="4,3" opacity="0.7"/>
    <circle cx="60" cy="14" r="5" fill={M}/>
  </>;
}

function Headlamp() {
  return <>
    <ellipse cx="60" cy="50" rx="36" ry="28" stroke={M} strokeWidth="5" fill="none"/>
    <rect x="38" y="36" width="44" height="28" rx="7" fill={P}/>
    <circle cx="60" cy="50" r="10" fill={L}/>
    <circle cx="60" cy="50" r="6" fill="#E8EDE2"/>
    <line x1="52" y1="36" x2="46" y2="18" stroke={L} strokeWidth="1.5" opacity="0.5"/>
    <line x1="60" y1="36" x2="60" y2="16" stroke={L} strokeWidth="1.5" opacity="0.5"/>
    <line x1="68" y1="36" x2="74" y2="18" stroke={L} strokeWidth="1.5" opacity="0.5"/>
  </>;
}

function TrekkingPoles() {
  return <>
    <rect x="22" y="6" width="16" height="20" rx="4" fill={M}/>
    <line x1="30" y1="26" x2="42" y2="82" stroke={P} strokeWidth="4" strokeLinecap="round"/>
    <circle cx="42" cy="80" r="7" fill="none" stroke={M} strokeWidth="2.5"/>
    <rect x="82" y="6" width="16" height="20" rx="4" fill={M}/>
    <line x1="90" y1="26" x2="78" y2="82" stroke={P} strokeWidth="4" strokeLinecap="round"/>
    <circle cx="78" cy="80" r="7" fill="none" stroke={M} strokeWidth="2.5"/>
    <line x1="30" y1="16" x2="90" y2="16" stroke={L} strokeWidth="1.5" opacity="0.5"/>
  </>;
}

function Cooler() {
  return <>
    <rect x="18" y="36" width="84" height="46" rx="6" fill={M}/>
    <rect x="18" y="22" width="84" height="18" rx="6" fill={P}/>
    <line x1="18" y1="40" x2="102" y2="40" stroke={L} strokeWidth="1" opacity="0.5"/>
    <path d="M42,22 L42,14 Q60,8 78,14 L78,22" stroke={P} strokeWidth="3" fill="none" strokeLinecap="round"/>
    <rect x="52" y="35" width="16" height="8" rx="2" fill={L}/>
    <circle cx="30" cy="82" r="5" fill={P}/>
    <circle cx="90" cy="82" r="5" fill={P}/>
  </>;
}

function LifeVest() {
  return <>
    <path d="M38,18 L32,75 L88,75 L82,18 Z" fill={M}/>
    <path d="M38,18 Q60,6 82,18 Q74,38 60,38 Q46,38 38,18 Z" fill="#E8EDE2"/>
    <rect x="32" y="46" width="56" height="7" rx="3.5" fill={P}/>
    <rect x="32" y="59" width="56" height="7" rx="3.5" fill={P}/>
    <rect x="54" y="43" width="12" height="13" rx="2" fill={L}/>
    <rect x="54" y="56" width="12" height="13" rx="2" fill={L}/>
  </>;
}

function CampStove() {
  return <>
    <rect x="22" y="56" width="76" height="12" rx="4" fill={M}/>
    <ellipse cx="60" cy="56" rx="32" ry="7" fill={P}/>
    <line x1="60" y1="50" x2="60" y2="63" stroke={L} strokeWidth="1.2" opacity="0.6"/>
    <line x1="48" y1="56" x2="72" y2="56" stroke={L} strokeWidth="1.2" opacity="0.6"/>
    <line x1="50" y1="52" x2="70" y2="60" stroke={L} strokeWidth="1" opacity="0.4"/>
    <line x1="70" y1="52" x2="50" y2="60" stroke={L} strokeWidth="1" opacity="0.4"/>
    <rect x="34" y="26" width="52" height="32" rx="5" fill={M}/>
    <ellipse cx="60" cy="26" rx="26" ry="6" fill={P}/>
    <line x1="34" y1="38" x2="18" y2="34" stroke={M} strokeWidth="4" strokeLinecap="round"/>
    <line x1="86" y1="38" x2="102" y2="34" stroke={M} strokeWidth="4" strokeLinecap="round"/>
    <path d="M52,56 Q55,48 60,50 Q65,48 68,56" fill="#C1683C" opacity="0.65"/>
  </>;
}

function Paddle() {
  return <>
    <line x1="60" y1="8" x2="60" y2="82" stroke={M} strokeWidth="6" strokeLinecap="round"/>
    <path d="M38,8 Q60,2 82,8 Q82,28 60,28 Q38,28 38,8 Z" fill={P}/>
    <path d="M38,82 Q60,88 82,82 Q82,62 60,62 Q38,62 38,82 Z" fill={P}/>
    <rect x="52" y="40" width="16" height="10" rx="3" fill={P}/>
  </>;
}

function Harness() {
  return <>
    <ellipse cx="60" cy="40" rx="36" ry="14" stroke={P} strokeWidth="6" fill="none"/>
    <ellipse cx="38" cy="63" rx="15" ry="11" stroke={M} strokeWidth="5" fill="none"/>
    <ellipse cx="82" cy="63" rx="15" ry="11" stroke={M} strokeWidth="5" fill="none"/>
    <circle cx="60" cy="40" r="9" stroke="#C1683C" strokeWidth="4" fill="none"/>
    <rect x="24" y="33" width="9" height="14" rx="2" fill={M}/>
    <rect x="87" y="33" width="9" height="14" rx="2" fill={M}/>
  </>;
}

function Snowshoes() {
  return <>
    <ellipse cx="34" cy="45" rx="20" ry="36" stroke={P} strokeWidth="4" fill="#E8EDE2"/>
    <line x1="14" y1="33" x2="54" y2="33" stroke={M} strokeWidth="2"/>
    <line x1="14" y1="45" x2="54" y2="45" stroke={M} strokeWidth="2"/>
    <line x1="14" y1="57" x2="54" y2="57" stroke={M} strokeWidth="2"/>
    <rect x="26" y="36" width="16" height="16" rx="3" fill={P}/>
    <ellipse cx="86" cy="45" rx="20" ry="36" stroke={P} strokeWidth="4" fill="#E8EDE2"/>
    <line x1="66" y1="33" x2="106" y2="33" stroke={M} strokeWidth="2"/>
    <line x1="66" y1="45" x2="106" y2="45" stroke={M} strokeWidth="2"/>
    <line x1="66" y1="57" x2="106" y2="57" stroke={M} strokeWidth="2"/>
    <rect x="78" y="36" width="16" height="16" rx="3" fill={P}/>
  </>;
}

const ILLUSTRATIONS: Record<string, () => React.ReactElement> = {
  kayak: Kayak,
  tent: Tent,
  backpack: Backpack,
  'sleeping-bag': SleepingBag,
  headlamp: Headlamp,
  'trekking-poles': TrekkingPoles,
  cooler: Cooler,
  'life-vest': LifeVest,
  'camp-stove': CampStove,
  paddle: Paddle,
  harness: Harness,
  snowshoes: Snowshoes,
};

export function GearIllustration({ type }: { type: string }) {
  const Comp = ILLUSTRATIONS[type];
  return (
    <div style={{ backgroundColor: '#E8EDE2', width: '100%', paddingTop: '75%', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 20px' }}>
        <svg viewBox="0 0 120 90" style={{ width: '100%', height: '100%' }}>
          {Comp ? <Comp /> : <rect x="30" y="20" width="60" height="50" rx="4" fill={M} />}
        </svg>
      </div>
    </div>
  );
}

export function MountainIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
      <path d="M2 20 L8 10 L12 15 L16 8 L22 20 Z" fill="white" opacity="0.9"/>
      <line x1="2" y1="20" x2="22" y2="20" stroke="white" strokeWidth="1.5" opacity="0.6"/>
    </svg>
  );
}
