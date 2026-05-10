import React from 'react';

interface CardProps {
  type: 1 | 2 | 3;
  number: string;
  expiry: string;
  cardType: 'PLATINUM' | 'GOLD' | 'STANDARD';
  className?: string;
}

const getCardBrandColors = (type: number) => {
  switch (type) {
    case 1:
      return 'linear-gradient(90deg, #c0c0c0, #e8e8e8, #a0a0a0)';
    case 2:
      return 'linear-gradient(90deg, #f0c040, #d4af37, #f0c040)';
    case 3:
      return 'linear-gradient(90deg, #d080ff, #a020f0, #e060ff)';
    default:
      return '';
  }
};

const getChipColors = (type: number) => {
  switch (type) {
    case 1:
      return ''; // Uses default from css
    case 2:
      return 'linear-gradient(135deg, #5c3d00, #c8960c, #f0c040, #c8960c, #5c3d00)';
    case 3:
      return 'linear-gradient(135deg, #6a6a6a, #c0c0c0, #6a6a6a)';
    default:
      return '';
  }
};

const getDecoStyles = (type: number) => {
  switch (type) {
    case 1:
      return (
        <>
          <div
            className="card-deco"
            style={{
              width: '220px',
              height: '220px',
              top: '-80px',
              right: '-60px',
              background: 'radial-gradient(circle, rgba(200, 210, 240, 0.1), transparent)',
            }}
          ></div>
          <div
            className="card-deco"
            style={{
              width: '120px',
              height: '120px',
              bottom: '-40px',
              left: '-30px',
              background: 'radial-gradient(circle, rgba(150, 160, 200, 0.08), transparent)',
            }}
          ></div>
        </>
      );
    case 2:
      return (
        <div
          className="card-deco"
          style={{
            width: '220px',
            height: '220px',
            bottom: '-80px',
            right: '-60px',
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.2), transparent)',
          }}
        ></div>
      );
    case 3:
      return (
        <div
          className="card-deco"
          style={{
            width: '200px',
            height: '200px',
            top: '-60px',
            right: '-50px',
            background: 'radial-gradient(circle, rgba(160, 0, 255, 0.25), transparent)',
          }}
        ></div>
      );
  }
};

const getCardTypeColor = (type: number) => {
  switch (type) {
    case 1: return '#c8ccd8';
    case 2: return '#d4af37';
    case 3: return '#c060ff';
    default: return '#fff';
  }
}

const Card: React.FC<CardProps> = ({ type, number, expiry, cardType, className = '' }) => {
  return (
    <div className={`credit-card card-${type} ${className}`}>
      {getDecoStyles(type)}
      <div className="flex justify-between items-start">
        <div className="card-chip" style={getChipColors(type) ? { background: getChipColors(type) } : {}}>
          <div className="card-chip-inner" style={type === 2 ? { borderColor: 'rgba(0,0,0,0.2)' } : {}}></div>
        </div>
        <div
          className="card-brand"
          style={{
            background: getCardBrandColors(type),
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          CREDIFY
        </div>
      </div>
      <div className="font-['DM_Mono',monospace] text-[13px] tracking-[3px] text-[rgba(255,255,255,0.65)] mt-[14px] mb-[16px] tabular-nums">**** **** **** {number}</div>
      <div className="flex justify-between items-end">
        <div>
          <div className="text-[9px] uppercase tracking-[0.8px] text-[rgba(255,255,255,0.4)]">Expires</div>
          <div className="font-['DM_Mono',monospace] text-[13px] font-medium text-[rgba(255,255,255,0.75)] mt-[2px] tabular-nums">{expiry}</div>
        </div>
        <div className="text-right">
          <div className="text-[9px] text-[rgba(255,255,255,0.4)] tracking-[0.8px] uppercase">
            Type
          </div>
          <div
            className="text-[12px] font-bold mt-[2px] font-sans"
            style={{ color: getCardTypeColor(type) }}
          >
            {cardType}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
