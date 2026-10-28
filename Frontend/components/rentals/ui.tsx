'use client';

import React from 'react';
import type { ReservationStatus } from '@/app/rentals/types';

// ── Colors ───────────────────────────────────────────────────────────────────
export const C = {
  pine:    '#2F5D3F',
  pineHov: '#264C34',
  moss:    '#7A8B5C',
  clay:    '#C1683C',
  sand:    '#F7F4EE',
  sage:    '#E8EDE2',
  border:  '#E3DDD1',
  surface: '#ffffff',
  tp:      '#22271F',
  ts:      '#5C6357',
  td:      '#9AA095',
  tableHd: '#F2EFE7',
};

// ── Button ───────────────────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type BtnSize = 'md' | 'sm';

export function Btn({
  variant = 'primary',
  size = 'md',
  disabled,
  onClick,
  children,
  fullWidth,
  type = 'button',
}: {
  variant?: BtnVariant;
  size?: BtnSize;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  fullWidth?: boolean;
  type?: 'button' | 'submit';
}) {
  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    fontFamily: 'inherit',
    fontWeight: 500,
    borderRadius: 8,
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: '1px solid transparent',
    transition: 'background 0.15s, opacity 0.15s',
    opacity: disabled ? 0.4 : 1,
    width: fullWidth ? '100%' : undefined,
    whiteSpace: 'nowrap',
    fontSize: size === 'sm' ? 13 : 14,
    height: size === 'sm' ? 32 : 40,
    padding: size === 'sm' ? '0 12px' : '0 16px',
  };

  const styles: Record<BtnVariant, React.CSSProperties> = {
    primary:     { backgroundColor: C.pine,    color: '#fff',     borderColor: C.pine },
    secondary:   { backgroundColor: C.surface, color: C.pine,     borderColor: C.pine },
    ghost:       { backgroundColor: 'transparent', color: C.ts,   borderColor: 'transparent' },
    destructive: { backgroundColor: C.surface, color: '#A33B2A',  borderColor: '#A33B2A' },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...styles[variant] }}
      onMouseEnter={e => {
        if (disabled) return;
        if (variant === 'primary') (e.currentTarget as HTMLButtonElement).style.backgroundColor = C.pineHov;
        if (variant === 'ghost') (e.currentTarget as HTMLButtonElement).style.textDecoration = 'underline';
      }}
      onMouseLeave={e => {
        if (variant === 'primary') (e.currentTarget as HTMLButtonElement).style.backgroundColor = C.pine;
        if (variant === 'ghost') (e.currentTarget as HTMLButtonElement).style.textDecoration = 'none';
      }}
    >
      {children}
    </button>
  );
}

// ── IconBtn ──────────────────────────────────────────────────────────────────
export function IconBtn({ onClick, title, children }: { onClick?: () => void; title?: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{ width: 36, height: 36, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.ts, transition: 'background 0.12s' }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.sage)}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {children}
    </button>
  );
}

// ── Field ────────────────────────────────────────────────────────────────────
export function Field({
  label,
  helper,
  error,
  children,
}: {
  label: string;
  helper?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: C.tp, fontFamily: 'inherit' }}>{label}</label>
      {children}
      {error  && <span style={{ fontSize: 13, color: '#A33B2A' }}>{error}</span>}
      {!error && helper && <span style={{ fontSize: 13, color: C.td }}>{helper}</span>}
    </div>
  );
}

const inputBase: React.CSSProperties = {
  height: 40,
  width: '100%',
  borderRadius: 10,
  border: `1px solid ${C.border}`,
  backgroundColor: C.surface,
  padding: '0 12px',
  fontSize: 14,
  fontFamily: 'inherit',
  color: C.tp,
  outline: 'none',
};

export function TextInput({
  value,
  onChange,
  placeholder,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: boolean;
}) {
  return (
    <input
      style={{ ...inputBase, borderColor: error ? '#A33B2A' : C.border }}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      onFocus={e => (e.currentTarget.style.borderColor = C.pine)}
      onBlur={e => (e.currentTarget.style.borderColor = error ? '#A33B2A' : C.border)}
    />
  );
}

export function SelectInput({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
}) {
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ ...inputBase, paddingRight: 36, appearance: 'none', cursor: 'pointer' }}
        onFocus={e => (e.currentTarget.style.borderColor = C.pine)}
        onBlur={e => (e.currentTarget.style.borderColor = C.border)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: C.ts }}>
        <ChevronDown />
      </span>
    </div>
  );
}

export function DateInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const today = new Date().toISOString().split('T')[0];
  return (
    <div style={{ position: 'relative' }}>
      <input
        type="date"
        min={today}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ ...inputBase, paddingRight: 36, cursor: 'pointer' }}
        onFocus={e => (e.currentTarget.style.borderColor = C.pine)}
        onBlur={e => (e.currentTarget.style.borderColor = C.border)}
      />
      <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: C.ts }}>
        <CalendarIcon />
      </span>
    </div>
  );
}

export function Textarea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ ...inputBase, height: 96, padding: '10px 12px', resize: 'vertical', lineHeight: 1.5 }}
      onFocus={e => (e.currentTarget.style.borderColor = C.pine)}
      onBlur={e => (e.currentTarget.style.borderColor = C.border)}
    />
  );
}

export function SearchField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div style={{ position: 'relative', width: 280 }}>
      <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.td, pointerEvents: 'none' }}>
        <SearchIcon />
      </span>
      <input
        style={{ ...inputBase, paddingLeft: 34, paddingRight: value ? 32 : 12 }}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? 'Search…'}
        onFocus={e => (e.currentTarget.style.borderColor = C.pine)}
        onBlur={e => (e.currentTarget.style.borderColor = C.border)}
      />
      {value && (
        <button onClick={() => onChange('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.td, display: 'flex', padding: 2 }}>
          <XIcon size={14} />
        </button>
      )}
    </div>
  );
}

// ── Status badge ─────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<ReservationStatus, { bg: string; text: string }> = {
  Pending:      { bg: '#FBF3E0', text: '#B98A2E' },
  Approved:     { bg: '#E8F0E8', text: '#2F5D3F' },
  'Checked Out':{ bg: '#E4EEF5', text: '#2D5C7A' },
  Returned:     { bg: '#EFEDE6', text: '#5C6357' },
  Declined:     { bg: '#F8E7E3', text: '#A33B2A' },
};

export function StatusBadge({ status }: { status: ReservationStatus }) {
  const { bg, text } = STATUS_COLORS[status];
  return (
    <span style={{ backgroundColor: bg, color: text, fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 999, display: 'inline-block', whiteSpace: 'nowrap' }}>
      {status}
    </span>
  );
}

// ── Alert banner ─────────────────────────────────────────────────────────────
export function AlertBanner({ variant, title, body }: { variant: 'success' | 'info'; title: string; body?: string }) {
  const styles = {
    success: { bg: '#E8F0E8', border: '#B8D4B8', icon: '✓', iconColor: C.pine },
    info:    { bg: '#EEF3F8', border: '#C0D2E4', icon: 'i', iconColor: '#2D5C7A' },
  }[variant];
  return (
    <div style={{ backgroundColor: styles.bg, border: `1px solid ${styles.border}`, borderRadius: 10, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: styles.iconColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{styles.icon}</span>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14, color: C.tp }}>{title}</div>
        {body && <div style={{ fontSize: 13, color: C.ts, marginTop: 2 }}>{body}</div>}
      </div>
    </div>
  );
}

// ── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, ...style }}>
      {children}
    </div>
  );
}

// ── Stepper ──────────────────────────────────────────────────────────────────
const STEPS = ['Your Info', 'Add Items', 'Confirm', 'Done'];

export function Stepper({ step }: { step: 1 | 2 | 3 | 4 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 40 }}>
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const active = n === step;
        return (
          <React.Fragment key={label}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: done || active ? C.pine : C.surface,
                border: `2px solid ${done || active ? C.pine : C.border}`,
                color: done || active ? '#fff' : C.td,
                fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
              }}>
                {done ? '✓' : n}
              </div>
              <span style={{ fontSize: 12, fontWeight: active ? 600 : 400, color: active ? C.pine : C.ts, whiteSpace: 'nowrap' }}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ width: 80, height: 2, backgroundColor: n < step ? C.pine : C.border, margin: '0 4px', marginBottom: 22, transition: 'background 0.2s' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, footer }: { title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div
      className="fade-in"
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(34,39,31,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="slide-up"
        style={{ backgroundColor: C.surface, borderRadius: 10, width: 560, maxWidth: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 2px rgba(34,39,31,0.06), 0 8px 24px rgba(34,39,31,0.12)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: `1px solid ${C.border}` }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: C.tp }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.ts, display: 'flex', padding: 4, borderRadius: 4 }}>
            <XIcon />
          </button>
        </div>
        <div style={{ overflowY: 'auto', padding: '20px 24px', flex: 1 }}>{children}</div>
        {footer && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '16px 24px', borderTop: `1px solid ${C.border}` }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────────
export function EmptyState({ message, sub }: { message: string; sub?: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px', color: C.ts }}>
      <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.4 }}>⊘</div>
      <div style={{ fontSize: 15, fontWeight: 500, color: C.tp }}>{message}</div>
      {sub && <div style={{ fontSize: 13, color: C.td, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ── Icons ────────────────────────────────────────────────────────────────────
export function ChevronDown({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
export function XIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
export function SearchIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5"/><path d="M10.5 10.5l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
export function CalendarIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M5 2v2M11 2v2M2 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
export function EyeIcon() {
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><ellipse cx="8" cy="8" rx="6" ry="4" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/></svg>;
}
export function EditIcon() {
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M11 2l3 3-8 8H3v-3l8-8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>;
}
export function TrashIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 5h10M6 5V3h4v2M5 5l.5 8h5l.5-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
export function CheckIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
