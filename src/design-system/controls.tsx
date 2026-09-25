import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';

import { T, useInputStyle } from './components';
import { useColors, useLayout } from './theme';

/*
 * Native versions of the form controls (the web versions in
 * controls.web.tsx render the browser's own controls).
 */

function toDate(iso: string) {
  return new Date(iso + 'T00:00:00');
}

function toIso(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function DateInput({ value, min, onChange }: { value: string; min?: string; onChange: (iso: string) => void }) {
  const [open, setOpen] = useState(false);
  const style = useInputStyle(false, open);
  const [y, m, d] = value.split('-');
  return (
    <>
      <Pressable accessibilityRole="button" onPress={() => setOpen(true)}>
        <T style={style}>{value ? `${m}/${d}/${y}` : 'mm/dd/yyyy'}</T>
      </Pressable>
      {open ? (
        <DateTimePicker
          mode="date"
          value={value ? toDate(value) : new Date()}
          minimumDate={min ? toDate(min) : undefined}
          onChange={(_, picked) => {
            setOpen(false);
            if (picked) onChange(toIso(picked));
          }}
        />
      ) : null}
    </>
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
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={() => setOpen(true)}
        style={{
          paddingVertical: 11,
          paddingLeft: 14,
          paddingRight: 32,
          borderRadius: 11,
          backgroundColor: c.surfaceAlt,
          borderWidth: 1,
          borderColor: c.line,
          justifyContent: 'center',
        }}>
        <T size={0.8125} weight={700}>
          {current?.label ?? ''}
        </T>
        <View
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
      </Pressable>
      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          onPress={() => setOpen(false)}
          style={{ flex: 1, backgroundColor: 'rgba(20,10,40,0.55)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: c.surface, borderRadius: 18, padding: 8 }}>
            {options.map((o) => (
              <Pressable
                key={o.value}
                onPress={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                style={{ paddingVertical: 14, paddingHorizontal: 14 }}>
                <T size={0.875} weight={o.value === value ? 700 : 400} color={o.value === value ? c.primary : c.ink} style={{ fontSize: rem(0.875) }}>
                  {o.label}
                </T>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
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
    <Slider
      accessibilityLabel={label}
      minimumValue={min}
      maximumValue={max}
      step={10}
      value={value}
      onValueChange={onChange}
      minimumTrackTintColor={c.primary}
      thumbTintColor={c.primary}
    />
  );
}
