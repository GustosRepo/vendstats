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

export const TermsOfServiceScreen: React.FC<RootStackScreenProps<'TermsOfService'>> = () => {
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
          {t('tos.lastUpdated')}
        </Text>

        <Section title={t('tos.acceptanceTitle')}>
          <Paragraph>{t('tos.acceptanceBody')}</Paragraph>
        </Section>

        <Section title={t('tos.licenseTitle')}>
          <Paragraph>{t('tos.licenseBody1')}</Paragraph>
          <Paragraph>{t('tos.licenseBody2')}</Paragraph>
        </Section>

        <Section title={t('tos.serviceTitle')}>
          <Paragraph>{t('tos.serviceBody')}</Paragraph>
        </Section>

        <Section title={t('tos.responsibilitiesTitle')}>
          <Paragraph>{t('tos.responsibilitiesBody1')}</Paragraph>
          <Paragraph>{t('tos.responsibilitiesBody2')}</Paragraph>
        </Section>

        <Section title={t('tos.subscriptionTitle')}>
          <Paragraph>{t('tos.subscriptionBody1')}</Paragraph>
          <Paragraph>{t('tos.subscriptionBody2')}</Paragraph>
        </Section>

        <Section title={t('tos.ipTitle')}>
          <Paragraph>{t('tos.ipBody')}</Paragraph>
        </Section>

        <Section title={t('tos.liabilityTitle')}>
          <Paragraph>{t('tos.liabilityBody1')}</Paragraph>
          <Paragraph>{t('tos.liabilityBody2')}</Paragraph>
        </Section>

        <Section title={t('tos.terminationTitle')}>
          <Paragraph>{t('tos.terminationBody')}</Paragraph>
        </Section>

        <Section title={t('tos.changesTitle')}>
          <Paragraph>{t('tos.changesBody')}</Paragraph>
        </Section>

        <Section title={t('tos.contactTitle')}>
          <Paragraph>{t('tos.contactBody')}</Paragraph>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
};
