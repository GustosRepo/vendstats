import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
      <TexturePattern />
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontSize: 13, color: colors.textTertiary, marginBottom: 24 }}>
          Last updated: February 10, 2026
        </Text>

        <Section title="Overview">
          <Paragraph>
            VendStats ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.
          </Paragraph>
        </Section>

        <Section title="Information We Collect">
          <Paragraph>
            VendStats stores all your data locally on your device. We do not collect, transmit, or store any of your personal information on external servers.
          </Paragraph>
          <Paragraph>
            The data you enter in the app, including events, sales, products, and settings, is stored only on your device using secure local storage.
          </Paragraph>
        </Section>

        <Section title="How We Use Your Information">
          <Paragraph>
            All data processing happens locally on your device. We use your data solely to provide the app's functionality, including tracking sales, calculating profits, and managing inventory.
          </Paragraph>
        </Section>

        <Section title="Data Security">
          <Paragraph>
            Your data is stored securely on your device. We recommend keeping your device protected with a passcode or biometric authentication to ensure your business data remains private.
          </Paragraph>
        </Section>

        <Section title="Third-Party Services">
          <Paragraph>
            If you choose to subscribe to VendStats Premium, payment processing is handled securely through Apple's App Store. We do not have access to your payment details.
          </Paragraph>
        </Section>

        <Section title="Data Deletion">
          <Paragraph>
            You can delete all your data at any time through the Settings screen. Uninstalling the app will also remove all stored data from your device.
          </Paragraph>
        </Section>

        <Section title="Changes to This Policy">
          <Paragraph>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy within the app.
          </Paragraph>
        </Section>

        <Section title="Contact Us">
          <Paragraph>
            If you have any questions about this Privacy Policy, please contact us at admin@code-wrx.com
          </Paragraph>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
};
