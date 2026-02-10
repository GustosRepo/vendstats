import React, { useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withDelay,
  withSpring,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

interface SuccessCheckmarkProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: ViewStyle;
  onComplete?: () => void;
  delay?: number;
}

export const SuccessCheckmark: React.FC<SuccessCheckmarkProps> = ({
  size = 80,
  color = colors.success,
  strokeWidth = 4,
  style,
  onComplete,
  delay = 0,
}) => {
  const circleProgress = useSharedValue(0);
  const checkProgress = useSharedValue(0);
  const scale = useSharedValue(0.8);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    // Circle animation
    circleProgress.value = withDelay(
      delay,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
    );

    // Check animation starts after circle
    checkProgress.value = withDelay(
      delay + 400,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }, () => {
        // Haptic feedback when complete
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      })
    );

    // Scale bounce
    scale.value = withDelay(
      delay,
      withSpring(1, { damping: 12, stiffness: 200 })
    );

    // Call onComplete after animation
    if (onComplete) {
      setTimeout(() => onComplete(), delay + 800);
    }
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const circleAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - circleProgress.value),
  }));

  // Checkmark path - relative to center
  const checkPath = `M ${size * 0.28} ${size * 0.5} L ${size * 0.42} ${size * 0.65} L ${size * 0.72} ${size * 0.35}`;
  const checkLength = size * 0.8;

  const checkAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: checkLength * (1 - checkProgress.value),
  }));

  return (
    <Animated.View style={[style, containerStyle]}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          opacity={0.2}
        />
        {/* Animated circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={circleAnimatedProps}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
        {/* Animated checkmark */}
        <AnimatedPath
          d={checkPath}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={checkLength}
          animatedProps={checkAnimatedProps}
        />
      </Svg>
    </Animated.View>
  );
};
