import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../../../navigation/types';
import { Card, PrimaryButton } from '../../../components';
import { TexturePattern } from '../../../components/TexturePattern';
import { requestReviewIfAppropriate } from '../../../utils';
import { getOfferings, purchasePackage, restorePurchases, MockOffering, MockPackage } from '../../../services/revenuecat';
import { colors } from '../../../theme';
import { MascotImages } from '../../../../assets';

const APPLE_EULA_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';

export const PaywallScreen: React.FC<RootStackScreenProps<'Paywall'>> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [loadingOfferings, setLoadingOfferings] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [offerings, setOfferings] = useState<MockOffering | null>(null);
  const [packages, setPackages] = useState<{ monthly?: MockPackage; yearly?: MockPackage }>({});

  // Load offerings and request review
  useEffect(() => {
    const loadData = async () => {
      // Load RevenueCat offerings
      const currentOffering = await getOfferings();
      console.log('PaywallScreen - Offerings loaded:', {
        hasOffering: !!currentOffering,
        packagesCount: currentOffering?.availablePackages?.length || 0,
        packageIdentifiers: currentOffering?.availablePackages?.map(p => p.identifier) || []
      });
      
      if (currentOffering) {
        setOfferings(currentOffering);
        
        // Map packages by identifier - try multiple matching strategies
        const packageMap: { monthly?: MockPackage; yearly?: MockPackage } = {};
        currentOffering.availablePackages.forEach(pkg => {
          const packageIdentifier = pkg.identifier.toLowerCase();
          const productIdentifier = pkg.product.identifier.toLowerCase();

          console.log('Checking package:', {
            identifier: pkg.identifier,
            productId: pkg.product.identifier,
            title: pkg.product.title,
            priceString: pkg.product.priceString
          });
          
          // Match package/product identifiers from RevenueCat and App Store products
          if (
            productIdentifier.includes('month') ||
            packageIdentifier.includes('month') ||
            packageIdentifier.includes('$rc_monthly')
          ) {
            packageMap.monthly = pkg;
          } else if (
            productIdentifier.includes('year') ||
            productIdentifier.includes('annual') ||
            packageIdentifier.includes('year') ||
            packageIdentifier.includes('annual') ||
            packageIdentifier.includes('$rc_annual')
          ) {
            packageMap.yearly = pkg;
          }
        });
        
        console.log('Mapped packages:', {
          hasMonthly: !!packageMap.monthly,
          hasYearly: !!packageMap.yearly,
          monthlyId: packageMap.monthly?.product.identifier,
          yearlyId: packageMap.yearly?.product.identifier
        });
        
        setPackages(packageMap);

        // Ensure a selectable default plan exists
        if (!packageMap.yearly && packageMap.monthly) {
          setSelectedPlan('monthly');
        }
      }

      setLoadingOfferings(false);
    };
    
    loadData();
    
    // Delay review request to let user see the paywall first
    const timer = setTimeout(() => {
      requestReviewIfAppropriate();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Get pricing from packages or fallback to hardcoded
  const plans = {
    monthly: {
      price: packages.monthly?.product?.priceString || '$4.99',
      period: 'month',
      savings: null,
    },
    yearly: {
      price: packages.yearly?.product?.priceString || '$29.99', 
      period: 'year',
      savings: 'Save 50%',
    },
  };

  const selectedPackage = selectedPlan === 'yearly' ? packages.yearly : packages.monthly;
  const offeringsUnavailable = !loadingOfferings && !selectedPackage;
  const canSubscribe = !!selectedPackage && !loadingOfferings;

  const handleSubscribe = async () => {
    try {
      if (!selectedPackage) {
        console.warn('No package available for selected plan');
        Alert.alert(
          'Subscription Unavailable',
          'We could not load subscription options. Please try again in a moment.'
        );
        return;
      }

      setLoading(true);
      
      // Purchase with RevenueCat
      const result = await purchasePackage(selectedPackage);
      
      if (result.success) {
        navigation.goBack();
      } else if (result.error) {
        if (result.error.userCancelled) {
          return;
        }

        if (result.error.code === 'EXPO_GO') {
          Alert.alert('Purchase Sheet Unavailable', result.error.message);
          return;
        }

        if (result.error.code === 'NOT_CONFIGURED') {
          Alert.alert('Billing Not Configured', result.error.message);
          return;
        }

        Alert.alert('Purchase Failed', result.error.message || 'Unable to complete purchase. Please try again.');
      } else {
        Alert.alert('Purchase Failed', 'Unable to complete purchase. Please try again.');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    setLoading(true);
    
    try {
      const result = await restorePurchases();
      
      if (result.success && result.hasActiveSubscription) {
        Alert.alert('Restored!', 'Your subscription has been restored.');
        navigation.goBack();
      } else {
        Alert.alert('No Purchases', 'No active subscription found.');
      }
    } catch (error) {
      console.error('Restore error:', error);
      Alert.alert('Error', 'Unable to restore purchases. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEula = async () => {
    const canOpen = await Linking.canOpenURL(APPLE_EULA_URL);
    if (canOpen) {
      await Linking.openURL(APPLE_EULA_URL);
      return;
    }

    navigation.navigate('TermsOfService');
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
            disabled={!canSubscribe}
          />
        </View>

        {loadingOfferings && (
          <Text className="px-6 mb-4 text-center text-xs text-neutral-500">
            Subscription options are loading…
          </Text>
        )}

        {offeringsUnavailable && (
          <Text className="px-6 mb-4 text-center text-xs text-neutral-500">
            Subscription options are currently unavailable. Please try again shortly.
          </Text>
        )}

        {/* Restore & Terms */}
        <View className="items-center px-6">
          <TouchableOpacity onPress={handleRestorePurchases}>
            <Text className="text-blue-500 font-medium mb-4">
              Restore Purchases
            </Text>
          </TouchableOpacity>

          <View className="w-full mb-4">
            <TouchableOpacity
              onPress={() => navigation.navigate('PrivacyPolicy')}
              className="border border-neutral-200 rounded-lg px-4 py-3 mb-2 flex-row items-center justify-between"
            >
              <Text className="text-blue-500 text-sm font-medium">Privacy Policy</Text>
              <Text className="text-blue-500 text-sm">↗</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleOpenEula}
              className="border border-neutral-200 rounded-lg px-4 py-3 flex-row items-center justify-between"
            >
              <Text className="text-blue-500 text-sm font-medium">Terms of Use (EULA)</Text>
              <Text className="text-blue-500 text-sm">↗</Text>
            </TouchableOpacity>
          </View>
          
          <Text className="text-xs text-neutral-400 text-center">
            Payment will be charged to your Apple ID account at the confirmation of purchase. 
            Subscription automatically renews unless it is canceled at least 24 hours before the end of the current period.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
