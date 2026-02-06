import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../../../navigation/types';
import { Card, PrimaryButton, InputField, QuickSaleButton } from '../../../components';
import { TexturePattern } from '../../../components/TexturePattern';
import { getQuickSaleItems, addQuickSaleItem, quickCreateSale } from '../../../storage';
import { QuickSaleItem } from '../../../types';
import { formatCurrency } from '../../../utils/currency';
import { colors } from '../../../theme';

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
  const [recentSales, setRecentSales] = useState<{ name: string; price: number }[]>([]);

  useEffect(() => {
    loadQuickItems();
  }, []);

  const loadQuickItems = () => {
    const items = getQuickSaleItems();
    setQuickItems(items);
  };

  const handleQuickSale = (item: QuickSaleItem) => {
    quickCreateSale(eventId, item.itemName, item.defaultPrice, item.defaultCost, 1);
    
    // Add to recent sales for feedback
    setRecentSales(prev => [
      { name: item.itemName, price: item.defaultPrice },
      ...prev.slice(0, 4),
    ]);

    // Brief haptic feedback could be added here
  };

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
      <TexturePattern />
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
        {/* Session Total */}
        {recentSales.length > 0 && (
          <Card variant="elevated" padding="md" className="mb-6">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-xs text-neutral-500">SESSION TOTAL</Text>
                <Text className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalRecentSales)}
                </Text>
              </View>
              <Text className="text-neutral-400">{recentSales.length} sales</Text>
            </View>
            
            {/* Recent sales list */}
            <View className="mt-3 pt-3 border-t border-neutral-100">
              {recentSales.slice(0, 3).map((sale, index) => (
                <Text key={index} className="text-sm text-neutral-500">
                  + {sale.name} • {formatCurrency(sale.price)}
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
            <Text className="text-center text-neutral-500">
              No quick sale items yet. Add your most common products for 1-tap sales.
            </Text>
          </Card>
        ) : (
          <View className="flex-row flex-wrap gap-3 mb-6">
            {quickItems.map((item) => (
              <QuickSaleButton
                key={item.id}
                itemName={item.itemName}
                price={item.defaultPrice}
                onPress={() => handleQuickSale(item)}
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
    </SafeAreaView>
  );
};
