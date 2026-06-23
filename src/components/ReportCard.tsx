import React from 'react';
import { View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows, radius } from '../theme';
import { MascotImages } from '../../assets';

export interface ReportMetric {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
  borderRight?: boolean;
}

export interface ReportCard {
  headerContent?: React.ReactNode;
  heroLabel: string;
  heroValue: string;
  heroPositive?: boolean;
  summaryMetrics: { label: string; value: string; borderRight?: boolean }[];
  additionalMetrics?: ReportMetric[];
  footerContent?: React.ReactNode;
  showBranding?: boolean;
}

export const ReportCard: React.FC<ReportCard> = ({
  headerContent,
  heroLabel,
  heroValue,
  heroPositive,
  summaryMetrics,
  additionalMetrics,
  footerContent,
  showBranding = true,
}) => (
  <View
    style={[
      {
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        overflow: 'hidden',
      },
      shadows.md,
    ]}
  >
    {/* Header Band */}
    {headerContent && (
      <View style={{ backgroundColor: colors.primary, paddingVertical: 18, paddingHorizontal: 20 }}>
        {headerContent}
      </View>
    )}

    {/* Hero Metric Section */}
    <View
      style={{
        paddingVertical: 22,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
      }}
    >
      <Text
        style={{
          fontSize: 11,
          fontWeight: '600',
          color: colors.textTertiary,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        {heroLabel}
      </Text>
      <Text
        style={{
          fontSize: 42,
          fontWeight: '800',
          color: heroPositive !== undefined ? (heroPositive ? colors.growth : colors.danger) : colors.textPrimary,
          letterSpacing: -1,
        }}
      >
        {heroValue}
      </Text>
    </View>

    {/* Summary Metrics Row */}
    <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.divider }}>
      {summaryMetrics.map((metric, idx) => (
        <View
          key={`${metric.label}-${idx}`}
          style={{
            flex: 1,
            paddingVertical: 16,
            alignItems: 'center',
            borderRightWidth: metric.borderRight ? 1 : 0,
            borderRightColor: colors.divider,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: '600',
              color: colors.textTertiary,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            {metric.label}
          </Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>
            {metric.value}
          </Text>
        </View>
      ))}
    </View>

    {/* Additional Metrics (optional) */}
    {additionalMetrics && additionalMetrics.length > 0 && (
      <View
        style={{
          flexDirection: 'row',
          borderBottomWidth: footerContent || showBranding ? 1 : 0,
          borderBottomColor: colors.divider,
        }}
      >
        {additionalMetrics.map((metric, idx) => (
          <View
            key={`${metric.label}-${idx}`}
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 8,
              alignItems: 'center',
              borderRightWidth: metric.borderRight ? 1 : 0,
              borderRightColor: colors.divider,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: '600',
                color: colors.textTertiary,
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                marginBottom: 3,
              }}
            >
              {metric.label}
            </Text>
            <Text
              style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary, maxWidth: '100%' }}
              numberOfLines={1}
            >
              {metric.value}
            </Text>
          </View>
        ))}
      </View>
    )}

    {/* Custom Footer Content */}
    {footerContent && (
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 12,
          backgroundColor: colors.primary + '08',
          borderBottomWidth: showBranding ? 1 : 0,
          borderBottomColor: colors.divider,
        }}
      >
        {footerContent}
      </View>
    )}

    {/* Branding Footer */}
    {showBranding && (
      <View
        style={{
          paddingVertical: 10,
          paddingHorizontal: 16,
          backgroundColor: colors.primary + '08',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Image
          source={MascotImages.smile}
          style={{ width: 18, height: 18, marginRight: 6 }}
          resizeMode="contain"
        />
        <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: '500' }}>
          Tracked with{' '}
          <Text style={{ color: colors.primary, fontWeight: '700' }}>
            VendStats
          </Text>
        </Text>
      </View>
    )}
  </View>
);
