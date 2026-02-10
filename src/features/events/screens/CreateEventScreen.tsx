import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RootStackScreenProps } from '../../../navigation/types';
import { InputField, PrimaryButton, Card } from '../../../components';
import { TexturePattern } from '../../../components/TexturePattern';
import { createEvent, getQuickSaleItems, getAllEvents, shouldShowEventPaywall } from '../../../storage';
import { QuickSaleItem } from '../../../types';
import { format } from 'date-fns';
import { colors } from '../../../theme';

export const CreateEventScreen: React.FC<RootStackScreenProps<'CreateEvent'>> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [boothFee, setBoothFee] = useState('');
  const [travelCost, setTravelCost] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Product selection
  const [allProducts, setAllProducts] = useState<QuickSaleItem[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Check paywall on mount
  useEffect(() => {
    const events = getAllEvents();
    if (shouldShowEventPaywall(events.length)) {
      navigation.replace('Paywall');
    }
  }, [navigation]);

  useEffect(() => {
    const products = getQuickSaleItems();
    setAllProducts(products);
    // Select all by default
    setSelectedProductIds(products.map(p => p.id));
  }, []);

  const toggleProduct = (productId: string) => {
    setSelectedProductIds(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAllProducts = () => {
    setSelectedProductIds(allProducts.map(p => p.id));
  };

  const deselectAllProducts = () => {
    setSelectedProductIds([]);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Event name is required';
    }

    if (!date.trim()) {
      newErrors.date = 'Date is required';
    }

    const boothFeeNum = parseFloat(boothFee);
    if (boothFee && isNaN(boothFeeNum)) {
      newErrors.boothFee = 'Invalid amount';
    }

    const travelCostNum = parseFloat(travelCost);
    if (travelCost && isNaN(travelCostNum)) {
      newErrors.travelCost = 'Invalid amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const event = createEvent({
        name: name.trim(),
        date,
        boothFee: parseFloat(boothFee) || 0,
        travelCost: parseFloat(travelCost) || 0,
        notes: notes.trim(),
        productIds: selectedProductIds.length > 0 ? selectedProductIds : undefined,
      });

      navigation.replace('EventDetail', { eventId: event.id });
    } catch (error) {
      Alert.alert('Error', 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
      <TexturePattern />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Event Info Card */}
          <Card variant="elevated" padding="lg" className="mb-4">
            <Text className="text-lg font-semibold text-neutral-900 mb-4">
              Event Details
            </Text>

            <InputField
              label="Event Name"
              placeholder="e.g., Farmers Market Downtown"
              value={name}
              onChangeText={setName}
              error={errors.name}
              autoFocus
              containerClassName="mb-4"
            />

            <InputField
              label="Date"
              placeholder="YYYY-MM-DD"
              value={date}
              onChangeText={setDate}
              error={errors.date}
              keyboardType="numeric"
              containerClassName="mb-4"
            />
          </Card>

          {/* Expenses Card */}
          <Card variant="elevated" padding="lg" className="mb-4">
            <Text className="text-lg font-semibold text-neutral-900 mb-4">
              Expenses
            </Text>

            <InputField
              label="Booth Fee ($)"
              placeholder="0.00"
              value={boothFee}
              onChangeText={setBoothFee}
              error={errors.boothFee}
              keyboardType="decimal-pad"
              containerClassName="mb-4"
            />

            <InputField
              label="Travel Cost ($)"
              placeholder="0.00"
              value={travelCost}
              onChangeText={setTravelCost}
              error={errors.travelCost}
              keyboardType="decimal-pad"
            />
          </Card>

          {/* Notes Card */}
          <Card variant="elevated" padding="lg" className="mb-4">
            <Text className="text-lg font-semibold text-neutral-900 mb-4">
              Notes (Optional)
            </Text>

            <InputField
              placeholder="Any notes about this event..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </Card>

          {/* Products Selection */}
          {allProducts.length > 0 && (
            <Card variant="elevated" padding="lg" className="mb-6">
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text className="text-lg font-semibold text-neutral-900">
                  Products to Bring
                </Text>
                <TouchableOpacity 
                  onPress={selectedProductIds.length === allProducts.length ? deselectAllProducts : selectAllProducts}
                >
                  <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 14 }}>
                    {selectedProductIds.length === allProducts.length ? 'Deselect All' : 'Select All'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 16 }}>
                {selectedProductIds.length} of {allProducts.length} products selected
              </Text>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {allProducts.map(product => {
                  const isSelected = selectedProductIds.includes(product.id);
                  return (
                    <TouchableOpacity
                      key={product.id}
                      onPress={() => toggleProduct(product.id)}
                      style={{
                        width: 80,
                        alignItems: 'center',
                        opacity: isSelected ? 1 : 0.5,
                      }}
                    >
                      <View
                        style={{
                          width: 70,
                          height: 70,
                          borderRadius: 12,
                          backgroundColor: product.imageUri ? undefined : colors.copper + '20',
                          borderWidth: 3,
                          borderColor: isSelected ? colors.primary : colors.divider,
                          overflow: 'hidden',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        {product.imageUri ? (
                          <Image
                            source={{ uri: product.imageUri }}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="cover"
                          />
                        ) : (
                          <Ionicons name="cube-outline" size={28} color={colors.copper} />
                        )}
                        
                        {isSelected && (
                          <View
                            style={{
                              position: 'absolute',
                              top: -2,
                              right: -2,
                              backgroundColor: colors.primary,
                              borderRadius: 10,
                              width: 20,
                              height: 20,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <Ionicons name="checkmark" size={14} color="#fff" />
                          </View>
                        )}
                      </View>
                      <Text
                        style={{
                          fontSize: 11,
                          color: colors.textSecondary,
                          marginTop: 4,
                          textAlign: 'center',
                        }}
                        numberOfLines={2}
                      >
                        {product.itemName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>
          )}

          {/* Actions */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <PrimaryButton
                title="Cancel"
                variant="secondary"
                onPress={handleCancel}
              />
            </View>
            <View className="flex-1">
              <PrimaryButton
                title="Create Event"
                onPress={handleCreate}
                loading={loading}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
