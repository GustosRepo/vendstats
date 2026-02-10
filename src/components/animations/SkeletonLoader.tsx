import React, { useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../../theme';

interface SkeletonLoaderProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width,
  height,
  borderRadius = 8,
  style,
}) => {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.6, 0.3]);
    return { opacity };
  });

  return (
    <View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.divider,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors.textTertiary,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

// Card skeleton for loading states
export const CardSkeleton: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View
    style={[
      {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 20,
        gap: 12,
      },
      style,
    ]}
  >
    <SkeletonLoader width={100} height={14} borderRadius={4} />
    <SkeletonLoader width="60%" height={32} borderRadius={6} />
    <SkeletonLoader width="40%" height={14} borderRadius={4} />
  </View>
);

// List item skeleton
export const ListItemSkeleton: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View
    style={[
      {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
      },
      style,
    ]}
  >
    <SkeletonLoader width={48} height={48} borderRadius={24} />
    <View style={{ flex: 1, gap: 8 }}>
      <SkeletonLoader width="70%" height={16} borderRadius={4} />
      <SkeletonLoader width="40%" height={12} borderRadius={4} />
    </View>
    <SkeletonLoader width={60} height={20} borderRadius={4} />
  </View>
);
