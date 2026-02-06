import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../../../navigation/types';
import { Card, PrimaryButton } from '../../../components';
import { TexturePattern } from '../../../components/TexturePattern';
import { startFreeTrial, activateSubscription } from '../../../storage';
import { colors } from '../../../theme';
// import Purchases from 'react-native-purchases';

export const PaywallScreen: React.FC<RootStackScreenProps<'Paywall'>> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

  const plans = {
    monthly: {
      price: '$4.99',
      period: 'month',
      savings: null,
    },
    yearly: {
      price: '$29.99',
      period: 'year',
      savings: 'Save 50%',
    },
  };

  const handleStartTrial = async () => {
    setLoading(true);
    
    try {
      // In production, this would initiate RevenueCat purchase
      // const offerings = await Purchases.getOfferings();
      // const package = offerings.current?.availablePackages[0];
      // await Purchases.purchasePackage(package);
      
      // For now, just start the local trial
      startFreeTrial();
      navigation.goBack();
    } catch (error) {
      console.error('Purchase error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    setLoading(true);
    
    try {
      // In production:
      // const customerInfo = await Purchases.restorePurchases();
      // if (customerInfo.entitlements.active['premium']) {
      //   activateSubscription();
      //   navigation.goBack();
      // }
      
      // For demo:
      activateSubscription();
      navigation.goBack();
    } catch (error) {
      console.error('Restore error:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: '📊', title: 'Unlimited Events', description: 'Track as many events as you want' },
    { icon: '📈', title: 'Advanced Stats', description: 'Deep insights into your performance' },
    { icon: '📄', title: 'CSV Export', description: 'Export data for accounting' },
    { icon: '☁️', title: 'Future Updates', description: 'Access to all new features' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <TexturePattern />
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Close Button */}
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="absolute top-4 right-4 z-10 w-8 h-8 items-center justify-center"
        >
          <Text className="text-2xl text-neutral-400">×</Text>
        </TouchableOpacity>

        {/* Header */}
        <View className="items-center pt-12 pb-8 px-6">
          <Text className="text-5xl mb-4">✨</Text>
          <Text className="text-3xl font-bold text-neutral-900 text-center mb-2">
            Unlock VendStats Pro
          </Text>
          <Text className="text-base text-neutral-500 text-center">
            Get the most out of your pop-up business
          </Text>
        </View>

        {/* Features List */}
        <View className="px-6 mb-8">
          {features.map((feature, index) => (
            <View 
              key={index}
              className="flex-row items-center py-4 border-b border-neutral-100"
            >
              <Text className="text-2xl mr-4">{feature.icon}</Text>
              <View className="flex-1">
                <Text className="text-base font-semibold text-neutral-900">
                  {feature.title}
                </Text>
                <Text className="text-sm text-neutral-500">
                  {feature.description}
                </Text>
              </View>
              <Text className="text-green-500 text-xl">✓</Text>
            </View>
          ))}
        </View>

        {/* Plan Selection */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-neutral-900 mb-4 text-center">
            Choose Your Plan
          </Text>

          {/* Yearly Plan */}
          <TouchableOpacity
            onPress={() => setSelectedPlan('yearly')}
            className={`
              border-2 rounded-xl p-4 mb-3
              ${selectedPlan === 'yearly' ? 'border-blue-500 bg-blue-50' : 'border-neutral-200'}
            `}
          >
            <View className="flex-row justify-between items-center">
              <View>
                <View className="flex-row items-center">
                  <Text className="text-lg font-semibold text-neutral-900">
                    Yearly
                  </Text>
                  {plans.yearly.savings && (
                    <View className="bg-green-500 px-2 py-0.5 rounded ml-2">
                      <Text className="text-xs text-white font-medium">
                        {plans.yearly.savings}
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-sm text-neutral-500">
                  {plans.yearly.price} / {plans.yearly.period}
                </Text>
              </View>
              <View className={`
                w-6 h-6 rounded-full border-2
                ${selectedPlan === 'yearly' ? 'border-blue-500 bg-blue-500' : 'border-neutral-300'}
                items-center justify-center
              `}>
                {selectedPlan === 'yearly' && (
                  <Text className="text-white text-xs">✓</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>

          {/* Monthly Plan */}
          <TouchableOpacity
            onPress={() => setSelectedPlan('monthly')}
            className={`
              border-2 rounded-xl p-4
              ${selectedPlan === 'monthly' ? 'border-blue-500 bg-blue-50' : 'border-neutral-200'}
            `}
          >
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-lg font-semibold text-neutral-900">
                  Monthly
                </Text>
                <Text className="text-sm text-neutral-500">
                  {plans.monthly.price} / {plans.monthly.period}
                </Text>
              </View>
              <View className={`
                w-6 h-6 rounded-full border-2
                ${selectedPlan === 'monthly' ? 'border-blue-500 bg-blue-500' : 'border-neutral-300'}
                items-center justify-center
              `}>
                {selectedPlan === 'monthly' && (
                  <Text className="text-white text-xs">✓</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Trial Info */}
        <View className="px-6 mb-6">
          <Card variant="outlined" padding="md">
            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">🎁</Text>
              <View className="flex-1">
                <Text className="text-base font-semibold text-neutral-900">
                  7-Day Free Trial
                </Text>
                <Text className="text-sm text-neutral-500">
                  Try all features free. Cancel anytime.
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* CTA Button */}
        <View className="px-6 mb-4">
          <PrimaryButton
            title="Start Free Trial"
            size="lg"
            onPress={handleStartTrial}
            loading={loading}
          />
        </View>

        {/* Restore & Terms */}
        <View className="items-center px-6">
          <TouchableOpacity onPress={handleRestorePurchases}>
            <Text className="text-blue-500 font-medium mb-4">
              Restore Purchases
            </Text>
          </TouchableOpacity>
          
          <Text className="text-xs text-neutral-400 text-center">
            Payment will be charged to your Apple ID account at the confirmation of purchase. 
            Subscription automatically renews unless it is canceled at least 24 hours before the end of the current period.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
