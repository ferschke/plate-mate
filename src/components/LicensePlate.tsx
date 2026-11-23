import React, { useId } from 'react';
import type { StateInfo } from '../types';

interface LicensePlateProps {
  state: StateInfo;
  seen?: boolean;
  className?: string;
}

function renderStateArtwork(code: string) {
  switch (code) {
    case 'AL':
      return (
        <g>
          {/* Gulf Coast waves & beach */}
          <path d="M0 105 Q80 92 160 104 T320 100 L320 160 L0 160 Z" fill="#4BA4D6" opacity="0.5" />
          <path d="M0 116 Q90 108 180 118 T320 114 L320 160 L0 160 Z" fill="#8CD0E8" opacity="0.65" />
          <path d="M0 128 Q120 122 220 130 T320 126 L320 160 L0 160 Z" fill="#F2DEC0" />
          <circle cx="255" cy="48" r="14" fill="#FCE59B" opacity="0.7" />
        </g>
      );
    case 'AK':
      return (
        <g fill="#0F2557">
          {/* Big Dipper & North Star */}
          <polygon points="274,26 276,32 282,32 277,36 279,42 274,38 269,42 271,36 266,32 272,32" />
          <circle cx="48" cy="52" r="3" />
          <circle cx="70" cy="60" r="3" />
          <circle cx="92" cy="70" r="3" />
          <circle cx="114" cy="82" r="3.2" />
          <circle cx="118" cy="104" r="3" />
          <circle cx="144" cy="108" r="3" />
          <circle cx="148" cy="86" r="3.2" />
        </g>
      );
    case 'AZ':
      return (
        <g>
          {/* Purple/teal desert mesas & saguaro */}
          <path d="M0 112 L42 104 L68 92 L96 92 L120 106 L175 100 L205 88 L242 88 L268 104 L320 98 L320 160 L0 160 Z" fill="#60527A" opacity="0.55" />
          <path d="M0 124 Q90 114 190 122 T320 118 L320 160 L0 160 Z" fill="#3C7A7C" opacity="0.45" />
          {/* Saguaro cactus on left */}
          <g fill="#23574D">
            <rect x="26" y="72" width="7" height="58" rx="3.5" />
            <path d="M26 98 L16 98 Q14 98 14 94 L14 82 Q14 79 17 79 Q20 79 20 82 L20 92 L26 92 Z" />
            <path d="M33 90 L42 90 Q44 90 44 86 L44 76 Q44 73 41 73 Q38 73 38 76 L38 84 L33 84 Z" />
          </g>
        </g>
      );
    case 'AR':
      return (
        <g>
          {/* Blue Diamond motif */}
          <polygon points="160,36 220,82 160,128 100,82" fill="#3B82C4" opacity="0.16" stroke="#2B6CB0" strokeWidth="1.5" strokeOpacity="0.3" />
          <polygon points="160,48 205,82 160,116 115,82" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.6" />
        </g>
      );
    case 'CA':
      return (
        <g>
          {/* Subtle golden horizon glow behind California script */}
          <ellipse cx="160" cy="40" rx="115" ry="18" fill="#FDE68A" opacity="0.22" />
          <line x1="22" y1="133" x2="298" y2="133" stroke="#E2E8F0" strokeWidth="1" />
        </g>
      );
    case 'CO':
      return (
        <g>
          {/* Iconic Green & White Rocky Mountains */}
          <rect x="0" y="0" width="320" height="70" fill="#185C37" />
          <polygon points="0,72 34,36 66,58 104,22 146,56 178,30 218,58 256,24 294,54 320,38 320,78 0,78" fill="#FFFFFF" />
          <polygon points="104,22 120,42 104,36 90,44" fill="#D5E8DD" />
          <polygon points="256,24 272,44 256,38 242,44" fill="#D5E8DD" />
          <rect x="0" y="74" width="320" height="86" fill="#FFFFFF" />
        </g>
      );
    case 'CT':
      return (
        <g>
          {/* Soft coastal blue band & small CT silhouette */}
          <path d="M22 44 L44 41 L46 53 L26 57 L20 53 Z" fill="#102A54" opacity="0.22" />
          <line x1="14" y1="130" x2="306" y2="130" stroke="#4A89C7" strokeWidth="2" opacity="0.35" />
        </g>
      );
    case 'DE':
      return (
        <g>
          {/* Classic Navy & Gold inner pinstripe */}
          <rect x="10" y="10" width="300" height="140" rx="8" fill="none" stroke="#E8C55A" strokeWidth="2.2" opacity="0.85" />
        </g>
      );
    case 'FL':
      return (
        <g>
          {/* Light green Florida state silhouette & twin bright oranges */}
          <path d="M126 42 L176 42 L182 54 L194 86 L196 116 L186 122 L174 102 L166 74 L152 60 L126 56 Z" fill="#82C99A" opacity="0.45" />
          <circle cx="152" cy="84" r="18" fill="#F97316" opacity="0.72" />
          <circle cx="172" cy="90" r="16" fill="#FB923C" opacity="0.78" />
          <ellipse cx="163" cy="67" rx="11" ry="5" transform="rotate(-24 163 67)" fill="#1D6B39" opacity="0.75" />
          <ellipse cx="145" cy="68" rx="9" ry="4.5" transform="rotate(22 145 68)" fill="#228B4E" opacity="0.75" />
          <circle cx="158" cy="74" r="4.5" fill="#FFFFFF" opacity="0.9" />
        </g>
      );
    case 'GA':
      return (
        <g>
          {/* Ripe Georgia Peach in center */}
          <path d="M160 56 C140 50 130 74 140 94 C147 108 158 114 160 116 C162 114 173 108 180 94 C190 74 180 50 160 56 Z" fill="#F2853D" opacity="0.48" />
          <ellipse cx="170" cy="52" rx="11" ry="5" transform="rotate(-25 170 52)" fill="#2E7D32" opacity="0.55" />
          <path d="M0 124 Q100 112 200 124 T320 120 L320 160 L0 160 Z" fill="#E89D54" opacity="0.35" />
        </g>
      );
    case 'HI':
      return (
        <g fill="none" strokeLinecap="round" opacity="0.78">
          {/* Iconic Sweeping Hawaiian Rainbow */}
          <path d="M18 118 Q160 14 302 118" stroke="#E63946" strokeWidth="7" />
          <path d="M24 122 Q160 22 296 122" stroke="#F59E0B" strokeWidth="7" />
          <path d="M30 126 Q160 30 290 126" stroke="#FACC15" strokeWidth="7" />
          <path d="M36 130 Q160 38 284 130" stroke="#22C55E" strokeWidth="7" />
          <path d="M42 134 Q160 46 278 134" stroke="#3B82F6" strokeWidth="7" />
        </g>
      );
    case 'ID':
      return (
        <g>
          {/* Red-White-Blue Horizon & Mountain Pine Silhouette */}
          <rect x="0" y="0" width="320" height="44" fill="#C93838" />
          <rect x="0" y="118" width="320" height="42" fill="#1D5B9E" />
          <polygon points="0,120 45,92 88,112 136,84 186,112 238,88 282,110 320,94 320,122 0,122" fill="#2A5B84" opacity="0.55" />
        </g>
      );
    case 'IL':
      return (
        <g>
          {/* Lincoln subtle profile & Chicago skyline */}
          <circle cx="52" cy="84" r="26" fill="#4A82B8" opacity="0.16" />
          <g fill="#4A82B8" opacity="0.22">
            <rect x="188" y="102" width="10" height="32" />
            <rect x="200" y="90" width="12" height="44" />
            <rect x="204" y="76" width="1.5" height="14" />
            <rect x="208" y="76" width="1.5" height="14" />
            <rect x="215" y="106" width="14" height="28" />
            <rect x="232" y="98" width="10" height="36" />
            <rect x="246" y="112" width="16" height="22" />
          </g>
        </g>
      );
    case 'IN':
      return (
        <g>
          {/* Golden sunset over rural bridge & fields */}
          <circle cx="160" cy="82" r="30" fill="#FDE68A" opacity="0.55" />
          <path d="M0 112 Q80 102 160 110 T320 108 L320 160 L0 160 Z" fill="#4A7A3A" opacity="0.72" />
          <rect x="128" y="96" width="64" height="16" fill="#8B3A2B" opacity="0.35" />
        </g>
      );
    case 'IA':
      return (
        <g>
          {/* Classic Blue Sky, White Middle, Green Bottom */}
          <rect x="0" y="0" width="320" height="40" fill="#1D65A6" />
          <rect x="0" y="124" width="320" height="36" fill="#2E7D32" />
          <g fill="#64748B" opacity="0.22">
            <rect x="30" y="102" width="10" height="22" />
            <rect x="43" y="94" width="12" height="30" />
            <rect x="255" y="106" width="18" height="18" />
            <polygon points="253,106 264,96 275,106" />
          </g>
        </g>
      );
    case 'KS':
      return (
        <g>
          {/* 2024+ To The Stars gold & blue dome silhouette */}
          <rect x="0" y="0" width="320" height="44" fill="#1A447E" />
          <path d="M0 118 Q160 102 320 118 L320 160 L0 160 Z" fill="#C98A1E" opacity="0.82" />
          <path d="M146 116 L146 98 Q160 84 174 98 L174 116 Z" fill="#B57B1A" opacity="0.35" />
          <polygon points="160,72 162,78 168,78 163,81 165,87 160,83 155,87 157,81 152,78 158,78" fill="#FDE68A" opacity="0.85" />
        </g>
      );
    case 'KY':
      return (
        <g>
          {/* Bluegrass sky & rolling hills */}
          <rect x="0" y="0" width="320" height="40" fill="#235FA3" />
          <path d="M0 124 Q90 108 180 122 T320 116 L320 160 L0 160 Z" fill="#89B8DF" opacity="0.35" />
        </g>
      );
    case 'LA':
      return (
        <g>
          {/* Blue Pelican & Gold Fleur-de-lis accent */}
          <path d="M18 118 Q160 108 302 118" fill="none" stroke="#D4A017" strokeWidth="2.5" opacity="0.65" />
          <circle cx="48" cy="78" r="16" fill="#1B3664" opacity="0.1" />
          <path d="M40 84 Q48 68 58 76 Q52 84 48 92 Z" fill="#1B3664" opacity="0.35" />
          <path d="M272 70 Q276 60 280 70 Q288 66 282 76 L276 84 L270 76 Q264 66 272 70 Z" fill="#D4A017" opacity="0.45" />
        </g>
      );
    case 'ME':
      return (
        <g>
          {/* 2025 Pine Tree & North Star design */}
          <g fill="#164A30">
            <polygon points="48,48 34,76 62,76" />
            <polygon points="48,64 30,96 66,96" />
            <polygon points="48,82 26,116 70,116" />
            <rect x="44" y="116" width="8" height="14" />
          </g>
          {/* Blue North Star */}
          <polygon points="274,42 277,50 285,50 279,55 281,63 274,58 267,63 269,55 263,50 271,50" fill="#1D4ED8" opacity="0.85" />
        </g>
      );
    case 'MD':
      return (
        <g>
          {/* Iconic Maryland State Flag undulating banner along bottom */}
          <g clipPath="inset(112px 0px 0px 0px)">
            <rect x="0" y="112" width="80" height="48" fill="#F5B81D" />
            <path d="M0 112 L20 112 L20 136 L0 136 Z M40 112 L60 112 L60 136 L40 136 Z M20 136 L40 136 L40 160 L20 160 Z M60 136 L80 136 L80 160 L60 160 Z" fill="#18181B" />
            <rect x="80" y="112" width="80" height="48" fill="#FFFFFF" />
            <rect x="114" y="112" width="12" height="48" fill="#C8102E" />
            <rect x="80" y="130" width="80" height="12" fill="#C8102E" />
            <rect x="160" y="112" width="80" height="48" fill="#C8102E" />
            <rect x="194" y="112" width="12" height="48" fill="#FFFFFF" />
            <rect x="160" y="130" width="80" height="12" fill="#FFFFFF" />
            <rect x="240" y="112" width="80" height="48" fill="#F5B81D" />
            <path d="M240 112 L260 112 L260 136 L240 136 Z M280 112 L300 112 L300 136 L280 136 Z M260 136 L280 136 L280 160 L260 160 Z M300 136 L320 136 L320 160 L300 160 Z" fill="#18181B" />
          </g>
          <path d="M0 114 Q80 104 160 114 T320 112 L320 120 L0 120 Z" fill="#FFFFFF" />
        </g>
      );
    case 'MA':
      return (
        <g>
          {/* Crisp classic Bay State border accents */}
          <line x1="20" y1="42" x2="300" y2="42" stroke="#C5282F" strokeWidth="1.5" opacity="0.25" />
          <line x1="20" y1="126" x2="300" y2="126" stroke="#163567" strokeWidth="1.5" opacity="0.25" />
        </g>
      );
    case 'MI':
      return (
        <g>
          {/* Pure Michigan royal blue top wave */}
          <path d="M0 0 L320 0 L320 38 Q220 48 120 36 Q55 29 0 42 Z" fill="#16539A" />
          <path d="M0 44 Q110 32 220 44 T320 40" fill="none" stroke="#4D90D6" strokeWidth="2.5" opacity="0.6" />
        </g>
      );
    case 'MN':
      return (
        <g>
          {/* Lake reflection & pine island */}
          <path d="M0 118 Q160 110 320 118 L320 160 L0 160 Z" fill="#7AB4DF" opacity="0.28" />
          <path d="M128 116 Q160 104 192 116 Z" fill="#1D5B42" opacity="0.35" />
          <polygon points="154,98 148,114 160,114" fill="#1D5B42" opacity="0.4" />
          <polygon points="168,101 163,114 173,114" fill="#1D5B42" opacity="0.4" />
        </g>
      );
    case 'MS':
      return (
        <g>
          {/* 2024 Magnolia blossom watermark in center */}
          <g transform="translate(160,84)" opacity="0.34">
            <ellipse cx="0" cy="-22" rx="14" ry="22" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
            <ellipse cx="20" cy="-8" rx="14" ry="22" transform="rotate(68 20 -8)" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
            <ellipse cx="14" cy="18" rx="14" ry="22" transform="rotate(140 14 18)" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
            <ellipse cx="-14" cy="18" rx="14" ry="22" transform="rotate(-140 -14 18)" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
            <ellipse cx="-20" cy="-8" rx="14" ry="22" transform="rotate(-68 -20 -8)" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
            <circle cx="0" cy="0" r="9" fill="#EAB308" />
          </g>
          <rect x="0" y="132" width="320" height="28" fill="#162C54" opacity="0.08" />
        </g>
      );
    case 'MO':
      return (
        <g>
          {/* Bicentennial wavy red-white-blue flag bands */}
          <path d="M0 0 L320 0 L320 18 Q160 28 0 16 Z" fill="#C8232C" />
          <path d="M0 16 Q160 28 320 18 L320 26 Q160 36 0 24 Z" fill="#152E5B" opacity="0.18" />
          <path d="M0 132 Q160 122 320 134 L320 160 L0 160 Z" fill="#152E5B" />
          <path d="M0 124 Q160 114 320 126 L320 134 Q160 122 0 132 Z" fill="#C8232C" opacity="0.85" />
        </g>
      );
    case 'MT':
      return (
        <g>
          {/* Big Sky blue top & Rocky Mountain range */}
          <polygon points="0,124 44,96 86,114 134,82 184,110 234,86 280,108 320,92 320,160 0,160" fill="#4676A8" opacity="0.28" />
          <rect x="0" y="0" width="320" height="42" fill="#1A5494" />
        </g>
      );
    case 'NE':
      return (
        <g>
          {/* 2023+ Capitol Mosaic geometric band */}
          <g opacity="0.35">
            <rect x="0" y="122" width="320" height="38" fill="#C99B58" />
            <polygon points="20,122 40,141 20,160 0,141" fill="#1A345C" />
            <polygon points="60,122 80,141 60,160 40,141" fill="#8C5A2B" />
            <polygon points="100,122 120,141 100,160 80,141" fill="#1A345C" />
            <polygon points="220,122 240,141 220,160 200,141" fill="#1A345C" />
            <polygon points="260,122 280,141 260,160 240,141" fill="#8C5A2B" />
            <polygon points="300,122 320,141 300,160 280,141" fill="#1A345C" />
          </g>
        </g>
      );
    case 'NV':
      return (
        <g>
          {/* Desert Mountain Sunrise & Silver State */}
          <polygon points="0,118 60,84 115,104 176,78 242,106 320,86 320,160 0,160" fill="#7D93AB" opacity="0.38" />
          <polygon points="26,56 44,56 44,88 38,94 26,76" fill="#183254" opacity="0.22" />
        </g>
      );
    case 'NH':
      return (
        <g>
          {/* Old Man of the Mountain craggy profile in center */}
          <path d="M142 46 L168 48 L174 60 L166 66 L176 74 L168 82 L172 90 L162 96 L166 108 L142 114 Z" fill="#175434" opacity="0.16" />
        </g>
      );
    case 'NJ':
      return (
        <g>
          {/* Classic Garden State pale gold gradient with NJ silhouette */}
          <path d="M156 54 L166 58 L164 74 L170 92 L162 112 L152 104 L154 84 L150 68 Z" fill="#B89B32" opacity="0.22" />
        </g>
      );
    case 'NM':
      return (
        <g>
          {/* Iconic Red Zia Sun Symbol on Turquoise */}
          <rect x="9" y="9" width="302" height="142" rx="7" fill="none" stroke="#D62828" strokeWidth="2.2" opacity="0.85" />
          <g transform="translate(160,84)" stroke="#D62828" strokeWidth="2.4" opacity="0.34" fill="none">
            <circle cx="0" cy="0" r="12" />
            {/* 4 sets of 4 rays */}
            <line x1="-6" y1="-15" x2="-6" y2="-32" />
            <line x1="-2" y1="-15" x2="-2" y2="-36" />
            <line x1="2" y1="-15" x2="2" y2="-36" />
            <line x1="6" y1="-15" x2="6" y2="-32" />
            <line x1="-6" y1="15" x2="-6" y2="32" />
            <line x1="-2" y1="15" x2="-2" y2="36" />
            <line x1="2" y1="15" x2="2" y2="36" />
            <line x1="6" y1="15" x2="6" y2="32" />
            <line x1="-15" y1="-6" x2="-32" y2="-6" />
            <line x1="-15" y1="-2" x2="-36" y2="-2" />
            <line x1="-15" y1="2" x2="-36" y2="2" />
            <line x1="-15" y1="6" x2="-32" y2="6" />
            <line x1="15" y1="-6" x2="32" y2="-6" />
            <line x1="15" y1="-2" x2="36" y2="-2" />
            <line x1="15" y1="2" x2="36" y2="2" />
            <line x1="15" y1="6" x2="32" y2="6" />
          </g>
        </g>
      );
    case 'NY':
      return (
        <g>
          {/* Current Excelsior Gold & Navy top/bottom bands */}
          <rect x="0" y="0" width="320" height="36" fill="#F2B729" />
          <rect x="0" y="36" width="320" height="5" fill="#112B5B" />
          <rect x="0" y="122" width="320" height="5" fill="#112B5B" />
          <rect x="0" y="127" width="320" height="33" fill="#F2B729" />
          {/* Faint skyline & Statue of Liberty silhouette */}
          <g fill="#94A3B8" opacity="0.2">
            <rect x="24" y="96" width="8" height="26" />
            <rect x="35" y="84" width="9" height="38" />
            <rect x="47" y="100" width="10" height="22" />
            <rect x="268" y="92" width="12" height="30" />
            <rect x="284" y="102" width="10" height="20" />
          </g>
        </g>
      );
    case 'NC':
      return (
        <g>
          {/* Wright Flyer biplane silhouette */}
          <g stroke="#2C5E96" strokeWidth="1.8" opacity="0.32" fill="none">
            <line x1="122" y1="54" x2="198" y2="54" />
            <line x1="126" y1="61" x2="194" y2="61" />
            <line x1="138" y1="54" x2="138" y2="61" />
            <line x1="160" y1="54" x2="160" y2="61" />
            <line x1="182" y1="54" x2="182" y2="61" />
          </g>
        </g>
      );
    case 'ND':
      return (
        <g>
          {/* Badlands sunset & bison silhouette */}
          <path d="M0 116 L54 108 L108 114 L170 104 L235 112 L320 106 L320 160 L0 160 Z" fill="#6D3C1E" opacity="0.65" />
          <ellipse cx="268" cy="112" rx="14" ry="9" fill="#3B2314" opacity="0.65" />
          <circle cx="256" cy="110" r="6.5" fill="#3B2314" opacity="0.65" />
        </g>
      );
    case 'OH':
      return (
        <g>
          {/* Sunrise in Ohio: hills, red barn, river */}
          <circle cx="160" cy="76" r="28" fill="#FDE68A" opacity="0.55" />
          <path d="M0 114 Q80 96 165 112 T320 106 L320 160 L0 160 Z" fill="#5D9445" opacity="0.72" />
          <path d="M126 112 Q160 124 142 160 L176 160 Q188 124 152 112 Z" fill="#4A8BC8" opacity="0.45" />
          <rect x="44" y="102" width="16" height="12" fill="#B91C1C" opacity="0.55" />
          <polygon points="42,102 52,94 62,102" fill="#991B1B" opacity="0.55" />
        </g>
      );
    case 'OK':
      return (
        <g>
          {/* 2024+ Red-White-Blue Horizon */}
          <rect x="0" y="0" width="320" height="38" fill="#B82E3A" />
          <rect x="0" y="122" width="320" height="38" fill="#1C4A8A" />
          <polygon points="160,44 163,51 171,51 165,55 167,63 160,58 153,63 155,55 149,51 157,51" fill="#D97706" opacity="0.35" />
        </g>
      );
    case 'OR':
      return (
        <g>
          {/* Iconic Douglas Fir in center & mountain horizon */}
          <path d="M0 122 L62 102 L120 116 L204 102 L266 116 L320 104 L320 160 L0 160 Z" fill="#7D96B8" opacity="0.22" />
          <g fill="#1E6B42" opacity="0.42">
            <polygon points="160,46 142,80 178,80" />
            <polygon points="160,64 136,102 184,102" />
            <polygon points="160,84 132,124 188,124" />
            <rect x="155" y="124" width="10" height="14" />
          </g>
        </g>
      );
    case 'PA':
      return (
        <g>
          {/* 2025 Let Freedom Ring — Liberty Bell centerpiece */}
          <rect x="0" y="0" width="320" height="8" fill="#152B56" />
          <rect x="0" y="152" width="320" height="8" fill="#B82932" />
          <g fill="#B48A3E" opacity="0.24" transform="translate(160,84)">
            <rect x="-18" y="-34" width="36" height="7" rx="2" />
            <path d="M-14 -27 Q-18 0 -26 22 L26 22 Q18 0 14 -27 Z" />
            <path d="M-2 -10 L4 4 L0 14 L5 22" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
          </g>
        </g>
      );
    case 'RI':
      return (
        <g>
          {/* New Ocean State sweeping navy & cyan waves */}
          <path d="M0 108 Q64 92 128 108 T256 106 T320 102 L320 160 L0 160 Z" fill="#38BDF8" opacity="0.42" />
          <path d="M0 120 Q80 106 160 120 T320 116 L320 160 L0 160 Z" fill="#175E9C" opacity="0.88" />
        </g>
      );
    case 'SC':
      return (
        <g>
          {/* Iconic Palmetto Tree & Crescent Moon */}
          <path d="M58 54 A11 11 0 1 0 68 68 A8.5 8.5 0 1 1 58 54 Z" fill="#163360" opacity="0.38" />
          <g fill="#163360" opacity="0.22" transform="translate(160,86)">
            <rect x="-3" y="-14" width="6" height="44" />
            <path d="M0 -14 Q-22 -28 -30 -12 Q-14 -14 0 -8 Z" />
            <path d="M0 -14 Q22 -28 30 -12 Q14 -14 0 -8 Z" />
            <path d="M0 -16 Q-14 -36 -6 -40 Q-2 -26 0 -16 Z" />
            <path d="M0 -16 Q14 -36 6 -40 Q2 -26 0 -16 Z" />
          </g>
        </g>
      );
    case 'SD':
      return (
        <g>
          {/* Mount Rushmore silhouette across upper-mid */}
          <path d="M40 122 L66 78 L92 84 L112 66 L136 74 L158 62 L182 72 L208 66 L232 82 L262 78 L286 122 Z" fill="#64748B" opacity="0.18" />
        </g>
      );
    case 'TN':
      return (
        <g>
          {/* Navy background with white Tri-Star & subtle state outline */}
          <rect x="9" y="9" width="302" height="142" rx="7" fill="none" stroke="#FFFFFF" strokeWidth="1.6" opacity="0.55" />
          <circle cx="160" cy="84" r="22" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.22" />
          <g fill="#FFFFFF" opacity="0.26">
            <circle cx="160" cy="74" r="4" />
            <circle cx="151" cy="89" r="4" />
            <circle cx="169" cy="89" r="4" />
          </g>
        </g>
      );
    case 'TX':
      return (
        <g>
          {/* Ultra-clean stark white with black Lone Star in top left */}
          <polygon points="38,24 41,33 50,33 43,38 45,47 38,42 31,47 33,38 26,33 35,33" fill="#141619" />
          <line x1="18" y1="128" x2="302" y2="128" stroke="#141619" strokeWidth="1.5" opacity="0.18" />
        </g>
      );
    case 'UT':
      return (
        <g>
          {/* Iconic Delicate Arch red-rock silhouette */}
          <path d="M0 116 L44 96 L92 108 L138 92 L184 106 L246 88 L320 108 L320 160 L0 160 Z" fill="#B84323" opacity="0.72" />
          <path d="M214 114 L222 68 Q242 54 260 70 L268 114 L252 114 L248 84 Q240 76 232 84 L228 114 Z" fill="#9E3317" opacity="0.65" />
        </g>
      );
    case 'VT':
      return (
        <g>
          {/* Classic Deep Forest Green with white pinstripe & subtle mountain */}
          <rect x="9" y="9" width="302" height="142" rx="7" fill="none" stroke="#FFFFFF" strokeWidth="1.8" opacity="0.7" />
          <polygon points="24,52 38,32 52,52" fill="#FFFFFF" opacity="0.28" />
          <polygon points="36,52 48,38 60,52" fill="#FFFFFF" opacity="0.2" />
        </g>
      );
    case 'VA':
      return (
        <g>
          {/* Clean white with navy accents & red heart for Lovers */}
          <path d="M235 137 C235 134 231 133 230 136 C229 133 225 134 225 137 C225 140 230 144 230 144 C230 144 235 140 235 137 Z" fill="#D62828" />
        </g>
      );
    case 'WA':
      return (
        <g>
          {/* Snow-capped Mount Rainier silhouette */}
          <polygon points="0,124 62,102 118,86 160,64 206,84 262,102 320,122 320,160 0,160" fill="#6B98BD" opacity="0.32" />
          <polygon points="160,64 180,80 166,76 160,82 150,76 138,82" fill="#FFFFFF" opacity="0.85" />
        </g>
      );
    case 'WV':
      return (
        <g>
          {/* Bold Navy top band + Golden Yellow accent stripe */}
          <rect x="0" y="0" width="320" height="38" fill="#142D61" />
          <rect x="0" y="38" width="320" height="7" fill="#F5C438" />
          <rect x="0" y="148" width="320" height="12" fill="#142D61" opacity="0.1" />
        </g>
      );
    case 'WI':
      return (
        <g>
          {/* Clean white with subtle red barn & sailboat vignette */}
          <line x1="18" y1="42" x2="302" y2="42" stroke="#C5282F" strokeWidth="1.8" opacity="0.28" />
          <g fill="#C5282F" opacity="0.25">
            <rect x="24" y="106" width="16" height="12" />
            <polygon points="22,106 32,98 42,106" />
          </g>
          <polygon points="282,98 282,118 296,118" fill="#1E4B8A" opacity="0.25" />
        </g>
      );
    case 'WY':
      return (
        <g>
          {/* Snow-capped Tetons, golden prairie, Bucking Horse silhouette */}
          <polygon points="0,112 52,82 88,98 134,68 176,96 226,74 276,98 320,84 320,120 0,120" fill="#FFFFFF" opacity="0.72" />
          <rect x="0" y="116" width="320" height="44" fill="#DFBD69" opacity="0.72" />
          {/* Bucking Horse & Rider silhouette on left */}
          <g fill="#112545" opacity="0.72">
            <ellipse cx="46" cy="96" rx="14" ry="7" transform="rotate(-22 46 96)" />
            <circle cx="44" cy="78" r="4" />
            <line x1="36" y1="102" x2="28" y2="118" stroke="#112545" strokeWidth="3.2" strokeLinecap="round" />
            <line x1="54" y1="94" x2="64" y2="112" stroke="#112545" strokeWidth="3.2" strokeLinecap="round" />
          </g>
        </g>
      );
    default:
      return null;
  }
}

export const LicensePlate: React.FC<LicensePlateProps> = React.memo(({ state, seen = false, className = '' }) => {
  const uid = useId().replace(/:/g, '');
  const gradId = `bg-${state.code}-${uid}`;
  const sheenId = `sheen-${state.code}-${uid}`;
  const clipId = `clip-${state.code}-${uid}`;

  const headerFontFamily =
    state.headerStyle === 'script'
      ? "'Pacifico', cursive"
      : state.headerStyle === 'serif'
        ? "Georgia, 'Times New Roman', serif"
        : "'Plus Jakarta Sans', system-ui, sans-serif";

  const headerFontSize =
    state.headerStyle === 'script'
      ? 23
      : (state.headerText || state.name).length > 13
        ? 16
        : 20;

  return (
    <svg
      viewBox="0 0 320 160"
      className={`license-plate-svg ${seen ? 'is-seen' : ''} ${className}`}
      role="img"
      aria-label={`${state.name} license plate`}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={state.bgTop} />
          {state.bgMid && <stop offset="52%" stopColor={state.bgMid} />}
          <stop offset="100%" stopColor={state.bgBottom} />
        </linearGradient>
        <linearGradient id={sheenId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.28" />
          <stop offset="38%" stopColor="#FFFFFF" stopOpacity="0.03" />
          <stop offset="65%" stopColor="#000000" stopOpacity="0.02" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.12" />
        </linearGradient>
        <clipPath id={clipId}>
          <rect x="2" y="2" width="316" height="156" rx="12" />
        </clipPath>
      </defs>

      {/* Main clipped plate face */}
      <g clipPath={`url(#${clipId})`}>
        <rect x="2" y="2" width="316" height="156" fill={`url(#${gradId})`} />

        {/* State-specific artwork */}
        {renderStateArtwork(state.code)}

        {/* Mounting screw slots */}
        <g fill="#1F2937" fillOpacity="0.28" stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="1">
          <rect x="64" y="10" width="16" height="6" rx="3" />
          <rect x="240" y="10" width="16" height="6" rx="3" />
          <rect x="64" y="144" width="16" height="6" rx="3" />
          <rect x="240" y="144" width="16" height="6" rx="3" />
        </g>

        {/* Registration stickers (top-left month / top-right year) */}
        <g>
          <rect
            x="16"
            y="11"
            width="24"
            height="14"
            rx="2.5"
            fill={state.stickerLeft || '#D6453A'}
            stroke="#FFFFFF"
            strokeWidth="1"
          />
          <text
            x="28"
            y="21"
            textAnchor="middle"
            fontSize="7.5"
            fontWeight="800"
            fill="#FFFFFF"
            fontFamily="'Plus Jakarta Sans', sans-serif"
          >
            AUG
          </text>

          <rect
            x="280"
            y="11"
            width="24"
            height="14"
            rx="2.5"
            fill={state.stickerRight || '#1D4ED8'}
            stroke="#FFFFFF"
            strokeWidth="1"
          />
          <text
            x="292"
            y="21"
            textAnchor="middle"
            fontSize="7.5"
            fontWeight="800"
            fill="#FFFFFF"
            fontFamily="'Plus Jakarta Sans', sans-serif"
          >
            26
          </text>
        </g>

        {/* State Name Header */}
        {state.headerText && (
          <text
            x="160"
            y={state.headerStyle === 'script' ? 35 : 31}
            textAnchor="middle"
            fill={state.headerColor}
            fontFamily={headerFontFamily}
            fontSize={headerFontSize}
            fontWeight={state.headerStyle === 'script' ? 400 : 800}
            letterSpacing={state.headerStyle === 'script' ? '0.5' : '2.2'}
          >
            {state.headerText}
          </text>
        )}

        {/* Embossed License Serial Number */}
        <text
          x="160"
          y="105"
          textAnchor="middle"
          fill="#FFFFFF"
          fillOpacity="0.45"
          fontFamily="'Barlow Condensed', 'Impact', sans-serif"
          fontSize="60"
          fontWeight="800"
          letterSpacing="3.5"
          dx="1.2"
          dy="1.5"
        >
          {state.sampleSerial}
        </text>
        <text
          x="160"
          y="105"
          textAnchor="middle"
          fill={state.textColor}
          fontFamily="'Barlow Condensed', 'Impact', sans-serif"
          fontSize="60"
          fontWeight="800"
          letterSpacing="3.5"
        >
          {state.sampleSerial}
        </text>

        {/* Bottom Slogan */}
        <text
          x="160"
          y="142"
          textAnchor="middle"
          fill={state.sloganColor}
          fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
          fontSize={state.slogan.length > 20 ? 10 : 11.5}
          fontWeight="700"
          letterSpacing="1.1"
        >
          {state.slogan}
        </text>

        {/* Subtle metallic brushed-aluminum sheen */}
        <rect x="2" y="2" width="316" height="156" fill={`url(#${sheenId})`} pointerEvents="none" />
      </g>

      {/* Outer stamped aluminum rim & inner bevel */}
      <rect
        x="2.5"
        y="2.5"
        width="315"
        height="155"
        rx="11.5"
        fill="none"
        stroke={state.borderColor || '#CBD5E1'}
        strokeWidth="2.5"
      />
      <rect
        x="5"
        y="5"
        width="310"
        height="150"
        rx="9.5"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.45"
        strokeWidth="1"
      />
    </svg>
  );
});
