import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, shadows, radius } from '../../theme';

type TrendDirection = 'up' | 'down' | 'neutral';

interface KPIStatCardProps {
  label: string;
  value: string;
  trend?: {
    value: string;
    direction: TrendDirection;
  };
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  size?: 'sm' | 'md' | 'lg';
  compact?: boolean;
}

/**
 * KPIStatCard - Key Performance Indicator display
 * For showing important metrics with optional trend indicators
 */
export const KPIStatCard: React.FC<KPIStatCardProps> = ({
  label,
  value,
  trend,
  icon,
  iconColor = colors.primary,
  size = 'md',
  compact = false,
}) => {
  const getTrendColor = (direction: TrendDirection) => {
    switch (direction) {
      case 'up':
        return colors.success;
      case 'down':
        return colors.danger;
      default:
        return colors.textSecondary;
    }
  };

  const getTrendIcon = (direction: TrendDirection) => {
    switch (direction) {
      case 'up':
        return 'arrow-up';
      case 'down':
        return 'arrow-down';
      default:
        return 'remove';
    }
  };

  const valueStyle = {
    sm: typography.kpiSmall,
    md: typography.kpiMedium,
    lg: typography.kpiLarge,
  };

  if (compact) {
    return (
      <View
        className="bg-white rounded-2xl p-4 flex-1"
        style={{
          borderRadius: radius.xl,
          backgroundColor: colors.surface,
          ...shadows.sm,
        }}
      >
        <View className="flex-row items-center justify-between mb-2">
          <Text
            style={[typography.labelSmall, { color: colors.textSecondary }]}
            className="uppercase tracking-wide"
          >
            {label}
          </Text>
          {icon && (
            <View
              className="w-7 h-7 rounded-full items-center justify-center"
              style={{ backgroundColor: `${iconColor}15` }}
            >
              <Ionicons name={icon} size={14} color={iconColor} />
            </View>
          )}
        </View>
        <Text
          style={[typography.kpiSmall, { color: colors.textPrimary }]}
        >
          {value}
        </Text>
        {trend && (
          <View className="flex-row items-center mt-1">
            <Ionicons
              name={getTrendIcon(trend.direction)}
              size={12}
              color={getTrendColor(trend.direction)}
            />
            <Text
              style={[
                typography.labelSmall,
                { color: getTrendColor(trend.direction), marginLeft: 2 },
              ]}
            >
              {trend.value}
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View
      className="bg-white rounded-3xl p-5"
      style={{
        borderRadius: radius['2xl'],
        backgroundColor: colors.surface,
        ...shadows.md,
      }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <Text
          style={[typography.label, { color: colors.textSecondary }]}
          className="uppercase tracking-wide"
        >
          {label}
        </Text>
        {icon && (
          <View
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: `${iconColor}15` }}
          >
            <Ionicons name={icon} size={20} color={iconColor} />
          </View>
        )}
      </View>
      <Text style={[valueStyle[size], { color: colors.textPrimary }]}>
        {value}
      </Text>
      {trend && (
        <View className="flex-row items-center mt-2">
          <View
            className="flex-row items-center px-2 py-1 rounded-full"
            style={{
              backgroundColor:
                trend.direction === 'up'
                  ? colors.successLight
                  : trend.direction === 'down'
                  ? colors.dangerLight
                  : colors.surfaceSecondary,
            }}
          >
            <Ionicons
              name={getTrendIcon(trend.direction)}
              size={12}
              color={getTrendColor(trend.direction)}
            />
            <Text
              style={[
                typography.labelSmall,
                { color: getTrendColor(trend.direction), marginLeft: 3 },
              ]}
            >
              {trend.value}
            </Text>
          </View>
          <Text
            style={[
              typography.bodySmall,
              { color: colors.textTertiary, marginLeft: 8 },
            ]}
          >
            vs last period
          </Text>
        </View>
      )}
    </View>
  );
};

/**
 * MiniKPIRow - Horizontal row of mini KPIs
 */
interface MiniKPIProps {
  items: Array<{
    label: string;
    value: string;
    color?: string;
  }>;
}

export const MiniKPIRow: React.FC<MiniKPIProps> = ({ items }) => {
  return (
    <View className="flex-row">
      {items.map((item, index) => (
        <View
          key={index}
          className={`flex-1 ${index < items.length - 1 ? 'border-r' : ''}`}
          style={{ borderColor: colors.divider }}
        >
          <View className="items-center py-2">
            <Text
              style={[typography.labelSmall, { color: colors.textTertiary }]}
            >
              {item.label}
            </Text>
            <Text
              style={[
                typography.h4,
                { color: item.color || colors.textPrimary, marginTop: 2 },
              ]}
            >
              {item.value}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};
