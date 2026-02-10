import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../../../navigation/types';
import { Card, PrimaryButton } from '../../../components';
import { TexturePattern } from '../../../components/TexturePattern';
import { activateSubscription } from '../../../storage';
import { requestReviewIfAppropriate } from '../../../utils';
import { colors } from '../../../theme';
import { MascotImages } from '../../../../assets';
// import Purchases from 'react-native-purchases';

export const PaywallScreen: React.FC<RootStackScreenProps<'Paywall'>> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

  // Request review when paywall is shown (user completed free event)
  useEffect(() => {
    // Delay review request to let user see the paywall first
    const timer = setTimeout(() => {
      requestReviewIfAppropriate();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

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

  const handleSubscribe = async () => {
    setLoading(true);
    
    try {
      // In production, this would initiate RevenueCat purchase
      // const offerings = await Purchases.getOfferings();
      // const package = offerings.current?.availablePackages[0];
      // await Purchases.purchasePackage(package);
      
      // For demo: activate subscription
      activateSubscription();
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
          <Image 
            source={MascotImages.celebrate} 
            style={{ width: 120, height: 120, marginBottom: 8 }} 
            resizeMode="contain" 
          />
          <Text className="text-3xl font-bold text-neutral-900 text-center mb-2">
            Ready to Keep Going? 💪
          </Text>
          <Text className="text-base text-neutral-500 text-center">
            You've completed your free event! Upgrade to Pro to track unlimited events and unlock all features.
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

        {/* CTA Button */}
        <View className="px-6 mb-4">
          <PrimaryButton
            title={`Subscribe ${selectedPlan === 'yearly' ? plans.yearly.price : plans.monthly.price}/${selectedPlan === 'yearly' ? 'year' : 'month'}`}
            size="lg"
            onPress={handleSubscribe}
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
