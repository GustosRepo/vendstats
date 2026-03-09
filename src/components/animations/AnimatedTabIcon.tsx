import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';

interface AnimatedTabIconProps {
  name: keyof typeof Ionicons.glyphMap;
  size: number;
  color: string;
  focused: boolean;
  badge?: number;
}

export const AnimatedTabIcon: React.FC<AnimatedTabIconProps> = ({
  name,
  size,
  color,
  focused,
  badge,
}) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (focused) {
      // Bounce animation when tab becomes focused
      scale.value = withSequence(
        withSpring(1.35, { damping: 8, stiffness: 350 }),
        withSpring(0.9, { damping: 8, stiffness: 350 }),
        withSpring(1.1, { damping: 10, stiffness: 300 }),
        withSpring(1, { damping: 12, stiffness: 300 })
      );
      // Wiggle for settings icon
      if (name.includes('settings')) {
        rotation.value = withSequence(
          withSpring(20, { damping: 4, stiffness: 400 }),
          withSpring(-15, { damping: 4, stiffness: 400 }),
          withSpring(10, { damping: 6, stiffness: 400 }),
          withSpring(-5, { damping: 8, stiffness: 400 }),
          withSpring(0, { damping: 10, stiffness: 300 })
        );
      }
    }
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name={name} size={size} color={color} />
      {badge !== undefined && badge > 0 && (
        <View style={{
          position: 'absolute',
          top: -6,
          right: -10,
          backgroundColor: '#EF4444',
          borderRadius: 9,
          minWidth: 18,
          height: 18,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 4,
        }}>
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>
            {badge > 99 ? '99+' : badge}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};
