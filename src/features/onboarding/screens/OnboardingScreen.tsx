import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, Rect, Pattern, Line } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, radius } from '../../../theme';
import { MascotImages } from '../../../../assets';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  mascot: ImageSourcePropType;
  highlight?: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Track Every Sale',
    subtitle: 'Log sales in seconds at any pop-up event',
    mascot: MascotImages.tent,
    highlight: '🎯',
  },
  {
    id: '2',
    title: 'Know Your Profit',
    subtitle: 'See exactly what you make after all costs',
    mascot: MascotImages.happyPhone,
    highlight: '💰',
  },
  {
    id: '3',
    title: 'Event Insights',
    subtitle: 'Discover which events make you the most money',
    mascot: MascotImages.lookPhone,
    highlight: '📊',
  },
  {
    id: '4',
    title: 'Add Your Products',
    subtitle: 'Start by adding the items you sell — then create your first event!',
    mascot: MascotImages.winkPhone,
    highlight: '🛍️',
  },
];

// Currency texture pattern
const TextureOverlay: React.FC = () => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      <Defs>
        <Pattern id="onboardingDiagonal" patternUnits="userSpaceOnUse" width="6" height="6">
          <Line x1="0" y1="6" x2="6" y2="0" stroke={colors.textPrimary} strokeWidth="0.5" opacity="0.08" />
        </Pattern>
        <Pattern id="onboardingCross" patternUnits="userSpaceOnUse" width="6" height="6">
          <Line x1="0" y1="0" x2="6" y2="6" stroke={colors.textPrimary} strokeWidth="0.4" opacity="0.04" />
        </Pattern>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#onboardingDiagonal)" />
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#onboardingCross)" />
    </Svg>
  </View>
);

interface OnboardingScreenProps {
  onComplete: () => void;
}

// Animated slide component
const AnimatedSlide: React.FC<{ item: OnboardingSlide; isActive: boolean }> = ({ item, isActive }) => {
  const mascotScale = useSharedValue(0.8);
  const mascotOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(20);
  const emojiScale = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      // Reset values
      mascotScale.value = 0.8;
      mascotOpacity.value = 0;
      titleOpacity.value = 0;
      titleTranslateY.value = 20;
      subtitleOpacity.value = 0;
      subtitleTranslateY.value = 20;
      emojiScale.value = 0;

      // Animate in sequence
      mascotScale.value = withSpring(1, { damping: 12, stiffness: 100 });
      mascotOpacity.value = withTiming(1, { duration: 400 });
      
      titleOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
      titleTranslateY.value = withDelay(200, withSpring(0, { damping: 15 }));
      
      subtitleOpacity.value = withDelay(350, withTiming(1, { duration: 400 }));
      subtitleTranslateY.value = withDelay(350, withSpring(0, { damping: 15 }));
      
      emojiScale.value = withDelay(500, withSequence(
        withSpring(1.3, { damping: 8 }),
        withSpring(1, { damping: 10 })
      ));
    }
  }, [isActive]);

  const mascotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: mascotScale.value }],
    opacity: mascotOpacity.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }));

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emojiScale.value }],
  }));

  return (
    <View style={styles.slide}>
      <View style={styles.content}>
        {/* Emoji badge */}
        <Animated.View style={[styles.emojiBadge, emojiStyle]}>
          <Text style={styles.emojiText}>{item.highlight}</Text>
        </Animated.View>

        {/* Mascot */}
        <Animated.View style={[styles.mascotContainer, mascotStyle]}>
          <Image source={item.mascot} style={styles.mascotImage} resizeMode="contain" />
        </Animated.View>
        
        {/* Title */}
        <Animated.Text style={[styles.title, titleStyle]}>
          {item.title}
        </Animated.Text>
        
        {/* Subtitle */}
        <Animated.Text style={[styles.subtitle, subtitleStyle]}>
          {item.subtitle}
        </Animated.Text>
      </View>
    </View>
  );
};

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  
  // Button animation
  const buttonScale = useSharedValue(1);
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    // Animate progress bar
    progressWidth.value = withTiming(((currentIndex + 1) / slides.length) * 100, { duration: 300 });
  }, [currentIndex]);

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 50 }),
      withSpring(1, { damping: 15 })
    );
    
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onComplete();
  };

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => (
    <AnimatedSlide item={item} isActive={index === currentIndex} />
  );

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <TextureOverlay />
      
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Animated.View style={[styles.progressBar, progressStyle]} />
      </View>
      
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
      />

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.dotActive,
                index < currentIndex && styles.dotCompleted,
              ]}
            />
          ))}
        </View>
        
        {/* Animated Button */}
        <Animated.View style={[{ width: '100%' }, buttonStyle]}>
          <TouchableOpacity 
            style={[
              styles.nextButton,
              currentIndex === slides.length - 1 && styles.finalButton,
            ]} 
            onPress={handleNext}
            activeOpacity={0.9}
          >
            <Text style={styles.nextButtonText}>
              {currentIndex === slides.length - 1 ? "Let's Go! 🚀" : 'Continue'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
        
        {/* Step indicator */}
        <Text style={styles.stepIndicator}>
          {currentIndex + 1} of {slides.length}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressContainer: {
    position: 'absolute',
    top: 50,
    left: 24,
    right: 24,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    zIndex: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.copper,
    borderRadius: 2,
  },
  skipButton: {
    position: 'absolute',
    top: 70,
    right: 24,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(232, 241, 248, 0.85)',
  },
  content: {
    alignItems: 'center',
    paddingBottom: 100,
  },
  emojiBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emojiText: {
    fontSize: 28,
  },
  mascotContainer: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  mascotImage: {
    width: 200,
    height: 200,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '400',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 10,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginHorizontal: 5,
  },
  dotActive: {
    width: 28,
    backgroundColor: colors.copper,
  },
  dotCompleted: {
    backgroundColor: colors.growth,
  },
  nextButton: {
    backgroundColor: colors.growth,
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: radius.full,
    width: '100%',
    alignItems: 'center',
    shadowColor: colors.growth,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  finalButton: {
    backgroundColor: colors.copper,
    shadowColor: colors.copper,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  stepIndicator: {
    marginTop: 16,
    fontSize: 13,
    fontWeight: '500',
    color: colors.textTertiary,
  },
});

export default OnboardingScreen;
