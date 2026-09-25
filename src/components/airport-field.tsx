import { useRef, useState, type Ref } from 'react';
import { Pressable, ScrollView, View, type TextInput } from 'react-native';

import { FieldLabel, Gradient, Input, T, mix, shadow, useColors } from '@/design-system';
import { AIRPORTS, findAirportByInput, formatAirport, type Airport } from '@/data/flights';

/**
 * From / To field with the prototype's airport dropdown: tapping it lists
 * every destination (minus the one picked in the other field), typing
 * filters by city, code or airport name, and choosing a row fills the field.
 */
export function AirportField({
  label,
  value,
  onChange,
  exclude,
  inputRef,
  onPicked,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  /** Airport code to leave out (the other field's pick). */
  exclude?: string;
  inputRef?: Ref<TextInput>;
  onPicked?: () => void;
}) {
  const c = useColors();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState(false);
  // Set when a row is tapped, so the blur tidy-up doesn't override the pick.
  const picked = useRef(false);
  const pressing = useRef(false);
  const q = typed ? value.trim().toLowerCase() : '';
  const current = findAirportByInput(value);
  const items = AIRPORTS.filter(
    (a) => a.code !== exclude && (!q || a.city.toLowerCase().includes(q) || a.code.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)),
  );

  function pick(a: Airport) {
    picked.current = true;
    onChange(formatAirport(a));
    setOpen(false);
    setTyped(false);
    onPicked?.();
  }

  return (
    // Raised while open so the list covers the fields below it.
    <View style={{ gap: 5, zIndex: open ? 30 : 1 }}>
      <FieldLabel>{label}</FieldLabel>
      <Input
        inputRef={inputRef}
        accessibilityLabel={label}
        accessibilityState={{ expanded: open }}
        icon="pin"
        value={value}
        placeholder="City or airport code"
        autoCorrect={false}
        autoCapitalize="words"
        selectTextOnFocus
        onFocus={() => {
          picked.current = false;
          setTyped(false);
          setOpen(true);
        }}
        onChangeText={(v) => {
          onChange(v);
          setTyped(true);
          setOpen(true);
        }}
        onSubmitEditing={() => {
          if (typed && items[0]) pick(items[0]);
        }}
        onBlur={() =>
          // Give a tap on a row time to land before closing.
          setTimeout(() => {
            if (pressing.current) return;
            setOpen(false);
            setTyped(false);
            if (picked.current) return;
            // Tidy a typed city or code into "City (CODE)".
            const a = findAirportByInput(value);
            if (a && formatAirport(a) !== value) onChange(formatAirport(a));
          }, 150)
        }
      />
      {open ? (
        <View
          accessibilityRole="list"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 6,
            maxHeight: 292,
            backgroundColor: c.surface,
            borderWidth: 1,
            borderColor: c.line,
            borderRadius: 14,
            boxShadow: shadow,
            elevation: 12,
            overflow: 'hidden',
          }}>
          <ScrollView keyboardShouldPersistTaps="always" nestedScrollEnabled contentContainerStyle={{ padding: 6 }}>
            {items.length ? (
              <>
                {!q ? (
                  <T size={0.6562} weight={700} upper ls={0.06} color={c.inkFaint} style={{ paddingHorizontal: 10, paddingTop: 6, paddingBottom: 4 }}>
                    All destinations
                  </T>
                ) : null}
                {items.map((a) => {
                  const selected = !typed && current?.code === a.code;
                  return (
                    <Pressable
                      key={a.code}
                      accessibilityRole="button"
                      accessibilityLabel={`${a.city}, ${a.code}, ${a.name}`}
                      accessibilityState={{ selected }}
                      // While a row is held, the field's blur must not close the list.
                      onPressIn={() => (pressing.current = true)}
                      onPressOut={() => (pressing.current = false)}
                      onPress={() => pick(a)}
                      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => ({
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        paddingVertical: 9,
                        paddingHorizontal: 10,
                        borderRadius: 10,
                        backgroundColor: pressed || hovered ? c.surfaceAlt : 'transparent',
                      })}>
                      {selected ? (
                        <Gradient style={{ width: 46, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' }}>
                          <T size={0.75} weight={800} color="#fff" ls={0.04}>
                            {a.code}
                          </T>
                        </Gradient>
                      ) : (
                        <View style={{ width: 46, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: mix(c.primary, 10, c.surface) }}>
                          <T size={0.75} weight={800} color={c.primary} ls={0.04}>
                            {a.code}
                          </T>
                        </View>
                      )}
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <T size={0.875} weight={700}>
                          {a.city}
                        </T>
                        <T size={0.7188} color={c.inkFaint} numberOfLines={1}>
                          {a.name}
                        </T>
                      </View>
                      {selected ? (
                        <T weight={800} color={c.primary}>
                          ✓
                        </T>
                      ) : null}
                    </Pressable>
                  );
                })}
              </>
            ) : (
              <T size={0.8125} color={c.inkFaint} style={{ paddingVertical: 14, paddingHorizontal: 10 }}>
                {`No airports match “${value.trim()}”.`}
              </T>
            )}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}
