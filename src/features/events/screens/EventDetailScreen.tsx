import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackScreenProps } from '../../../navigation/types';
import { Card, StatBox, SaleItem, EmptyState, PrimaryButton } from '../../../components';
import { TexturePattern } from '../../../components/TexturePattern';
import { getEventById, getSalesByEventId, deleteSale } from '../../../storage';
import { calculateEventStats } from '../../../utils/calculations';
import { formatCurrency } from '../../../utils/currency';
import { Event, Sale, EventStats } from '../../../types';
import { format } from 'date-fns';
import { colors } from '../../../theme';

export const EventDetailScreen: React.FC<RootStackScreenProps<'EventDetail'>> = ({
  navigation,
  route,
}) => {
  const { eventId } = route.params;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [stats, setStats] = useState<EventStats | null>(null);

  const loadData = useCallback(() => {
    const eventData = getEventById(eventId);
    const salesData = getSalesByEventId(eventId);
    
    if (eventData) {
      setEvent(eventData);
      setSales(salesData);
      setStats(calculateEventStats(eventData, salesData));
    }
  }, [eventId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleAddSale = () => {
    navigation.navigate('AddSale', { eventId });
  };

  const handleQuickSale = () => {
    navigation.navigate('QuickSale', { eventId });
  };

  const handleEditEvent = () => {
    navigation.navigate('EditEvent', { eventId });
  };

  const handleEditSale = (saleId: string) => {
    navigation.navigate('EditSale', { eventId, saleId });
  };

  const handleDeleteSale = (saleId: string, itemName: string) => {
    Alert.alert(
      'Delete Sale',
      `Delete "${itemName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteSale(saleId);
            loadData();
          },
        },
      ]
    );
  };

  if (!event || !stats) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <TexturePattern />
        <Text className="text-neutral-500">Loading...</Text>
      </SafeAreaView>
    );
  }

  const formattedDate = format(new Date(event.date), 'EEEE, MMMM d, yyyy');
  const isProfitable = stats.netProfit >= 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
      <TexturePattern />
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-5 pt-4">
          <View className="flex-row justify-between items-start mb-1">
            <View className="flex-1 mr-4">
              <Text className="text-2xl font-bold text-neutral-900">{event.name}</Text>
              <Text className="text-sm text-neutral-500 mt-1">{formattedDate}</Text>
            </View>
            <TouchableOpacity onPress={handleEditEvent}>
              <Text className="text-blue-500 font-medium">Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profit Hero */}
        <View className="px-5 py-6">
          <Card variant="elevated" padding="lg">
            <Text className="text-sm text-neutral-500 font-medium text-center mb-2">
              NET PROFIT
            </Text>
            <Text 
              className={`text-5xl font-bold text-center ${isProfitable ? 'text-green-600' : 'text-red-500'}`}
            >
              {formatCurrency(stats.netProfit)}
            </Text>
            <Text className="text-sm text-neutral-400 text-center mt-2">
              {stats.profitMargin.toFixed(1)}% margin
            </Text>
          </Card>
        </View>

        {/* Stats Grid */}
        <View className="px-5 mb-6">
          <View className="flex-row gap-3 mb-3">
            <View className="flex-1">
              <StatBox
                label="Revenue"
                value={stats.totalRevenue}
                isCurrency
                variant="revenue"
              />
            </View>
            <View className="flex-1">
              <StatBox
                label="Expenses"
                value={stats.totalExpenses}
                isCurrency
                variant="expense"
              />
            </View>
          </View>
          
          <View className="flex-row gap-3">
            <View className="flex-1">
              <StatBox
                label="Cost of Goods"
                value={stats.totalCostOfGoods}
                isCurrency
              />
            </View>
            <View className="flex-1">
              <StatBox
                label="Items Sold"
                value={stats.salesCount}
              />
            </View>
          </View>
        </View>

        {/* Best Selling Item */}
        {stats.bestSellingItem && (
          <View className="px-5 mb-6">
            <Card variant="outlined" padding="md">
              <Text className="text-xs text-neutral-500 font-medium mb-1">
                BEST SELLER
              </Text>
              <Text className="text-lg font-semibold text-neutral-900">
                {stats.bestSellingItem.itemName}
              </Text>
              <Text className="text-sm text-neutral-500">
                {stats.bestSellingItem.quantity} sold • {formatCurrency(stats.bestSellingItem.revenue)} revenue
              </Text>
            </Card>
          </View>
        )}

        {/* Expense Breakdown */}
        <View className="px-5 mb-6">
          <Text className="text-lg font-semibold text-neutral-900 mb-3">
            Expense Breakdown
          </Text>
          <Card variant="outlined" padding="md">
            <View className="flex-row justify-between py-2 border-b border-neutral-100">
              <Text className="text-neutral-600">Booth Fee</Text>
              <Text className="font-medium text-neutral-900">
                {formatCurrency(event.boothFee)}
              </Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-neutral-600">Travel Cost</Text>
              <Text className="font-medium text-neutral-900">
                {formatCurrency(event.travelCost)}
              </Text>
            </View>
          </Card>
        </View>

        {/* Sales List */}
        <View className="px-5">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold text-neutral-900">
              Sales ({sales.length})
            </Text>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={handleQuickSale}
                className="bg-green-50 px-4 py-2 rounded-lg"
              >
                <Text className="text-green-600 font-medium">Quick</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddSale}
                className="bg-blue-50 px-4 py-2 rounded-lg"
              >
                <Text className="text-blue-600 font-medium">+ Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          {sales.length === 0 ? (
            <Card variant="outlined" padding="lg">
              <Text className="text-center text-neutral-500">
                No sales yet. Tap "Add" to log your first sale.
              </Text>
            </Card>
          ) : (
            sales.map((sale) => (
              <SaleItem
                key={sale.id}
                itemName={sale.itemName}
                quantity={sale.quantity}
                salePrice={sale.salePrice}
                costPerItem={sale.costPerItem}
                onPress={() => handleEditSale(sale.id)}
                onLongPress={() => handleDeleteSale(sale.id, sale.itemName)}
              />
            ))
          )}
        </View>

        {/* Notes */}
        {event.notes && (
          <View className="px-5 mt-6">
            <Text className="text-lg font-semibold text-neutral-900 mb-2">Notes</Text>
            <Card variant="outlined" padding="md">
              <Text className="text-neutral-600">{event.notes}</Text>
            </Card>
          </View>
        )}
      </ScrollView>

      {/* Floating Add Sale Button */}
      <View className="absolute bottom-8 right-5 left-5">
        <PrimaryButton
          title="+ Add Sale"
          onPress={handleAddSale}
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
};
