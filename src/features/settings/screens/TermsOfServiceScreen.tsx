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

export const TermsOfServiceScreen: React.FC<RootStackScreenProps<'TermsOfService'>> = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
      <TexturePattern />
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontSize: 13, color: colors.textTertiary, marginBottom: 24 }}>
          Last updated: February 17, 2026
        </Text>

        <Section title="Acceptance of Terms">
          <Paragraph>
            By downloading, installing, or using VendStats, you agree to the applicable Apple terms for apps distributed through the App Store, including Apple&apos;s Standard End User License Agreement.
          </Paragraph>
        </Section>

        <Section title="License Agreement">
          <Paragraph>
            VendStats is licensed to you under Apple&apos;s Standard End User License Agreement (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
          </Paragraph>
          <Paragraph>
            In case of any conflict between these informational terms and Apple&apos;s Standard EULA, Apple&apos;s Standard EULA controls.
          </Paragraph>
        </Section>

        <Section title="Description of Service">
          <Paragraph>
            VendStats is a mobile application designed to help vendors and small business owners track sales, manage inventory, and analyze profits at pop-up markets, craft fairs, and similar events.
          </Paragraph>
        </Section>

        <Section title="User Responsibilities">
          <Paragraph>
            You are responsible for maintaining the accuracy of the data you enter into the app. VendStats is a tool to assist with record-keeping and should not be used as your sole financial or tax documentation.
          </Paragraph>
          <Paragraph>
            You are responsible for backing up your data. While we strive to provide reliable local storage, we are not responsible for any data loss.
          </Paragraph>
        </Section>

        <Section title="Subscription Services">
          <Paragraph>
            VendStats offers optional premium features through a subscription. Subscriptions are billed through the Apple App Store and are subject to Apple&apos;s terms and conditions.
          </Paragraph>
          <Paragraph>
            You may cancel your subscription at any time through your device&apos;s subscription settings. Refunds are handled according to Apple&apos;s refund policy.
          </Paragraph>
        </Section>

        <Section title="Intellectual Property">
          <Paragraph>
            VendStats and all associated branding, designs, and content are the property of VendStats and are protected by intellectual property laws. You may not copy, modify, or distribute any part of the app without permission.
          </Paragraph>
        </Section>

        <Section title="Limitation of Liability">
          <Paragraph>
            VendStats is provided "as is" without warranties of any kind. We are not liable for any financial decisions made based on data in the app, or for any indirect, incidental, or consequential damages.
          </Paragraph>
          <Paragraph>
            The app is intended for informational purposes and should not replace professional financial or accounting advice.
          </Paragraph>
        </Section>

        <Section title="Termination">
          <Paragraph>
            We reserve the right to terminate or suspend access to the app at any time, without notice, for conduct that we believe violates these terms or is harmful to other users or us.
          </Paragraph>
        </Section>

        <Section title="Changes to Terms">
          <Paragraph>
            We may modify these Terms of Service at any time. Continued use of the app after changes constitutes acceptance of the new terms.
          </Paragraph>
        </Section>

        <Section title="Contact Us">
          <Paragraph>
            If you have any questions about these Terms of Service, please contact us at admin@code-wrx.com
          </Paragraph>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
};
