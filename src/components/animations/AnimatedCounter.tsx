import React, { useEffect } from 'react';
import { Text, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  useDerivedValue,
} from 'react-native-reanimated';

const AnimatedText = Animated.createAnimatedComponent(Text);

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  style?: TextStyle;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1200,
  prefix = '',
  suffix = '',
  decimals = 2,
  style,
}) => {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withTiming(value, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, duration]);

  const displayValue = useDerivedValue(() => {
    const formatted = animatedValue.value.toFixed(decimals);
    // Add commas for thousands
    const parts = formatted.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${prefix}${parts.join('.')}${suffix}`;
  });

  const animatedProps = useAnimatedProps(() => {
    return {
      text: displayValue.value,
    } as any;
  });

  return (
    <AnimatedText
      style={style}
      animatedProps={animatedProps}
    >
      {`${prefix}${value.toFixed(decimals)}${suffix}`}
    </AnimatedText>
  );
};
