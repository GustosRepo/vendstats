import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RootStackScreenProps } from '../../../navigation/types';
import { Card, PrimaryButton, InputField, QuickSaleButton } from '../../../components';
import { TexturePattern } from '../../../components/TexturePattern';
import { getQuickSaleItems, addQuickSaleItem, quickCreateSale, getEventById } from '../../../storage';
import { QuickSaleItem } from '../../../types';
import { formatCurrency } from '../../../utils/currency';
import { colors } from '../../../theme';
import { MascotImages } from '../../../../assets';

export const QuickSaleScreen: React.FC<RootStackScreenProps<'QuickSale'>> = ({
  navigation,
  route,
}) => {
  const { eventId } = route.params;
  
  const [quickItems, setQuickItems] = useState<QuickSaleItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCost, setNewItemCost] = useState('');
  const [recentSales, setRecentSales] = useState<{ name: string; price: number; qty: number }[]>([]);
  
  // Quantity picker state
  const [selectedItem, setSelectedItem] = useState<QuickSaleItem | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    loadQuickItems();
  }, []);

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

  const handleAddQuickItem = () => {
    if (!newItemName.trim() || !newItemPrice) {
      Alert.alert('Error', 'Please enter item name and price');
      return;
    }

    addQuickSaleItem({
      itemName: newItemName.trim(),
      defaultPrice: parseFloat(newItemPrice) || 0,
      defaultCost: parseFloat(newItemCost) || 0,
    });

    setNewItemName('');
    setNewItemPrice('');
    setNewItemCost('');
    setShowAddForm(false);
    loadQuickItems();
  };

  const totalRecentSales = recentSales.reduce((sum, sale) => sum + sale.price, 0);
  const totalItemsSold = recentSales.reduce((sum, sale) => sum + sale.qty, 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
      <TexturePattern />
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
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
                  <Text className="text-xs text-neutral-500">SESSION TOTAL</Text>
                  <Text className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalRecentSales)}
                  </Text>
                </View>
              </View>
              <Text className="text-neutral-400">{totalItemsSold} items</Text>
            </View>
            
            {/* Recent sales list */}
            <View className="mt-3 pt-3 border-t border-neutral-100">
              {recentSales.slice(0, 3).map((sale, index) => (
                <Text key={index} className="text-sm text-neutral-500">
                  + {sale.qty}x {sale.name} • {formatCurrency(sale.price)}
                </Text>
              ))}
            </View>
          </Card>
        )}

        {/* Quick Sale Buttons */}
        <Text className="text-lg font-semibold text-neutral-900 mb-3">
          Quick Sale
        </Text>
        <Text className="text-sm text-neutral-500 mb-4">
          Tap to log a sale instantly
        </Text>

        {quickItems.length === 0 ? (
          <Card variant="outlined" padding="lg" className="mb-4">
            <View className="items-center py-2">
              <Image 
                source={MascotImages.lookPhone} 
                style={{ width: 80, height: 80, marginBottom: 12 }} 
                resizeMode="contain" 
              />
              <Text className="text-center text-neutral-500">
                No quick sale items yet. Add your most common products for 1-tap sales.
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

        {/* Add Quick Item Form */}
        {showAddForm ? (
          <Card variant="elevated" padding="lg" className="mb-4">
            <Text className="text-base font-semibold text-neutral-900 mb-4">
              Add Quick Item
            </Text>

            <InputField
              label="Item Name"
              placeholder="e.g., Small Candle"
              value={newItemName}
              onChangeText={setNewItemName}
              containerClassName="mb-3"
            />

            <InputField
              label="Default Price ($)"
              placeholder="0.00"
              value={newItemPrice}
              onChangeText={setNewItemPrice}
              keyboardType="decimal-pad"
              containerClassName="mb-3"
            />

            <InputField
              label="Default Cost ($)"
              placeholder="0.00"
              value={newItemCost}
              onChangeText={setNewItemCost}
              keyboardType="decimal-pad"
              containerClassName="mb-4"
            />

            <View className="flex-row gap-3">
              <View className="flex-1">
                <PrimaryButton
                  title="Cancel"
                  variant="secondary"
                  size="sm"
                  onPress={() => setShowAddForm(false)}
                />
              </View>
              <View className="flex-1">
                <PrimaryButton
                  title="Add"
                  size="sm"
                  onPress={handleAddQuickItem}
                />
              </View>
            </View>
          </Card>
        ) : (
          <TouchableOpacity
            onPress={() => setShowAddForm(true)}
            className="border-2 border-dashed border-neutral-300 rounded-xl p-4 items-center mb-6"
          >
            <Text className="text-neutral-500 font-medium">+ Add Quick Item</Text>
          </TouchableOpacity>
        )}

        {/* Manual Entry Link */}
        <PrimaryButton
          title="Add Custom Sale"
          variant="secondary"
          onPress={() => {
            navigation.replace('AddSale', { eventId });
          }}
        />
      </ScrollView>

      {/* Done Button */}
      <View className="px-5 pb-8">
        <PrimaryButton
          title="Done"
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
                    {formatCurrency(selectedItem.defaultPrice)} each
                  </Text>
                </View>

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
                    TOTAL
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
                    <Text style={{ fontWeight: '600', color: colors.textSecondary }}>Cancel</Text>
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
                    <Text style={{ fontWeight: '600', color: '#fff' }}>Log Sale</Text>
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
