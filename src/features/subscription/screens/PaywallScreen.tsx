import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { RootStackScreenProps } from '../../../navigation/types';
import { Card, PrimaryButton } from '../../../components';
import { TexturePattern } from '../../../components/TexturePattern';
import { requestReviewIfAppropriate } from '../../../utils';
import { getOfferings, purchasePackage, restorePurchases, MockOffering, MockPackage } from '../../../services/revenuecat';
import { colors } from '../../../theme';
import { MascotImages } from '../../../../assets';

const APPLE_EULA_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
const PRIVACY_POLICY_URL = 'https://www.code-werx.com/vendstats/privacy';

export const PaywallScreen: React.FC<RootStackScreenProps<'Paywall'>> = ({ navigation }) => {
  const { t } = useTranslation();
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
      period: t('paywall.month'),
      savings: null,
    },
    yearly: {
      price: packages.yearly?.product?.priceString || '$29.99', 
      period: t('paywall.year'),
      savings: t('paywall.saveBadge'),
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
          t('paywall.subscriptionUnavailable'),
          t('paywall.subscriptionUnavailableMessage')
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
          Alert.alert(t('paywall.purchaseSheetUnavailable'), result.error.message);
          return;
        }

        if (result.error.code === 'NOT_CONFIGURED') {
          Alert.alert(t('paywall.billingNotConfigured'), result.error.message);
          return;
        }

        Alert.alert(t('paywall.purchaseFailed'), result.error.message || t('paywall.purchaseFailedMessage'));
      } else {
        Alert.alert(t('paywall.purchaseFailed'), t('paywall.purchaseFailedMessage'));
      }
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert(t('common.error'), t('paywall.somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    setLoading(true);
    
    try {
      const result = await restorePurchases();
      
      if (result.success && result.hasActiveSubscription) {
        Alert.alert(t('paywall.restored'), t('paywall.restoredMessage'));
        navigation.goBack();
      } else {
        Alert.alert(t('paywall.noPurchases'), t('paywall.noPurchasesMessage'));
      }
    } catch (error) {
      console.error('Restore error:', error);
      Alert.alert(t('common.error'), t('paywall.restoreError'));
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

  const handleOpenPrivacyPolicy = async () => {
    const canOpen = await Linking.canOpenURL(PRIVACY_POLICY_URL);
    if (canOpen) {
      await Linking.openURL(PRIVACY_POLICY_URL);
      return;
    }

    navigation.navigate('PrivacyPolicy');
  };

  const features = [
    { icon: '�', title: t('paywall.unlimitedItems'), description: t('paywall.unlimitedItemsDesc') },
    { icon: '📊', title: t('paywall.globalStats'), description: t('paywall.globalStatsDesc') },
    { icon: '📄', title: t('paywall.csvExport'), description: t('paywall.csvExportDesc') },
    { icon: '🔔', title: t('paywall.lowStockAlerts'), description: t('paywall.lowStockAlertsDesc') },
    { icon: '📈', title: t('paywall.chartsInsights'), description: t('paywall.chartsInsightsDesc') },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <TexturePattern />
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Close Button */}
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="absolute top-4 right-4 z-10 w-8 h-8 items-center justify-center"
        >
          <Text style={{ fontSize: 24, color: colors.textMuted }}>×</Text>
        </TouchableOpacity>

        {/* Header */}
        <View className="items-center pt-12 pb-8 px-6">
          <Image 
            source={MascotImages.celebrate} 
            style={{ width: 120, height: 120, marginBottom: 8 }} 
            resizeMode="contain" 
          />
          <Text style={{ fontSize: 30, fontWeight: "700", color: colors.textPrimary, textAlign: "center", marginBottom: 8 }}>
            {t('paywall.headerTitle')}
          </Text>
          <Text style={{ fontSize: 16, color: colors.textTertiary, textAlign: "center" }}>
            {t('paywall.headerSubtitle')}
          </Text>
        </View>

        {/* Features List */}
        <View className="px-6 mb-8">
          {features.map((feature, index) => (
            <View 
              key={index}
              style={{ flexDirection: "row", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.divider }}
            >
              <Text className="text-2xl mr-4">{feature.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "600", color: colors.textPrimary }}>
                  {feature.title}
                </Text>
                <Text style={{ fontSize: 14, color: colors.textTertiary }}>
                  {feature.description}
                </Text>
              </View>
              <Text style={{ color: colors.growth, fontSize: 20 }}>✓</Text>
            </View>
          ))}
        </View>

        {/* Plan Selection */}
        <View className="px-6 mb-6">
          <Text style={{ fontSize: 18, fontWeight: "600", color: colors.textPrimary, marginBottom: 16, textAlign: "center" }}>
            {t('paywall.chooseYourPlan')}
          </Text>

          {/* Yearly Plan */}
          <TouchableOpacity
            onPress={() => setSelectedPlan('yearly')}
            className={`
              border-2 rounded-xl p-4 mb-3
              ${selectedPlan === 'yearly' ? 'border-blue-500 bg-blue-50' : 'border-[#E5E7EB]'}
            `}
          >
            <View className="flex-row justify-between items-center">
              <View>
                <View className="flex-row items-center">
                  <Text style={{ fontSize: 18, fontWeight: "600", color: colors.textPrimary }}>
                    {t('paywall.yearly')}
                  </Text>
                  {plans.yearly.savings && (
                    <View className="bg-green-500 px-2 py-0.5 rounded ml-2">
                      <Text className="text-xs text-white font-medium">
                        {plans.yearly.savings}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: 14, color: colors.textTertiary }}>
                  {plans.yearly.price} / {plans.yearly.period}
                </Text>
              </View>
              <View className={`
                w-6 h-6 rounded-full border-2
                ${selectedPlan === 'yearly' ? 'border-blue-500 bg-blue-500' : 'border-[#D1D5DB]'}
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
              ${selectedPlan === 'monthly' ? 'border-blue-500 bg-blue-50' : 'border-[#E5E7EB]'}
            `}
          >
            <View className="flex-row justify-between items-center">
              <View>
                <Text style={{ fontSize: 18, fontWeight: "600", color: colors.textPrimary }}>
                  {t('paywall.monthly')}
                </Text>
                <Text style={{ fontSize: 14, color: colors.textTertiary }}>
                  {plans.monthly.price} / {plans.monthly.period}
                </Text>
              </View>
              <View className={`
                w-6 h-6 rounded-full border-2
                ${selectedPlan === 'monthly' ? 'border-blue-500 bg-blue-500' : 'border-[#D1D5DB]'}
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
            title={t('paywall.subscribeCta', { price: selectedPlan === 'yearly' ? plans.yearly.price : plans.monthly.price, period: selectedPlan === 'yearly' ? t('paywall.year') : t('paywall.month') })}
            size="lg"
            onPress={handleSubscribe}
            loading={loading}
            disabled={!canSubscribe}
          />
        </View>

        {loadingOfferings && (
          <Text className="px-6 mb-4 text-center text-xs text-[#737373]">
            {t('paywall.loadingSubscription')}
          </Text>
        )}

        {offeringsUnavailable && (
          <Text className="px-6 mb-4 text-center text-xs text-[#737373]">
            {t('paywall.unavailable')}
          </Text>
        )}

        {/* Restore & Terms */}
        <View className="items-center px-6">
          <TouchableOpacity onPress={handleRestorePurchases}>
            <Text style={{ color: colors.copper, fontWeight: '500', marginBottom: 16 }}>
              {t('paywall.restorePurchases')}
            </Text>
          </TouchableOpacity>

          <View className="w-full mb-4">
            <TouchableOpacity
              onPress={handleOpenPrivacyPolicy}
              className="border border-[#E5E7EB] rounded-lg px-4 py-3 mb-2 flex-row items-center justify-between"
            >
              <Text style={{ color: colors.copper, fontSize: 14, fontWeight: '500' }}>{t('paywall.privacyPolicy')}</Text>
              <Text style={{ color: colors.copper, fontSize: 14 }}>↗</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleOpenEula}
              className="border border-[#E5E7EB] rounded-lg px-4 py-3 flex-row items-center justify-between"
            >
              <Text style={{ color: colors.copper, fontSize: 14, fontWeight: '500' }}>{t('paywall.termsOfUse')}</Text>
              <Text style={{ color: colors.copper, fontSize: 14 }}>↗</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={{ fontSize: 12, color: colors.textMuted, textAlign: "center" }}>
            {t('paywall.legalDisclaimer')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
