import React, { useState, useEffect } from 'react';

interface CoinLogoProps {
  symbol: string;
  name?: string;
  icon?: string;
  logoUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
}

// Special custom pixel-perfect SVG renderers for top crypto tokens & ecosystem native coins
const CUSTOM_TOKEN_LOGOS: Record<string, React.ReactNode> = {
  BSV: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="16" fill="#EAB300" />
      <path
        d="M21.2 13.5c.3-2-1.2-3.1-3.3-3.8l.7-2.7-1.7-.4-.6 2.6c-.4-.1-.9-.2-1.4-.3l.7-2.6-1.7-.4-.7 2.7c-.4-.1-.7-.2-1.1-.3l-2.3-.6-.5 1.8s1.2.3 1.2.3c.7.2.8.7.8 1.1l-.8 3.2c0 0 .1 0 .2.1l-.2-.1-1.1 4.5c-.1.2-.3.6-.8.4 0 0-1.2-.3-1.2-.3l-.8 2 2.2.5c.4.1.8.2 1.2.3l-.7 2.8 1.7.4.7-2.7c.5.1.9.2 1.4.3l-.7 2.7 1.7.4.7-2.8c2.9.5 5.1.3 6-2.3.8-2.1 0-3.3-1.5-4.1 1.1-.3 1.9-1.1 2.1-2.6zm-3.7 5.7c-.5 2.1-4 .9-5.1.7l.9-3.7c1.1.3 4.8.8 4.2 3zm.5-5.8c-.5 1.9-3.4.9-4.3.7l.8-3.4c1 .2 4.1.7 3.5 2.7z"
        fill="#FFFFFF"
      />
    </svg>
  ),
  ORAH: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <defs>
        <linearGradient id="orah-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00FF41" />
          <stop offset="100%" stopColor="#008F11" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="16" fill="#0D1F12" stroke="#00FF41" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="10" fill="url(#orah-grad)" fillOpacity="0.25" />
      <polygon points="16,6 25,12 25,20 16,26 7,20 7,12" fill="none" stroke="#00FF41" strokeWidth="2" />
      <circle cx="16" cy="16" r="3.5" fill="#00FF41" />
    </svg>
  ),
  AURA: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <defs>
        <linearGradient id="aura-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="16" fill="#180C26" stroke="#A855F7" strokeWidth="1.5" />
      <path
        d="M16 6 L24 22 L16 18 L8 22 Z"
        fill="url(#aura-grad)"
      />
      <circle cx="16" cy="14" r="2.5" fill="#FFFFFF" />
    </svg>
  ),
  BTC: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="16" fill="#F7931A" />
      <path
        d="M22.5 13.7c.3-2-1.2-3.1-3.3-3.8l.7-2.7-1.7-.4-.6 2.6c-.4-.1-.9-.2-1.4-.3l.7-2.6-1.7-.4-.7 2.7c-.4-.1-.7-.2-1.1-.3l-2.3-.6-.5 1.8s1.2.3 1.2.3c.7.2.8.7.8 1.1l-.8 3.2c0 0 .1 0 .2.1l-.2-.1-1.1 4.5c-.1.2-.3.6-.8.4 0 0-1.2-.3-1.2-.3l-.8 2 2.2.5c.4.1.8.2 1.2.3l-.7 2.8 1.7.4.7-2.7c.5.1.9.2 1.4.3l-.7 2.7 1.7.4.7-2.8c2.9.5 5.1.3 6-2.3.8-2.1 0-3.3-1.5-4.1 1.1-.3 1.9-1.1 2.1-2.6zm-3.7 5.7c-.5 2.1-4 .9-5.1.7l.9-3.7c1.1.3 4.8.8 4.2 3zm.5-5.8c-.5 1.9-3.4.9-4.3.7l.8-3.4c1 .2 4.1.7 3.5 2.7z"
        fill="#FFFFFF"
      />
    </svg>
  ),
  ETH: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="16" fill="#627EEA" />
      <g fill="#FFFFFF" fillRule="nonzero">
        <polygon points="16,4 15.8,4.7 15.8,20.4 16,20.6 23.3,16.3" fillOpacity="0.6" />
        <polygon points="16,4 8.7,16.3 16,20.6 16,4" />
        <polygon points="16,21.8 15.9,22 15.9,27.8 16,28 23.3,17.6" fillOpacity="0.6" />
        <polygon points="16,28 16,21.8 8.7,17.6" />
        <polygon points="16,20.6 23.3,16.3 16,13.1" fillOpacity="0.2" />
        <polygon points="8.7,16.3 16,20.6 16,13.1" fillOpacity="0.45" />
      </g>
    </svg>
  ),
  SOL: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <defs>
        <linearGradient id="sol-g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00FFA3" />
          <stop offset="100%" stopColor="#DC1FFF" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="16" fill="#000000" />
      <path d="M7 21.8h14.5c.6 0 1.1-.3 1.5-.7l2.8-2.8c.4-.4.1-1.1-.5-1.1H10.8c-.6 0-1.1.3-1.5.7l-2.8 2.8c-.4.4-.1 1.1.5 1.1z" fill="url(#sol-g1)" />
      <path d="M7 11.2h14.5c.6 0 1.1-.3 1.5-.7l2.8-2.8c.4-.4.1-1.1-.5-1.1H10.8c-.6 0-1.1.3-1.5.7l-2.8 2.8c-.4.4-.1 1.1.5 1.1z" fill="url(#sol-g1)" />
      <path d="M25 16.5H10.5c-.6 0-1.1.3-1.5.7l-2.8 2.8c-.4.4-.1 1.1.5 1.1h14.5c.6 0 1.1-.3 1.5-.7l2.8-2.8c.4-.4.1-1.1-.5-1.1z" fill="url(#sol-g1)" />
    </svg>
  ),
  USDT: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="16" fill="#26A17B" />
      <path
        d="M17.9 14.9v-2.2h4.5V9.4H9.6v3.3h4.5v2.2C9.5 15.1 6 16.2 6 17.5c0 1.3 3.5 2.4 8.1 2.6v5.8h3.8v-5.8c4.6-.2 8.1-1.3 8.1-2.6 0-1.3-3.5-2.4-8.1-2.6zm0 4.3v-.1c-.6 0-1.2.1-1.9.1s-1.3 0-1.9-.1v.1c-3.6-.2-6.2-.9-6.2-1.8 0-.9 2.6-1.6 6.2-1.8v2.4c.6.1 1.2.1 1.9.1s1.3 0 1.9-.1v-2.4c3.6.2 6.2.9 6.2 1.8 0 .9-2.6 1.6-6.2 1.8z"
        fill="#FFFFFF"
      />
    </svg>
  ),
  USDC: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="16" fill="#2775CA" />
      <path
        d="M16 5.5C10.2 5.5 5.5 10.2 5.5 16S10.2 26.5 16 26.5 26.5 21.8 26.5 16 21.8 5.5 16 5.5zm0 19.3c-4.5 0-8.2-3.7-8.2-8.2s3.7-8.2 8.2-8.2 8.2 3.7 8.2 8.2-3.7 8.2-8.2 8.2zm1.2-13.8h-2.5c-.2 0-.3.1-.3.3v.8c-.8.1-1.5.4-2.1.8-.2.1-.2.4-.1.6l.8 1.1c.1.2.4.2.6.1.4-.3.8-.5 1.3-.5.7 0 1.1.4 1.1.8 0 .5-.4.7-1.3 1-1.3.4-2.4.9-2.4 2.2 0 1.1.8 1.9 2 2.1v.8c0 .2.1.3.3.3h1.8c.2 0 .3-.1.3-.3v-.8c.9-.1 1.7-.5 2.3-1 .2-.2.2-.4 0-.6l-.9-1.1c-.1-.2-.4-.2-.6-.1-.5.4-1 .6-1.6.6-.7 0-1.2-.3-1.2-.8 0-.5.5-.7 1.4-1 1.4-.4 2.3-.9 2.3-2.1 0-1-.7-1.8-1.8-2.1v-.8c0-.2-.1-.3-.3-.3z"
        fill="#FFFFFF"
      />
    </svg>
  ),
  BNB: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="16" fill="#F3BA2F" />
      <path
        d="M16 6.5l3.8 3.8-3.8 3.8-3.8-3.8L16 6.5zm-5.7 5.7l2.3 2.3-2.3 2.3-2.3-2.3 2.3-2.3zm11.4 0l2.3 2.3-2.3 2.3-2.3-2.3 2.3-2.3zm-5.7 1.9l3.8 3.8-3.8 3.8-3.8-3.8 3.8-3.8zm-5.7 5.7l2.3 2.3-2.3 2.3-2.3-2.3 2.3-2.3zm11.4 0l2.3 2.3-2.3 2.3-2.3-2.3 2.3-2.3zm-5.7 1.9l3.8 3.8-3.8 3.8-3.8-3.8 3.8-3.8z"
        fill="#FFFFFF"
      />
    </svg>
  ),
  XRP: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="16" fill="#23292F" />
      <path
        d="M24.2 8.5h2.8l-5.6 5.5c-1.4 1.4-3.7 1.4-5.1 0L10.7 8.5h2.8l3.9 3.8c.7.7 1.9.7 2.6 0l4.2-3.8zm-16.4 15h-2.8l5.6-5.5c1.4-1.4 3.7-1.4 5.1 0l5.6 5.5h-2.8l-3.9-3.8c-.7-.7-1.9-.7-2.6 0l-4.2 3.8z"
        fill="#FFFFFF"
      />
    </svg>
  ),
  DOGE: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="16" fill="#C2A633" />
      <path
        d="M11 9h6.4c3.9 0 6.6 2.7 6.6 7s-2.7 7-6.6 7H11V9zm3.8 11.2h2.4c2.2 0 3.7-1.5 3.7-4.2s-1.5-4.2-3.7-4.2h-2.4v8.4zM9 15.5h6v2H9v-2z"
        fill="#FFFFFF"
      />
    </svg>
  ),
  TON: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="16" fill="#0098EA" />
      <path
        d="M16 6.5L7 12l9 13.5L25 12 16 6.5zm-6.2 6l6.2-3.7 6.2 3.7-6.2 9.5-6.2-9.5z"
        fill="#FFFFFF"
      />
    </svg>
  ),
  SUI: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="16" fill="#4CA2FF" />
      <path
        d="M16 7c-4 5.5-6 9.5-6 13 0 3.3 2.7 6 6 6s6-2.7 6-6c0-3.5-2-7.5-6-13zm0 21.5c-2.5 0-4.5-2-4.5-4.5 0-2.8 1.8-6.3 4.5-10.2 2.7 3.9 4.5 7.4 4.5 10.2 0 2.5-2 4.5-4.5 4.5z"
        fill="#FFFFFF"
      />
    </svg>
  ),
  RON: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="16" fill="#1273EA" />
      <path
        d="M9 7h8.5c3.6 0 6.5 2.7 6.5 6.2 0 2.5-1.5 4.7-3.7 5.6L25 25h-5.2l-3.8-5.3H13.6V25H9V7zm4.6 9.1h3.7c1.6 0 2.8-1.2 2.8-2.8s-1.2-2.8-2.8-2.8h-3.7v5.6z"
        fill="#FFFFFF"
      />
    </svg>
  ),
  AVAX: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="16" fill="#E84142" />
      <path
        d="M16 7.5L24 22h-3.8l-4.2-7.8-4.2 7.8H8l8-14.5z"
        fill="#FFFFFF"
      />
    </svg>
  ),
  LINK: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="16" fill="#375BD2" />
      <path
        d="M16 6.5l8 4.6v9.2l-8 4.6-8-4.6v-9.2l8-4.6zm5.5 12.2V13l-5.5-3.2L10.5 13v5.7l5.5 3.2 5.5-3.2z"
        fill="#FFFFFF"
      />
    </svg>
  ),
  UNI: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="16" fill="#FF007A" />
      <path
        d="M13.5 9c2-2.5 5.5-2.5 7.5 0 2 2.5 1.5 6-.5 8.5l-4.5 4.5c-.8.8-2 .8-2.8 0L9 17.5c-1.5-1.5-1.5-4 0-5.5l4.5-3z"
        fill="#FFFFFF"
      />
    </svg>
  ),
  PEPE: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="16" fill="#4BAE4F" />
      <ellipse cx="12" cy="14" rx="4" ry="3" fill="#FFFFFF" />
      <ellipse cx="20" cy="14" rx="4" ry="3" fill="#FFFFFF" />
      <circle cx="12" cy="14" r="1.8" fill="#000000" />
      <circle cx="20" cy="14" r="1.8" fill="#000000" />
      <path d="M10 20c2 2 10 2 12 0" stroke="#000000" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  ),
  A8: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <defs>
        <linearGradient id="a8-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF3366" />
          <stop offset="100%" stopColor="#8A2BE2" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="16" fill="#1A0D24" stroke="#FF3366" strokeWidth="1.2" />
      <circle cx="16" cy="16" r="12" fill="url(#a8-grad)" />
      <text x="16" y="21" fill="#FFFFFF" fontSize="13" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
        8
      </text>
    </svg>
  ),
  LMWR: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <defs>
        <linearGradient id="lmwr-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00EC82" />
          <stop offset="100%" stopColor="#00A859" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="16" fill="#071E12" stroke="#00EC82" strokeWidth="1.2" />
      <circle cx="16" cy="16" r="12" fill="url(#lmwr-grad)" />
      <path
        d="M16 7 C11 7 7 11 7 16 C7 21 11 25 16 25 C21 25 25 21 25 16 C25 11 21 7 16 7 Z"
        fill="#042F1A"
      />
      <circle cx="16" cy="16" r="6.5" fill="#00EC82" />
      <path
        d="M16 10 L16 22 M10 16 L22 16 M11.8 11.8 L20.2 20.2 M11.8 20.2 L20.2 11.8"
        stroke="#042F1A"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16" r="2.2" fill="#FFFFFF" />
    </svg>
  ),
  APE: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="16" fill="#0054FA" />
      <path
        d="M16 7C11 7 7 11 7 16c0 3.5 2 6.5 5 8v-2.5c-1.8-1-3-3-3-5.5 0-3.9 3.1-7 7-7s7 3.1 7 7c0 2.5-1.2 4.5-3 5.5V24c3-1.5 5-4.5 5-8 0-5-4-9-9-9zm0 5c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z"
        fill="#FFFFFF"
      />
      <circle cx="13" cy="15" r="1.5" fill="#FFFFFF" />
      <circle cx="19" cy="15" r="1.5" fill="#FFFFFF" />
    </svg>
  ),
  BERA: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="16" fill="#8B4513" stroke="#D2691E" strokeWidth="1" />
      <circle cx="11" cy="10" r="3" fill="#A0522D" />
      <circle cx="21" cy="10" r="3" fill="#A0522D" />
      <circle cx="16" cy="17" r="8" fill="#CD853F" />
      <circle cx="13.5" cy="15" r="1.5" fill="#000000" />
      <circle cx="18.5" cy="15" r="1.5" fill="#000000" />
      <ellipse cx="16" cy="19" rx="3" ry="2" fill="#8B4513" />
    </svg>
  ),
  PAXG: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="16" fill="#D4AF37" stroke="#F1D779" strokeWidth="1.2" />
      <circle cx="16" cy="16" r="12" fill="#1A150A" />
      <text x="16" y="21" fill="#F1D779" fontSize="11" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
        Au
      </text>
    </svg>
  ),
  ADA: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="16" fill="#0033AD" />
      <circle cx="16" cy="16" r="4" fill="#FFFFFF" />
      <circle cx="16" cy="6" r="1.5" fill="#FFFFFF" />
      <circle cx="16" cy="26" r="1.5" fill="#FFFFFF" />
      <circle cx="6" cy="16" r="1.5" fill="#FFFFFF" />
      <circle cx="26" cy="16" r="1.5" fill="#FFFFFF" />
      <circle cx="9" cy="9" r="1.5" fill="#FFFFFF" />
      <circle cx="23" cy="9" r="1.5" fill="#FFFFFF" />
      <circle cx="9" cy="23" r="1.5" fill="#FFFFFF" />
      <circle cx="23" cy="23" r="1.5" fill="#FFFFFF" />
    </svg>
  ),
  NEAR: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="16" fill="#000000" />
      <path
        d="M9 22.5V9.5h3.2l7.2 9.8V9.5H23v13h-3.2L12.6 12.7v9.8H9z"
        fill="#FFFFFF"
      />
    </svg>
  ),
  ARB: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="16" fill="#28A0F0" />
      <path
        d="M16 6l7 14-2.5 5h-9L9 20l7-14zm0 5l-4 8h8l-4-8z"
        fill="#FFFFFF"
      />
    </svg>
  ),
  OP: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="16" fill="#FF0420" />
      <circle cx="12" cy="16" r="5" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
      <path d="M19 11h3.5a4 4 0 0 1 0 8H19v4h-2.5V11H19zm0 5.5h3a1.5 1.5 0 0 0 0-3H19v3z" fill="#FFFFFF" />
    </svg>
  ),
  MATIC: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="16" fill="#8247E5" />
      <path
        d="M16 8l5 2.8v5.6L16 19.2l-5-2.8v-5.6L16 8zm6 9.5l4-2.2v-4.5l-4 2.2v4.5zm-12 0l-4-2.2v-4.5l4 2.2v4.5z"
        fill="#FFFFFF"
      />
    </svg>
  ),
  SHIB: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="16" fill="#FFA409" />
      <circle cx="16" cy="16" r="12" fill="#E84142" />
      <polygon points="16,8 21,15 11,15" fill="#FFFFFF" />
      <circle cx="13" cy="17" r="1.5" fill="#000000" />
      <circle cx="19" cy="17" r="1.5" fill="#000000" />
      <polygon points="16,19 14,21 18,21" fill="#000000" />
    </svg>
  )
};

export interface OfficialCoinInfo {
  symbol: string;
  name: string;
  network: string;
  color: string;
}

export const OFFICIAL_COINS_GALLERY: OfficialCoinInfo[] = [
  { symbol: 'BSV', name: 'Bitcoin SV', network: 'Teranode L1', color: '#EAB300' },
  { symbol: 'BTC', name: 'Bitcoin', network: 'Bitcoin Mainnet', color: '#F7931A' },
  { symbol: 'ETH', name: 'Ethereum', network: 'EVM Mainnet', color: '#627EEA' },
  { symbol: 'SOL', name: 'Solana', network: 'Solana High-TPS', color: '#14F195' },
  { symbol: 'ORAH', name: 'Tradex Protocol', network: 'BSV Native', color: '#00FF41' },
  { symbol: 'AURA', name: 'Aura AI Intelligence', network: 'BSV Native', color: '#A855F7' },
  { symbol: 'USDT', name: 'Tether USD', network: 'Multi-Chain', color: '#26A17B' },
  { symbol: 'USDC', name: 'USD Coin', network: 'Multi-Chain', color: '#2775CA' },
  { symbol: 'DOGE', name: 'Dogecoin', network: 'Dogecoin L1', color: '#C2A633' },
  { symbol: 'PEPE', name: 'Pepe', network: 'Ethereum', color: '#4BAE4F' },
  { symbol: 'SUI', name: 'Sui Network', network: 'Sui Mainnet', color: '#4CA2FF' },
  { symbol: 'AVAX', name: 'Avalanche', network: 'Avalanche C-Chain', color: '#E84142' },
  { symbol: 'A8', name: 'Ancient8', network: 'Base / Ronin (EVM)', color: '#FF3366' },
  { symbol: 'LMWR', name: 'LimeWire', network: 'Ethereum / Base (ERC-20)', color: '#00EC82' },
  { symbol: 'RON', name: 'Ronin Network', network: 'Ronin L1', color: '#1273EA' },
  { symbol: 'LINK', name: 'Chainlink', network: 'Multi-Chain', color: '#375BD2' },
  { symbol: 'BNB', name: 'Binance Coin', network: 'BNB Chain', color: '#F3BA2F' },
  { symbol: 'XRP', name: 'Ripple', network: 'XRP Ledger', color: '#23292F' },
  { symbol: 'TON', name: 'The Open Network', network: 'TON L1', color: '#0098EA' },
  { symbol: 'ARB', name: 'Arbitrum', network: 'Arbitrum One', color: '#28A0F0' },
  { symbol: 'OP', name: 'Optimism', network: 'OP Mainnet', color: '#FF0420' },
  { symbol: 'MATIC', name: 'Polygon', network: 'Polygon PoS', color: '#8247E5' },
  { symbol: 'PAXG', name: 'PAX Gold', network: 'Ethereum', color: '#D4AF37' }
];

export const getCustomCoinLogo = (symbol: string): string | null => {
  if (typeof window === 'undefined') return null;
  const rawClean = (symbol || '').split('/')[0].split(' ')[0].split('-')[0].trim().toUpperCase();
  const cleanSym = rawClean.replace(/[^A-Z0-9]/g, '') || 'COIN';
  return localStorage.getItem(`custom_coin_logo_${cleanSym}`);
};

export const setCustomCoinLogo = (symbol: string, dataUrl: string) => {
  if (typeof window === 'undefined') return;
  const rawClean = (symbol || '').split('/')[0].split(' ')[0].split('-')[0].trim().toUpperCase();
  const cleanSym = rawClean.replace(/[^A-Z0-9]/g, '') || 'COIN';
  localStorage.setItem(`custom_coin_logo_${cleanSym}`, dataUrl);
  window.dispatchEvent(new CustomEvent('coin_logo_updated', { detail: { symbol: cleanSym, logoUrl: dataUrl } }));
};

export const removeCustomCoinLogo = (symbol: string) => {
  if (typeof window === 'undefined') return;
  const rawClean = (symbol || '').split('/')[0].split(' ')[0].split('-')[0].trim().toUpperCase();
  const cleanSym = rawClean.replace(/[^A-Z0-9]/g, '') || 'COIN';
  localStorage.removeItem(`custom_coin_logo_${cleanSym}`);
  window.dispatchEvent(new CustomEvent('coin_logo_updated', { detail: { symbol: cleanSym, logoUrl: null } }));
};

// Ecosystem & theme palettes for high-fidelity procedural generation
const PALETTES = [
  { bg1: '#00FF41', bg2: '#008F11', text: '#000000', border: '#00FF41' },
  { bg1: '#6366F1', bg2: '#4338CA', text: '#FFFFFF', border: '#818CF8' },
  { bg1: '#EC4899', bg2: '#BE185D', text: '#FFFFFF', border: '#F472B6' },
  { bg1: '#F59E0B', bg2: '#B45309', text: '#000000', border: '#FBBF24' },
  { bg1: '#06B6D4', bg2: '#0E7490', text: '#FFFFFF', border: '#22D3EE' },
  { bg1: '#8B5CF6', bg2: '#6D28D9', text: '#FFFFFF', border: '#A78BFA' },
  { bg1: '#10B981', bg2: '#047857', text: '#FFFFFF', border: '#34D399' },
  { bg1: '#3B82F6', bg2: '#1D4ED8', text: '#FFFFFF', border: '#60A5FA' },
  { bg1: '#EF4444', bg2: '#B91C1C', text: '#FFFFFF', border: '#F87171' },
  { bg1: '#14F195', bg2: '#9945FF', text: '#000000', border: '#14F195' }
];

export const CoinLogo: React.FC<CoinLogoProps> = ({
  symbol,
  name,
  icon,
  logoUrl,
  size = 'md',
  className = ''
}) => {
  const [imgErrorIndex, setImgErrorIndex] = useState(0);

  // Extract base symbol cleanly if passed e.g. "SOL/USDT" -> "SOL"
  const rawClean = (symbol || '').split('/')[0].split(' ')[0].split('-')[0].trim().toUpperCase();
  const cleanSym = rawClean.replace(/[^A-Z0-9]/g, '') || 'COIN';
  const cleanLower = cleanSym.toLowerCase();

  // Check if custom uploaded logo is stored in localStorage
  const [customLogoState, setCustomLogoState] = useState<string | null>(() => getCustomCoinLogo(cleanSym));

  useEffect(() => {
    setCustomLogoState(getCustomCoinLogo(cleanSym));
    const handleUpdate = (e: any) => {
      if (e.detail?.symbol === cleanSym) {
        setCustomLogoState(e.detail?.logoUrl);
      }
    };
    window.addEventListener('coin_logo_updated', handleUpdate);
    return () => window.removeEventListener('coin_logo_updated', handleUpdate);
  }, [cleanSym]);

  // Reset error index on token change
  useEffect(() => {
    setImgErrorIndex(0);
  }, [cleanSym, logoUrl]);

  // Size mapping
  let sizePx = 28;
  let textClass = 'text-xs';

  if (typeof size === 'number') {
    sizePx = size;
    textClass = sizePx < 20 ? 'text-[8px]' : sizePx < 28 ? 'text-[10px]' : 'text-xs';
  } else {
    switch (size) {
      case 'xs':
        sizePx = 18;
        textClass = 'text-[8px] font-black';
        break;
      case 'sm':
        sizePx = 22;
        textClass = 'text-[9px] font-black';
        break;
      case 'md':
        sizePx = 28;
        textClass = 'text-xs font-black';
        break;
      case 'lg':
        sizePx = 36;
        textClass = 'text-sm font-black';
        break;
      case 'xl':
        sizePx = 48;
        textClass = 'text-base font-black';
        break;
    }
  }

  // 0. Check if user uploaded a custom logo for this token
  if (customLogoState) {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-full shrink-0 overflow-hidden bg-[#141414] border border-[#262626] shadow-sm ${className}`}
        style={{ width: `${sizePx}px`, height: `${sizePx}px` }}
        title={`${name || cleanSym} (Custom Uploaded Logo)`}
      >
        <img
          src={customLogoState}
          alt={cleanSym}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // 1. Check if custom vector SVG is defined
  if (CUSTOM_TOKEN_LOGOS[cleanSym]) {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-full shrink-0 overflow-hidden shadow-sm ${className}`}
        style={{ width: `${sizePx}px`, height: `${sizePx}px` }}
        title={`${name || cleanSym} (${cleanSym})`}
      >
        {CUSTOM_TOKEN_LOGOS[cleanSym]}
      </div>
    );
  }

  // 2. Build multi-CDN candidate list
  const cdnCandidates: string[] = [];

  if (logoUrl && logoUrl.startsWith('http')) {
    cdnCandidates.push(logoUrl);
  }

  // CoinCap 2x PNG icon CDN
  cdnCandidates.push(`https://assets.coincap.io/assets/icons/${cleanLower}@2x.png`);
  // AtomicLabs SVG cryptocurrency-icons CDN
  cdnCandidates.push(`https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63539be16e3add409385e966bb4d590163b12b/svg/color/${cleanLower}.svg`);
  // SpotHQ Cryptocurrency Icons CDN
  cdnCandidates.push(`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${cleanLower}.png`);
  // Solana labs token registry
  cdnCandidates.push(`https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/${cleanSym}/logo.png`);

  const currentSrc = cdnCandidates[imgErrorIndex];

  // If there's an image candidate available that hasn't failed yet
  if (currentSrc && imgErrorIndex < cdnCandidates.length) {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-full shrink-0 overflow-hidden bg-[#141414] border border-[#262626] shadow-sm ${className}`}
        style={{ width: `${sizePx}px`, height: `${sizePx}px` }}
        title={`${name || cleanSym} (${cleanSym})`}
      >
        <img
          src={currentSrc}
          alt={cleanSym}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setImgErrorIndex((prev) => prev + 1)}
        />
      </div>
    );
  }

  // 3. Fallback: High-fidelity Procedural Vector Crypto Emblem for the 5,000+ Universe
  // Generate deterministic gradient & insignia from token symbol
  let hash = 0;
  for (let i = 0; i < cleanSym.length; i++) {
    hash = (hash << 5) - hash + cleanSym.charCodeAt(i);
    hash |= 0;
  }
  const paletteIndex = Math.abs(hash) % PALETTES.length;
  const p = PALETTES[paletteIndex];
  const displayLabel = cleanSym.length <= 4 ? cleanSym : cleanSym.slice(0, 3);
  const gradId = `coin_grad_${cleanSym}_${paletteIndex}`;

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full shrink-0 select-none shadow-sm ${className}`}
      style={{ width: `${sizePx}px`, height: `${sizePx}px` }}
      title={`${name || cleanSym} (${cleanSym})`}
    >
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={p.bg1} />
            <stop offset="100%" stopColor={p.bg2} />
          </linearGradient>
          <radialGradient id={`glow_${gradId}`} cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.1" />
          </radialGradient>
        </defs>
        
        {/* Outer Ring */}
        <circle cx="16" cy="16" r="15.2" fill={`url(#${gradId})`} stroke={p.border} strokeWidth="1" />
        
        {/* Specular Inner Glare */}
        <circle cx="16" cy="16" r="13.5" fill={`url(#glow_${gradId})`} />
        
        {/* Decorative Coin Ring */}
        <circle cx="16" cy="16" r="12" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" strokeDasharray="1.5,1.5" />
        
        {/* Token Monogram / Symbol */}
        <text
          x="16"
          y="20"
          fill={p.text}
          fontSize={displayLabel.length > 3 ? "8.5" : displayLabel.length > 2 ? "10" : "12"}
          fontWeight="900"
          textAnchor="middle"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="-0.5px"
        >
          {displayLabel}
        </text>
      </svg>
    </div>
  );
};
