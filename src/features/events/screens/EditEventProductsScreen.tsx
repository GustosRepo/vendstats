import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RootStackScreenProps } from '../../../navigation/types';
import { Card, PrimaryButton } from '../../../components';
import { TexturePattern } from '../../../components/TexturePattern';
import { getEventById, updateEvent, getQuickSaleItems } from '../../../storage';
import { QuickSaleItem } from '../../../types';
import { colors } from '../../../theme';

export const EditEventProductsScreen: React.FC<RootStackScreenProps<'EditEventProducts'>> = ({
  navigation,
  route,
}) => {
  const { eventId } = route.params;
  const { t } = useTranslation();
  
  const [allProducts, setAllProducts] = useState<QuickSaleItem[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [eventName, setEventName] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const products = getQuickSaleItems();
    setAllProducts(products);
    
    const event = getEventById(eventId);
    if (event) {
      setEventName(event.name);
      setSelectedProductIds(event.productIds || []);
    }
  };

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

  const handleSave = () => {
    updateEvent({
      id: eventId,
      productIds: selectedProductIds.length > 0 ? selectedProductIds : undefined,
    });
    
    Alert.alert(
      t('editEventItems.itemsUpdated'),
      t('editEventItems.itemsUpdatedMessage', { count: selectedProductIds.length }),
      [{ text: t('common.ok'), onPress: () => navigation.goBack() }]
    );
  };

  if (allProducts.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
        <TexturePattern />
        <View className="flex-1 justify-center items-center px-5">
          <Ionicons name="cube-outline" size={64} color={colors.copper} />
          <Text className="text-lg font-semibold text-[#171717] mt-4 mb-2">
            {t('editEventItems.noItemsYet')}
          </Text>
          <Text className="text-center text-[#737373] mb-6">
            {t('editEventItems.noItemsMessage')}
          </Text>
          <PrimaryButton
            title={t('common.goBack')}
            onPress={() => navigation.goBack()}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
      <TexturePattern />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        <Text className="text-sm text-[#737373] mb-6">
          {t('editEventItems.selectItems', { eventName })}
        </Text>

        <Card variant="elevated" padding="lg" className="mb-6">
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: "600", color: colors.textPrimary }}>
              {t('editEventItems.sectionTitle')}
            </Text>
            <TouchableOpacity 
              onPress={selectedProductIds.length === allProducts.length ? deselectAllProducts : selectAllProducts}
            >
              <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 14 }}>
                {selectedProductIds.length === allProducts.length ? t('createEvent.deselectAll') : t('createEvent.selectAll')}
              </Text>
            </TouchableOpacity>
          </View>
          
          <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 16 }}>
            {t('createEvent.itemsSelected', { selected: selectedProductIds.length, total: allProducts.length })}
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
                        <Ionicons name="checkmark" size={14} color="white" />
                      </View>
                    )}
                  </View>
                  <Text 
                    numberOfLines={2} 
                    style={{ 
                      fontSize: 11, 
                      textAlign: 'center', 
                      marginTop: 4,
                      color: isSelected ? colors.textPrimary : colors.textSecondary,
                    }}
                  >
                    {product.itemName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>
      </ScrollView>

      <View className="px-5 pb-8">
        <PrimaryButton
          title={t('editEventItems.saveChanges')}
          size="lg"
          onPress={handleSave}
        />
      </View>
    </SafeAreaView>
  );
};
