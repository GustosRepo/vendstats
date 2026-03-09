import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { RootStackScreenProps } from '../../../navigation/types';
import { InputField, PrimaryButton, Card } from '../../../components';
import { TexturePattern } from '../../../components/TexturePattern';
import { createSale } from '../../../storage';
import { trackEventCompletedForReview } from '../../../utils';
import { colors } from '../../../theme';

export const AddSaleScreen: React.FC<RootStackScreenProps<'AddSale'>> = ({ 
  navigation,
  route 
}) => {
  const { eventId } = route.params;
  const headerHeight = useHeaderHeight();
  const { t } = useTranslation();
  
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [salePrice, setSalePrice] = useState('');
  const [costPerItem, setCostPerItem] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!itemName.trim()) {
      newErrors.itemName = t('addSale.itemNameRequired');
    }

    const quantityNum = parseInt(quantity, 10);
    if (!quantity || isNaN(quantityNum) || quantityNum < 1) {
      newErrors.quantity = t('addSale.validQuantity');
    }

    const salePriceNum = parseFloat(salePrice);
    if (!salePrice || isNaN(salePriceNum) || salePriceNum < 0) {
      newErrors.salePrice = t('addSale.validPrice');
    }

    const costNum = parseFloat(costPerItem);
    if (costPerItem && isNaN(costNum)) {
      newErrors.costPerItem = t('addSale.validCost');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      createSale({
        eventId,
        itemName: itemName.trim(),
        quantity: parseInt(quantity, 10),
        salePrice: parseFloat(salePrice),
        costPerItem: parseFloat(costPerItem) || 0,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      trackEventCompletedForReview();
      navigation.goBack();
    } catch (error) {
      Alert.alert(t('common.error'), t('addSale.addError'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnother = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      createSale({
        eventId,
        itemName: itemName.trim(),
        quantity: parseInt(quantity, 10),
        salePrice: parseFloat(salePrice),
        costPerItem: parseFloat(costPerItem) || 0,
      });

      // Reset form for another entry
      setItemName('');
      setQuantity('1');
      setSalePrice('');
      setCostPerItem('');
      setErrors({});
    } catch (error) {
      Alert.alert(t('common.error'), t('addSale.addError'));
    } finally {
      setLoading(false);
    }
  };

  // Calculate preview profit
  const quantityNum = parseInt(quantity, 10) || 0;
  const salePriceNum = parseFloat(salePrice) || 0;
  const costNum = parseFloat(costPerItem) || 0;
  const revenue = quantityNum * salePriceNum;
  const profit = revenue - (quantityNum * costNum);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
      <TexturePattern />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={headerHeight}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Item Details */}
          <Card variant="elevated" padding="lg" className="mb-4">
            <Text className="text-lg font-semibold text-[#171717] mb-4">
              {t('addSale.saleDetails')}
            </Text>

            <InputField
              label={t('addSale.itemName')}
              placeholder={t('addSale.itemNamePlaceholder')}
              value={itemName}
              onChangeText={setItemName}
              error={errors.itemName}
              autoFocus
              containerStyle={{ marginBottom: 16 }}
            />

            <InputField
              label={t('addSale.quantity')}
              placeholder="1"
              value={quantity}
              onChangeText={setQuantity}
              error={errors.quantity}
              keyboardType="number-pad"
              containerStyle={{ marginBottom: 16 }}
            />

            <InputField
              label={t('addSale.salePrice')}
              placeholder="0.00"
              value={salePrice}
              onChangeText={setSalePrice}
              error={errors.salePrice}
              keyboardType="decimal-pad"
              helperText={t('addSale.pricePerItem')}
              containerStyle={{ marginBottom: 16 }}
            />

            <InputField
              label={t('addSale.costPerItem')}
              placeholder="0.00"
              value={costPerItem}
              onChangeText={setCostPerItem}
              error={errors.costPerItem}
              keyboardType="decimal-pad"
              helperText={t('addSale.yourCost')}
            />
          </Card>

          {/* Preview */}
          {salePriceNum > 0 && (
            <Card variant="outlined" padding="md" className="mb-6">
              <Text className="text-xs text-[#737373] font-medium mb-2">{t('addSale.preview')}</Text>
              <View className="flex-row justify-between mb-1">
                <Text style={{ color: colors.textSecondary }}>{t('common.revenue')}</Text>
                <Text className="font-semibold text-[#171717]">${revenue.toFixed(2)}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text style={{ color: colors.textSecondary }}>{t('common.profit')}</Text>
                <Text style={{ fontWeight: '600', color: profit >= 0 ? colors.growth : colors.danger }}>
                  ${profit.toFixed(2)}
                </Text>
              </View>
            </Card>
          )}

          {/* Actions */}
          <View className="flex-row gap-3 mb-3">
            <View style={{ flex: 1 }}>
              <PrimaryButton
                title={t('common.cancel')}
                variant="secondary"
                onPress={() => navigation.goBack()}
              />
            </View>
            <View style={{ flex: 1 }}>
              <PrimaryButton
                title={t('addSale.addSaleButton')}
                onPress={handleSave}
                loading={loading}
              />
            </View>
          </View>

          <PrimaryButton
            title={t('addSale.addAndCreateAnother')}
            variant="ghost"
            onPress={handleAddAnother}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
