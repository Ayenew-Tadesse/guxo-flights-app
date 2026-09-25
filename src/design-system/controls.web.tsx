import { useId, useState, type CSSProperties } from 'react';
import { View } from 'react-native';

import { Icon, type IconName } from './icons';
import { useColors, useLayout } from './theme';
import { fonts, radius } from './tokens';

/*
 * Web versions of the form controls. They render the browser's own
 * controls, exactly like the web prototypes do (date picker, <select>,
 * range slider, <datalist> suggestions).
 */

function useDomInputStyle(hasIcon: boolean, focused: boolean): CSSProperties {
  const c = useColors();
  const { rem, atLeast } = useLayout();
  const p = atLeast(768) ? 13 : 12;
  return {
    fontFamily: fonts[400],
    fontSize: rem(0.9062),
    color: c.ink,
    width: '100%',
    background: c.surfaceAlt,
    border: `1px solid ${c.line}`,
    borderRadius: radius.field,
    padding: `${p}px ${p}px ${p}px ${hasIcon ? (atLeast(768) ? 38 : 36) : p}px`,
    appearance: 'none',
    boxSizing: 'border-box',
    outline: focused ? `2px solid ${c.primary}` : 'none',
    outlineOffset: 1,
    margin: 0,
    minHeight: 0,
  };
}

export function DateInput({ value, min, onChange }: { value: string; min?: string; onChange: (iso: string) => void }) {
  const [focused, setFocused] = useState(false);
  const style = useDomInputStyle(false, focused);
  return (
    <input
      type="date"
      value={value}
      min={min}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={style}
    />
  );
}

export function SelectInput({
  value,
  options,
  onChange,
  label,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  label: string;
}) {
  const c = useColors();
  const { rem } = useLayout();
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ position: 'relative', width: '100%', justifyContent: 'center' }}>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          padding: '11px 32px 11px 14px',
          borderRadius: 11,
          fontFamily: fonts[700],
          fontSize: rem(0.8125),
          background: c.surfaceAlt,
          border: `1px solid ${c.line}`,
          color: c.ink,
          appearance: 'none',
          cursor: 'pointer',
          outline: focused ? `2px solid ${c.primary}` : 'none',
          outlineOffset: 1,
        }}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          right: 12,
          width: 7,
          height: 7,
          borderRightWidth: 2,
          borderBottomWidth: 2,
          borderColor: c.inkSoft,
          transform: [{ translateY: -2 }, { rotate: '45deg' }],
        }}
      />
    </View>
  );
}

export function RangeInput({
  value,
  min,
  max,
  onChange,
  label,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const c = useColors();
  return (
    <input
      type="range"
      aria-label={label}
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ width: '100%', accentColor: c.primary, margin: 0 }}
    />
  );
}

/** Text input with suggestions (a <datalist> on web). */
export function ComboInput({
  value,
  onChangeText,
  suggestions,
  placeholder,
  icon,
  label,
}: {
  value: string;
  onChangeText: (v: string) => void;
  suggestions: string[];
  placeholder?: string;
  icon?: IconName;
  label: string;
}) {
  const c = useColors();
  const listId = useId();
  const [focused, setFocused] = useState(false);
  const style = useDomInputStyle(!!icon, focused);
  return (
    <View style={{ position: 'relative', justifyContent: 'center' }}>
      <input
        type="text"
        aria-label={label}
        list={listId}
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChangeText(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={style}
      />
      <datalist id={listId}>
        {suggestions.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
      {icon ? (
        <View pointerEvents="none" style={{ position: 'absolute', left: 12 }}>
          <Icon name={icon} size={16} color={c.primary} />
        </View>
      ) : null}
    </View>
  );
}
