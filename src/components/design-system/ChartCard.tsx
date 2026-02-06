import React, { ReactNode, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { colors, typography, shadows, radius } from '../../theme';
import { Card, CardHeader } from './Card';

interface TimeframeOption {
  label: string;
  value: string;
}

interface ChartCardProps {
  title: string;
  children: ReactNode;
  timeframes?: TimeframeOption[];
  defaultTimeframe?: string;
  onTimeframeChange?: (value: string) => void;
  action?: {
    label: string;
    onPress: () => void;
  };
  height?: number;
}

/**
 * ChartCard - Card wrapper for charts
 * Includes title, optional timeframe toggle, and consistent styling
 */
export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  children,
  timeframes,
  defaultTimeframe,
  onTimeframeChange,
  action,
  height = 200,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState(
    defaultTimeframe || (timeframes?.[0]?.value ?? '')
  );

  const handleTimeframeChange = (value: string) => {
    setSelectedTimeframe(value);
    onTimeframeChange?.(value);
  };

  return (
    <View
      className="bg-white rounded-3xl"
      style={{
        borderRadius: radius['2xl'],
        backgroundColor: colors.surface,
        ...shadows.md,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-5 pb-3">
        <Text style={[typography.h4, { color: colors.textPrimary }]}>
          {title}
        </Text>

        {action ? (
          <TouchableOpacity
            onPress={action.onPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[typography.label, { color: colors.primary }]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ) : timeframes && timeframes.length > 0 ? (
          <View
            className="flex-row rounded-full p-0.5"
            style={{ backgroundColor: colors.surfaceSecondary }}
          >
            {timeframes.map((tf) => (
              <TouchableOpacity
                key={tf.value}
                onPress={() => handleTimeframeChange(tf.value)}
                className={`px-3 py-1.5 rounded-full`}
                style={{
                  backgroundColor:
                    selectedTimeframe === tf.value
                      ? colors.surface
                      : 'transparent',
                  ...(selectedTimeframe === tf.value ? shadows.sm : {}),
                }}
              >
                <Text
                  style={[
                    typography.labelSmall,
                    {
                      color:
                        selectedTimeframe === tf.value
                          ? colors.textPrimary
                          : colors.textSecondary,
                    },
                  ]}
                >
                  {tf.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </View>

      {/* Chart Area */}
      <View
        className="px-3 pb-5"
        style={{ height }}
      >
        {children}
      </View>
    </View>
  );
};

/**
 * ChartPlaceholder - Placeholder for chart area
 */
export const ChartPlaceholder: React.FC<{ height?: number }> = ({
  height = 160,
}) => {
  return (
    <View
      className="items-center justify-center rounded-2xl"
      style={{
        height,
        backgroundColor: colors.surfaceSecondary,
      }}
    >
      <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>
        Chart will render here
      </Text>
    </View>
  );
};
