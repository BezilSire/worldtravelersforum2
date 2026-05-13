import React from 'react';

export default function Logo({ className = "w-48 h-auto", style = {} }) {
  const brandColor = "#f97316";
  
  return (
    <svg 
      className={className} 
      style={{ display: 'block', maxWidth: '100%', height: 'auto', ...style }}
      viewBox="0 0 800 320" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(60, 80)">
        {/* The 'W' made of 5 vertical pillars */}
        <g fill={brandColor} stroke={brandColor} strokeWidth="6" strokeLinecap="round">
          {/* Column 1 (Medium-Low) */}
          <path d="M0 60V120" opacity="0.9" />
          <circle cx="0" cy="60" r="11" stroke="none" />
          <circle cx="0" cy="90" r="11" stroke="none" />
          <circle cx="0" cy="120" r="11" stroke="none" />
          
          {/* Column 2 (Tall Peak) */}
          <path d="M40 0V120" opacity="0.9" />
          <circle cx="40" cy="0" r="11" stroke="none" />
          <circle cx="40" cy="30" r="11" stroke="none" />
          <circle cx="40" cy="60" r="11" stroke="none" />
          <circle cx="40" cy="90" r="11" stroke="none" />
          <circle cx="40" cy="120" r="11" stroke="none" />
          
          {/* Column 3 (Middle Dip) */}
          <path d="M80 60V120" opacity="0.9" />
          <circle cx="80" cy="60" r="11" stroke="none" />
          <circle cx="80" cy="90" r="11" stroke="none" />
          <circle cx="80" cy="120" r="11" stroke="none" />
          
          {/* Column 4 (Tall Peak) */}
          <path d="M120 0V120" opacity="0.9" />
          <circle cx="120" cy="0" r="11" stroke="none" />
          <circle cx="120" cy="30" r="11" stroke="none" />
          <circle cx="120" cy="60" r="11" stroke="none" />
          <circle cx="120" cy="90" r="11" stroke="none" />
          <circle cx="120" cy="120" r="11" stroke="none" />
          
          {/* Column 5 (Medium-Low) */}
          <path d="M160 60V120" opacity="0.9" />
          <circle cx="160" cy="60" r="11" stroke="none" />
          <circle cx="160" cy="90" r="11" stroke="none" />
          <circle cx="160" cy="120" r="11" stroke="none" />
        </g>

        {/* "orld" text */}
        <text 
          x="195" 
          y="135" 
          style={{
            fontFamily: 'Comfortaa, "Outfit", sans-serif',
            fontWeight: 'bold',
            fontSize: '170px',
            letterSpacing: '-0.04em',
            fill: brandColor
          }}
        >
          orld
        </text>
      </g>

      {/* TRAVELERS FORUM tagline section */}
      <g transform="translate(400, 280)">
        <text 
          textAnchor="middle" 
          style={{
            fontFamily: 'var(--font-display), sans-serif',
            fontWeight: 900,
            fontSize: '42px',
            letterSpacing: '0.16em',
            fill: 'white',
            textTransform: 'uppercase'
          }}
        >
          TRAVELERS FORUM
        </text>
        {/* Left and Right lines flanking the tagline */}
        <line x1="-450" y1="-14" x2="-285" y2="-14" stroke={brandColor} strokeWidth="5" />
        <line x1="285" y1="-14" x2="450" y2="-14" stroke={brandColor} strokeWidth="5" />
      </g>
    </svg>
  );
}
