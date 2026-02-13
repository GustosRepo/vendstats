import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
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
  
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [salePrice, setSalePrice] = useState('');
  const [costPerItem, setCostPerItem] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!itemName.trim()) {
      newErrors.itemName = 'Item name is required';
    }

    const quantityNum = parseInt(quantity, 10);
    if (!quantity || isNaN(quantityNum) || quantityNum < 1) {
      newErrors.quantity = 'Enter a valid quantity';
    }

    const salePriceNum = parseFloat(salePrice);
    if (!salePrice || isNaN(salePriceNum) || salePriceNum < 0) {
      newErrors.salePrice = 'Enter a valid price';
    }

    const costNum = parseFloat(costPerItem);
    if (costPerItem && isNaN(costNum)) {
      newErrors.costPerItem = 'Enter a valid cost';
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
      Alert.alert('Error', 'Failed to add sale. Please try again.');
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
      Alert.alert('Error', 'Failed to add sale. Please try again.');
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
        className="flex-1"
        keyboardVerticalOffset={headerHeight}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Item Details */}
          <Card variant="elevated" padding="lg" className="mb-4">
            <Text className="text-lg font-semibold text-neutral-900 mb-4">
              Sale Details
            </Text>

            <InputField
              label="Item Name"
              placeholder="e.g., Candle - Lavender"
              value={itemName}
              onChangeText={setItemName}
              error={errors.itemName}
              autoFocus
              containerClassName="mb-4"
            />

            <InputField
              label="Quantity"
              placeholder="1"
              value={quantity}
              onChangeText={setQuantity}
              error={errors.quantity}
              keyboardType="number-pad"
              containerClassName="mb-4"
            />

            <InputField
              label="Sale Price ($)"
              placeholder="0.00"
              value={salePrice}
              onChangeText={setSalePrice}
              error={errors.salePrice}
              keyboardType="decimal-pad"
              helperText="Price per item"
              containerClassName="mb-4"
            />

            <InputField
              label="Cost per Item ($)"
              placeholder="0.00"
              value={costPerItem}
              onChangeText={setCostPerItem}
              error={errors.costPerItem}
              keyboardType="decimal-pad"
              helperText="Your cost to make/buy this item"
            />
          </Card>

          {/* Preview */}
          {salePriceNum > 0 && (
            <Card variant="outlined" padding="md" className="mb-6">
              <Text className="text-xs text-neutral-500 font-medium mb-2">PREVIEW</Text>
              <View className="flex-row justify-between mb-1">
                <Text className="text-neutral-600">Revenue</Text>
                <Text className="font-semibold text-neutral-900">${revenue.toFixed(2)}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-neutral-600">Profit</Text>
                <Text className={`font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  ${profit.toFixed(2)}
                </Text>
              </View>
            </Card>
          )}

          {/* Actions */}
          <View className="flex-row gap-3 mb-3">
            <View className="flex-1">
              <PrimaryButton
                title="Cancel"
                variant="secondary"
                onPress={() => navigation.goBack()}
              />
            </View>
            <View className="flex-1">
              <PrimaryButton
                title="Add Sale"
                onPress={handleSave}
                loading={loading}
              />
            </View>
          </View>

          <PrimaryButton
            title="Add & Create Another"
            variant="ghost"
            onPress={handleAddAnother}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
