import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
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
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, radius } from '../../../theme';
import { MascotImages } from '../../../../assets';
import { changeLanguage, LANGUAGES, SupportedLanguage } from '../../../i18n';
import { setLanguage, setVendorCategory } from '../../../storage/settings';
import { VendorCategory } from '../../../types';

const { width, height } = Dimensions.get('window');

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

type OnboardingStep = 'language' | 'hero' | 'category' | 'ready';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const CATEGORIES: { key: VendorCategory; emoji: string }[] = [
  { key: 'food', emoji: '🍕' },
  { key: 'crafts', emoji: '🎨' },
  { key: 'clothing', emoji: '👕' },
  { key: 'jewelry', emoji: '💍' },
  { key: 'other', emoji: '📦' },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState<OnboardingStep>('language');
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(i18n.language as SupportedLanguage);
  const [selectedCategory, setSelectedCategory] = useState<VendorCategory | null>(null);

  // Progress bar: 4 steps
  const stepIndex = { language: 0, hero: 1, category: 2, ready: 3 };
  const progressWidth = useSharedValue(25);

  useEffect(() => {
    const pct = ((stepIndex[step] + 1) / 4) * 100;
    progressWidth.value = withTiming(pct, { duration: 350 });
  }, [step]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  // — Handlers —
  const handleSelectLanguage = async (lang: SupportedLanguage) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedLang(lang);
    setLanguage(lang);
    await changeLanguage(lang);
  };

  const handleContinueFromLang = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep('hero');
  };

  const handleContinueFromHero = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep('category');
  };

  const handleSelectCategory = (cat: VendorCategory) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(cat);
  };

  const handleContinueFromCategory = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (selectedCategory) {
      setVendorCategory(selectedCategory);
    }
    setStep('ready');
  };

  const handleSkipCategory = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep('ready');
  };

  const handleFinish = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onComplete();
  };

  // ===================== STEP 1: Language =====================
  const renderLanguage = () => {
    const langFlags: Record<string, string> = { en: '🇺🇸', th: '🇹🇭', es: '🇲🇽' };
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
        <View style={{
          width: 80, height: 80, borderRadius: 40,
          backgroundColor: colors.primaryLight,
          alignItems: 'center', justifyContent: 'center',
          marginBottom: 28,
        }}>
          <Ionicons name="language" size={40} color={colors.primary} />
        </View>

        <Text style={{ fontSize: 28, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.5, marginBottom: 8, textAlign: 'center' }}>
          Choose Your Language
        </Text>
        <Text style={{ fontSize: 15, color: colors.textSecondary, textAlign: 'center', marginBottom: 32, lineHeight: 22 }}>
          Elige tu idioma · เลือกภาษาของคุณ
        </Text>

        <View style={{ width: '100%', gap: 12, marginBottom: 40 }}>
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLang === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                onPress={() => handleSelectLanguage(lang.code)}
                activeOpacity={0.8}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                  borderRadius: radius.xl,
                  paddingVertical: 18,
                  paddingHorizontal: 20,
                  borderWidth: 2,
                  borderColor: isSelected ? colors.primary : colors.divider,
                }}
              >
                <Text style={{ fontSize: 28, marginRight: 16 }}>{langFlags[lang.code] || '🌐'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: '600', color: isSelected ? '#fff' : colors.textPrimary }}>
                    {lang.nativeLabel}
                  </Text>
                  <Text style={{ fontSize: 13, color: isSelected ? 'rgba(255,255,255,0.7)' : colors.textSecondary, marginTop: 2 }}>
                    {lang.label}
                  </Text>
                </View>
                {isSelected && <Ionicons name="checkmark-circle" size={24} color="#fff" />}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          onPress={handleContinueFromLang}
          activeOpacity={0.9}
          style={{
            width: '100%',
            backgroundColor: colors.primary,
            borderRadius: radius.full,
            paddingVertical: 18,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff' }}>
            {t('common.continue')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ===================== STEP 2: Hero =====================
  const renderHero = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
      {/* Mascot */}
      <Animated.View entering={FadeIn.duration(400).springify()}>
        <Image
          source={MascotImages.tent}
          style={{ width: 220, height: 220, marginBottom: 24 }}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Title */}
      <Animated.Text
        entering={FadeInDown.delay(200).duration(400).springify()}
        style={{ fontSize: 32, fontWeight: '800', color: colors.textPrimary, textAlign: 'center', marginBottom: 14, letterSpacing: -0.5 }}
      >
        {t('onboarding.heroTitle')}
      </Animated.Text>

      {/* Subtitle */}
      <Animated.Text
        entering={FadeInDown.delay(350).duration(400).springify()}
        style={{ fontSize: 17, color: colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: 40, paddingHorizontal: 8 }}
      >
        {t('onboarding.heroSubtitle')}
      </Animated.Text>

      {/* Feature pills */}
      <Animated.View
        entering={FadeInUp.delay(500).duration(400).springify()}
        style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 48 }}
      >
        {[
          { emoji: '⚡', label: t('onboarding.pillQuickSales') },
          { emoji: '📊', label: t('onboarding.pillProfitTracking') },
          { emoji: '🎪', label: t('onboarding.pillEventInsights') },
        ].map((pill, i) => (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.surface,
              borderRadius: radius.full,
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderWidth: 1,
              borderColor: colors.divider,
            }}
          >
            <Text style={{ fontSize: 16, marginRight: 6 }}>{pill.emoji}</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>{pill.label}</Text>
          </View>
        ))}
      </Animated.View>

      <TouchableOpacity
        onPress={handleContinueFromHero}
        activeOpacity={0.9}
        style={{
          width: '100%',
          backgroundColor: colors.growth,
          borderRadius: radius.full,
          paddingVertical: 18,
          alignItems: 'center',
          shadowColor: colors.growth,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff' }}>
          {t('common.continue')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // ===================== STEP 3: Category =====================
  const renderCategory = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
      <Animated.View entering={FadeIn.duration(300)}>
        <Image
          source={MascotImages.happyPhone}
          style={{ width: 140, height: 140, marginBottom: 20 }}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.Text
        entering={FadeInDown.delay(150).duration(400).springify()}
        style={{ fontSize: 26, fontWeight: '700', color: colors.textPrimary, textAlign: 'center', marginBottom: 8, letterSpacing: -0.3 }}
      >
        {t('onboarding.categoryTitle')}
      </Animated.Text>
      <Animated.Text
        entering={FadeInDown.delay(250).duration(400).springify()}
        style={{ fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 28 }}
      >
        {t('onboarding.categorySubtitle')}
      </Animated.Text>

      {/* Category grid */}
      <Animated.View
        entering={FadeInUp.delay(350).duration(400).springify()}
        style={{ width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 36 }}
      >
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              onPress={() => handleSelectCategory(cat.key)}
              activeOpacity={0.8}
              style={{
                width: (width - 64 - 24) / 3,   // 3 per row
                aspectRatio: 1,
                backgroundColor: isSelected ? colors.primary : colors.surface,
                borderRadius: radius.xl,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: isSelected ? colors.primary : colors.divider,
              }}
            >
              <Text style={{ fontSize: 32, marginBottom: 6 }}>{cat.emoji}</Text>
              <Text style={{
                fontSize: 13,
                fontWeight: '600',
                color: isSelected ? '#fff' : colors.textPrimary,
              }}>
                {t(`onboarding.cat_${cat.key}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </Animated.View>

      {/* Continue (enabled even without selection) */}
      <TouchableOpacity
        onPress={handleContinueFromCategory}
        activeOpacity={0.9}
        style={{
          width: '100%',
          backgroundColor: colors.growth,
          borderRadius: radius.full,
          paddingVertical: 18,
          alignItems: 'center',
          shadowColor: colors.growth,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff' }}>
          {t('common.continue')}
        </Text>
      </TouchableOpacity>

      {/* Skip link */}
      <TouchableOpacity onPress={handleSkipCategory} style={{ marginTop: 16 }}>
        <Text style={{ fontSize: 15, fontWeight: '500', color: colors.textSecondary }}>
          {t('common.skip')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // ===================== STEP 4: Ready / Celebration =====================
  const renderReady = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
      {/* Confetti badge */}
      <Animated.View
        entering={FadeIn.delay(100).springify()}
        style={{
          width: 72, height: 72, borderRadius: 36,
          backgroundColor: colors.copperLight,
          alignItems: 'center', justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 36 }}>🎉</Text>
      </Animated.View>

      <Animated.View entering={FadeIn.duration(400)}>
        <Image
          source={MascotImages.celebrate}
          style={{ width: 200, height: 200, marginBottom: 20 }}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.Text
        entering={FadeInDown.delay(200).duration(400).springify()}
        style={{ fontSize: 30, fontWeight: '800', color: colors.textPrimary, textAlign: 'center', marginBottom: 10, letterSpacing: -0.5 }}
      >
        {t('onboarding.readyTitle')}
      </Animated.Text>

      <Animated.Text
        entering={FadeInDown.delay(350).duration(400).springify()}
        style={{ fontSize: 16, color: colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: 40, paddingHorizontal: 4 }}
      >
        {t('onboarding.readySubtitle')}
      </Animated.Text>

      {/* Primary CTA */}
      <Animated.View entering={FadeInUp.delay(500).duration(400).springify()} style={{ width: '100%' }}>
        <TouchableOpacity
          onPress={handleFinish}
          activeOpacity={0.9}
          style={{
            width: '100%',
            backgroundColor: colors.copper,
            borderRadius: radius.full,
            paddingVertical: 18,
            alignItems: 'center',
            shadowColor: colors.copper,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff' }}>
            {t('onboarding.addMyItems')} 🛍️
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );

  // ===================== RENDER =====================
  const renderStep = () => {
    switch (step) {
      case 'language': return renderLanguage();
      case 'hero': return renderHero();
      case 'category': return renderCategory();
      case 'ready': return renderReady();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextureOverlay />

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <Animated.View style={[styles.progressBar, progressStyle]} />
      </View>

      {renderStep()}
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
});

export default OnboardingScreen;
