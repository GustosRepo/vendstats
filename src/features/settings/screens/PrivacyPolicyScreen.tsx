import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { RootStackScreenProps } from '../../../navigation/types';
import { TexturePattern } from '../../../components/TexturePattern';
import { colors } from '../../../theme';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={{ marginBottom: 24 }}>
    <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 }}>
      {title}
    </Text>
    {children}
  </View>
);

const Paragraph: React.FC<{ children: string }> = ({ children }) => (
  <Text style={{ fontSize: 15, color: colors.textSecondary, lineHeight: 24, marginBottom: 12 }}>
    {children}
  </Text>
);

export const PrivacyPolicyScreen: React.FC<RootStackScreenProps<'PrivacyPolicy'>> = () => {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
      <TexturePattern />
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontSize: 13, color: colors.textTertiary, marginBottom: 24 }}>
          {t('privacy.lastUpdated')}
        </Text>

        <Section title={t('privacy.overviewTitle')}>
          <Paragraph>{t('privacy.overviewBody')}</Paragraph>
        </Section>

        <Section title={t('privacy.collectTitle')}>
          <Paragraph>{t('privacy.collectBody1')}</Paragraph>
          <Paragraph>{t('privacy.collectBody2')}</Paragraph>
        </Section>

        <Section title={t('privacy.useTitle')}>
          <Paragraph>{t('privacy.useBody')}</Paragraph>
        </Section>

        <Section title={t('privacy.securityTitle')}>
          <Paragraph>{t('privacy.securityBody')}</Paragraph>
        </Section>

        <Section title={t('privacy.thirdPartyTitle')}>
          <Paragraph>{t('privacy.thirdPartyBody')}</Paragraph>
        </Section>

        <Section title={t('privacy.deletionTitle')}>
          <Paragraph>{t('privacy.deletionBody')}</Paragraph>
        </Section>

        <Section title={t('privacy.changesTitle')}>
          <Paragraph>{t('privacy.changesBody')}</Paragraph>
        </Section>

        <Section title={t('privacy.contactTitle')}>
          <Paragraph>{t('privacy.contactBody')}</Paragraph>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
};
