import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';

interface AnimatedListItemProps {
  children: React.ReactNode;
  index: number;
  style?: ViewStyle;
  delay?: number;
  duration?: number;
  type?: 'fade' | 'slide' | 'scale' | 'slideUp';
}

export const AnimatedListItem: React.FC<AnimatedListItemProps> = ({
  children,
  index,
  style,
  delay = 100,
  duration = 500,
  type = 'slideUp',
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(type === 'slideUp' ? 40 : 0);
  const translateX = useSharedValue(type === 'slide' ? 30 : 0);
  const scale = useSharedValue(type === 'scale' ? 0.9 : 1);

  useEffect(() => {
    const itemDelay = index * delay;

    opacity.value = withDelay(
      itemDelay,
      withTiming(1, { duration, easing: Easing.out(Easing.cubic) })
    );

    if (type === 'slideUp') {
      translateY.value = withDelay(
        itemDelay,
        withSpring(0, { damping: 20, stiffness: 200 })
      );
    } else if (type === 'slide') {
      translateX.value = withDelay(
        itemDelay,
        withSpring(0, { damping: 20, stiffness: 200 })
      );
    } else if (type === 'scale') {
      scale.value = withDelay(
        itemDelay,
        withSpring(1, { damping: 15, stiffness: 200 })
      );
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
};
