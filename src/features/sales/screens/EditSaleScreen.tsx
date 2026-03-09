import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useTranslation } from 'react-i18next';
import { RootStackScreenProps } from '../../../navigation/types';
import { InputField, PrimaryButton, Card } from '../../../components';
import { TexturePattern } from '../../../components/TexturePattern';
import { getSaleById, updateSale, deleteSale, getQuickSaleItems, updateQuickSaleItem } from '../../../storage';
import { colors } from '../../../theme';

export const EditSaleScreen: React.FC<RootStackScreenProps<'EditSale'>> = ({ 
  navigation,
  route 
}) => {
  const { saleId } = route.params;
  const headerHeight = useHeaderHeight();
  const { t } = useTranslation();
  
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [costPerItem, setCostPerItem] = useState('');
  const [originalQuantity, setOriginalQuantity] = useState(0);
  const [originalItemName, setOriginalItemName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const sale = getSaleById(saleId);
    if (sale) {
      setItemName(sale.itemName);
      setQuantity(sale.quantity.toString());
      setSalePrice(sale.salePrice.toString());
      setCostPerItem(sale.costPerItem.toString());
      setOriginalQuantity(sale.quantity);
      setOriginalItemName(sale.itemName);
    } else {
      Alert.alert(t('common.error'), t('editSale.saleNotFound'));
      navigation.goBack();
    }
  }, [saleId, navigation]);

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

  const adjustProductStock = (productItemName: string, quantityChange: number) => {
    const products = getQuickSaleItems();
    const product = products.find(p => p.itemName === productItemName);
    if (product && product.stockCount !== undefined) {
      const newStock = Math.max(0, product.stockCount - quantityChange);
      updateQuickSaleItem(product.id, { stockCount: newStock });
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const newQuantity = parseInt(quantity, 10);
      const quantityDiff = newQuantity - originalQuantity;
      
      // Adjust stock based on quantity change
      if (quantityDiff !== 0) {
        adjustProductStock(originalItemName, quantityDiff);
      }

      updateSale({
        id: saleId,
        itemName: itemName.trim(),
        quantity: newQuantity,
        salePrice: parseFloat(salePrice),
        costPerItem: parseFloat(costPerItem) || 0,
      });

      navigation.goBack();
    } catch (error) {
      Alert.alert(t('common.error'), t('editSale.updateError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t('editSale.deleteSale'),
      t('editSale.deleteSaleConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            // Restore stock when deleting sale
            adjustProductStock(originalItemName, -originalQuantity);
            deleteSale(saleId);
            navigation.goBack();
          },
        },
      ]
    );
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
                <Text className={`font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  ${profit.toFixed(2)}
                </Text>
              </View>
            </Card>
          )}

          {/* Actions */}
          <PrimaryButton
            title={t('editSale.saveChanges')}
            onPress={handleSave}
            loading={loading}
            className="mb-3"
          />

          <PrimaryButton
            title={t('editSale.deleteSale')}
            variant="danger"
            onPress={handleDelete}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
