import { Fragment } from 'react';
import { Pressable, View } from 'react-native';

import { Badge, Button, RouteDots, T, shadow, useColors } from '@/design-system';
import { AIRLINE, airport, fmtDate, fmtTime } from '@/data/flights';
import type { Trip } from '@/state/store';

import { AirlineMark } from './flight-card';

/**
 * A booked trip. `trips` shows tags plus Rebook / Cancel; `checkin` shows
 * full airport names and the Check-In / boarding pass button.
 */
export function TripCard({
  trip: t,
  variant,
  onOpen,
  onRebook,
  onCancel,
  onCheckIn,
}: {
  trip: Trip;
  variant: 'trips' | 'checkin';
  onOpen?: () => void;
  onRebook?: () => void;
  onCancel?: () => void;
  onCheckIn?: () => void;
}) {
  const c = useColors();
  const tags: string[] = [];
  if (t.tripType === 'round') tags.push('Round trip');
  if (t.fareTier !== 'basic') tags.push('Free baggage');
  if (t.fareTier === 'flex') tags.push('Flexible changes');

  const info = (
    <>
      {variant === 'trips' ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
          <AirlineMark size={20} />
          <T size={0.7812} weight={700} color={c.inkSoft}>
            {AIRLINE.name}
          </T>
        </View>
      ) : null}
      {t.cancelled ? (
        <View style={{ marginBottom: 8 }}>
          <Badge label="Cancelled" tone="bad" />
        </View>
      ) : null}
      {t.legs.map((lg, i) => (
        <Fragment key={i}>
          {i > 0 ? <View style={{ height: 1, backgroundColor: c.line, marginVertical: 12 }} /> : null}
          {lg.label ? (
            <T size={0.6562} weight={700} upper ls={0.03} color={c.primary} style={{ marginTop: 10 }}>
              {lg.label}
            </T>
          ) : null}
          <T size={0.625} color={c.inkFaint} style={{ marginBottom: 6 }}>
            {'Booked ' + fmtDate(t.bookedAt) + ' · ' + fmtTime(t.bookedAt)}
          </T>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <T size={1.1875} weight={800}>
              {lg.origin}
            </T>
            <T size={1.1875} weight={800}>
              {lg.destination}
            </T>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 1 }}>
            <T size={0.6875} color={c.inkFaint} style={{ flexShrink: 1 }}>
              {variant === 'checkin' ? airport(lg.origin).name : lg.originCity}
            </T>
            <T size={0.6875} color={c.inkFaint} align="right" style={{ flexShrink: 1 }}>
              {variant === 'checkin' ? airport(lg.destination).name : lg.destCity}
            </T>
          </View>
          <RouteDots style={{ marginTop: 8 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <T size={0.7188} color={c.inkFaint}>
              {fmtDate(lg.dep)}
            </T>
            <T size={0.7188} color={c.inkFaint}>
              {fmtDate(lg.arr)}
            </T>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
            <T size={0.875} weight={700}>
              {fmtTime(lg.dep)}
            </T>
            <T size={0.875} weight={700}>
              {fmtTime(lg.arr)}
            </T>
          </View>
        </Fragment>
      ))}

      {variant === 'trips' ? (
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
            {tags.map((x) => (
              <View key={x} style={{ paddingVertical: 5, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1, borderColor: c.line }}>
                <T size={0.6562} weight={600} color={c.inkSoft}>
                  {x}
                </T>
              </View>
            ))}
        </View>
      ) : null}
    </>
  );

  // The details open the booking; the buttons sit outside that tap area.
  return (
    <View
      style={{
        backgroundColor: c.surface,
        borderWidth: 1,
        borderColor: c.line,
        borderRadius: 16,
        padding: 14,
        boxShadow: shadow,
        marginBottom: 12,
        opacity: t.cancelled ? 0.62 : 1,
      }}>
      {onOpen ? (
        <Pressable accessibilityRole="button" accessibilityLabel={'Open booking ' + t.pnr} onPress={onOpen}>
          {info}
        </Pressable>
      ) : (
        info
      )}
      {variant === 'trips' ? (
        <>
          {t.cancelled ? (
            <Button block kind="tint" icon="refresh" label="Rebook this trip" onPress={onRebook} style={{ marginTop: 10 }} />
          ) : (
            <View style={{ gap: 8, marginTop: 10 }}>
              <Button block kind="tint" icon="refresh" label="Rebook" onPress={onRebook} />
              <Button block kind="danger" icon="cancel" label="Cancel trip" onPress={onCancel} />
            </View>
          )}
        </>
      ) : (
        <>
          {t.checkedIn ? (
            <View style={{ marginTop: 10 }}>
              <Badge label="Checked in" tone="good" />
            </View>
          ) : null}
          <Button block label={t.checkedIn ? 'View boarding pass' : 'Check-In'} onPress={onCheckIn} style={{ marginTop: 12 }} />
        </>
      )}
    </View>
  );
}
