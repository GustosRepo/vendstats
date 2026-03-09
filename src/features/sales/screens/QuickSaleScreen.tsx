import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { RootStackScreenProps } from '../../../navigation/types';
import { Card, PrimaryButton, QuickSaleButton } from '../../../components';
import { TexturePattern } from '../../../components/TexturePattern';
import { getQuickSaleItems, quickCreateSale, getEventById, updateQuickSaleItem } from '../../../storage';
import { QuickSaleItem } from '../../../types';
import { formatCurrency } from '../../../utils/currency';
import { trackEventCompletedForReview } from '../../../utils';
import { colors } from '../../../theme';
import { MascotImages } from '../../../../assets';

export const QuickSaleScreen: React.FC<RootStackScreenProps<'QuickSale'>> = ({
  navigation,
  route,
}) => {
  const { eventId } = route.params;
  const { t } = useTranslation();
  
  const [quickItems, setQuickItems] = useState<QuickSaleItem[]>([]);
  const [recentSales, setRecentSales] = useState<{ name: string; price: number; qty: number }[]>([]);
  
  // Quantity picker state
  const [selectedItem, setSelectedItem] = useState<QuickSaleItem | null>(null);
  const [quantity, setQuantity] = useState(1);

  useFocusEffect(
    useCallback(() => {
      loadQuickItems();
    }, [])
  );

  const loadQuickItems = () => {
    const allItems = getQuickSaleItems();
    const event = getEventById(eventId);
    
    // Filter by event's selected products if set
    if (event?.productIds && event.productIds.length > 0) {
      const filtered = allItems.filter(item => event.productIds!.includes(item.id));
      setQuickItems(filtered);
    } else {
      setQuickItems(allItems);
    }
  };

  const handleQuickSale = (item: QuickSaleItem) => {
    // Open quantity picker
    setSelectedItem(item);
    setQuantity(1);
  };

  const confirmSale = () => {
    if (!selectedItem) return;
    
    quickCreateSale(eventId, selectedItem.itemName, selectedItem.defaultPrice, selectedItem.defaultCost, quantity);
    
    // Success haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Track for review prompt
    trackEventCompletedForReview();
    
    // Update stock count if tracking inventory
    if (selectedItem.stockCount !== undefined) {
      const newStock = Math.max(0, selectedItem.stockCount - quantity);
      updateQuickSaleItem(selectedItem.id, { stockCount: newStock });
      
      // Update local state
      setQuickItems(prev => 
        prev.map(item => 
          item.id === selectedItem.id 
            ? { ...item, stockCount: newStock }
            : item
        )
      );
    }
    
    // Add to recent sales for feedback
    setRecentSales(prev => [
      { name: selectedItem.itemName, price: selectedItem.defaultPrice * quantity, qty: quantity },
      ...prev.slice(0, 4),
    ]);

    // Close picker
    setSelectedItem(null);
    setQuantity(1);
  };

  const incrementQty = () => setQuantity(q => q + 1);
  const decrementQty = () => setQuantity(q => Math.max(1, q - 1));

  const totalRecentSales = recentSales.reduce((sum, sale) => sum + sale.price, 0);
  const totalItemsSold = recentSales.reduce((sum, sale) => sum + sale.qty, 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
      <TexturePattern />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {/* Session Total */}
        {recentSales.length > 0 && (
          <Card variant="elevated" padding="md" className="mb-6">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Image 
                  source={MascotImages.celebrate2} 
                  style={{ width: 48, height: 48, marginRight: 12 }} 
                  resizeMode="contain" 
                />
                <View>
                  <Text style={{ fontSize: 12, color: colors.textTertiary }}>{t('quickSale.sessionTotal')}</Text>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: colors.growth }}>
                    {formatCurrency(totalRecentSales)}
                  </Text>
                </View>
              </View>
              <Text style={{ color: colors.textMuted }}>{t('quickSale.itemsCount', { count: totalItemsSold })}</Text>
            </View>
            
            {/* Recent sales list */}
            <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.divider }}>
              {recentSales.slice(0, 3).map((sale, index) => (
                <Text key={index} style={{ fontSize: 14, color: colors.textTertiary }}>
                  + {sale.qty}x {sale.name} • {formatCurrency(sale.price)}
                </Text>
              ))}
            </View>
          </Card>
        )}

        {/* Quick Sale Buttons */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: "600", color: colors.textPrimary }}>
            {t('quickSale.title')}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('EditEventProducts', { eventId })}>
            <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 14 }}>
              {t('quickSale.editItems')}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 14, color: colors.textTertiary, marginBottom: 16 }}>
          {t('quickSale.subtitle')}
        </Text>

        {quickItems.length === 0 ? (
          <Card variant="outlined" padding="lg" className="mb-4">
            <View className="items-center py-2">
              <Image 
                source={MascotImages.lookPhone} 
                style={{ width: 80, height: 80, marginBottom: 12 }} 
                resizeMode="contain" 
              />
              <Text style={{ textAlign: "center", color: colors.textTertiary }}>
                {t('quickSale.emptyState')}
              </Text>
            </View>
          </Card>
        ) : (
          <View className="flex-row flex-wrap gap-3 mb-6">
            {quickItems.map((item) => (
              <QuickSaleButton
                key={item.id}
                itemName={item.itemName}
                price={item.defaultPrice}
                onPress={() => handleQuickSale(item)}
                imageUri={item.imageUri}
                stockCount={item.stockCount}
              />
            ))}
          </View>
        )}

        {/* Manual Entry Link */}
        <PrimaryButton
          title={t('quickSale.customSale')}
          variant="secondary"
          onPress={() => {
            navigation.replace('AddSale', { eventId });
          }}
        />
      </ScrollView>

      {/* Done Button */}
      <View className="px-5 pb-8">
        <PrimaryButton
          title={t('common.done')}
          size="lg"
          onPress={() => navigation.goBack()}
        />
      </View>

      {/* Quantity Picker Modal */}
      <Modal
        visible={selectedItem !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedItem(null)}
      >
        <TouchableOpacity 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
          activeOpacity={1}
          onPress={() => setSelectedItem(null)}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            style={{ 
              backgroundColor: colors.surface, 
              borderRadius: 20, 
              padding: 24, 
              width: '85%',
              maxWidth: 340,
            }}
          >
            {selectedItem && (
              <>
                {/* Product Info */}
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                  {selectedItem.imageUri ? (
                    <Image
                      source={{ uri: selectedItem.imageUri }}
                      style={{ width: 80, height: 80, borderRadius: 12, marginBottom: 12 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: 12, 
                      backgroundColor: colors.copper + '20',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: 12,
                    }}>
                      <Ionicons name="cube-outline" size={36} color={colors.copper} />
                    </View>
                  )}
                  <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary }}>
                    {selectedItem.itemName}
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 4 }}>
                    {t('quickSale.priceEach', { price: formatCurrency(selectedItem.defaultPrice) })}
                  </Text>
                  {selectedItem.stockCount !== undefined && (
                    <View style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      marginTop: 8,
                      backgroundColor: selectedItem.stockCount > 0 ? colors.primary + '15' : colors.error + '15',
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 12,
                    }}>
                      <Ionicons 
                        name="cube-outline" 
                        size={14} 
                        color={selectedItem.stockCount > 0 ? colors.primary : colors.error} 
                      />
                      <Text style={{ 
                        fontSize: 12, 
                        fontWeight: '600',
                        color: selectedItem.stockCount > 0 ? colors.primary : colors.error,
                        marginLeft: 4,
                      }}>
                        {t('quickSale.inStock', { count: selectedItem.stockCount })}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Low stock warning */}
                {selectedItem.stockCount !== undefined && quantity > selectedItem.stockCount && (
                  <View style={{ 
                    backgroundColor: colors.error + '15', 
                    padding: 10, 
                    borderRadius: 8,
                    marginBottom: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                    <Ionicons name="warning" size={16} color={colors.error} />
                    <Text style={{ color: colors.error, fontSize: 12, marginLeft: 8, flex: 1 }}>
                      {t('quickSale.lowStockWarning')}
                    </Text>
                  </View>
                )}

                {/* Quantity Picker */}
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: 20,
                }}>
                  <TouchableOpacity
                    onPress={decrementQty}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 26,
                      backgroundColor: quantity > 1 ? colors.primary + '15' : colors.divider,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons name="remove" size={28} color={quantity > 1 ? colors.primary : colors.textMuted} />
                  </TouchableOpacity>
                  
                  <View style={{ 
                    minWidth: 80, 
                    alignItems: 'center',
                    marginHorizontal: 16,
                  }}>
                    <Text style={{ 
                      fontSize: 42, 
                      fontWeight: '700', 
                      color: colors.textPrimary,
                    }}>
                      {quantity}
                    </Text>
                  </View>
                  
                  <TouchableOpacity
                    onPress={incrementQty}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 26,
                      backgroundColor: colors.primary + '15',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons name="add" size={28} color={colors.primary} />
                  </TouchableOpacity>
                </View>

                {/* Total */}
                <View style={{ 
                  backgroundColor: colors.success + '15', 
                  padding: 16, 
                  borderRadius: 12,
                  marginBottom: 20,
                  alignItems: 'center',
                }}>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>
                    {t('quickSale.total')}
                  </Text>
                  <Text style={{ fontSize: 28, fontWeight: '700', color: colors.success }}>
                    {formatCurrency(selectedItem.defaultPrice * quantity)}
                  </Text>
                </View>

                {/* Actions */}
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    onPress={() => setSelectedItem(null)}
                    style={{
                      flex: 1,
                      padding: 16,
                      borderRadius: 12,
                      backgroundColor: colors.divider,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontWeight: '600', color: colors.textSecondary }}>{t('common.cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={confirmSale}
                    style={{
                      flex: 1,
                      padding: 16,
                      borderRadius: 12,
                      backgroundColor: colors.primary,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontWeight: '600', color: '#fff' }}>{t('quickSale.logSale')}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};
