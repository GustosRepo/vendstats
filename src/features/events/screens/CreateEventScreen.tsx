import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { Ionicons } from '@expo/vector-icons';
import { RootStackScreenProps } from '../../../navigation/types';
import { InputField, PrimaryButton, Card } from '../../../components';
import { TexturePattern } from '../../../components/TexturePattern';
import { createEvent, getQuickSaleItems, getEventById } from '../../../storage';
import { QuickSaleItem } from '../../../types';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { colors } from '../../../theme';
import * as ImagePicker from 'expo-image-picker';
import { persistReceiptPhoto, resolveStoredUri } from '../../../utils/image';

export const CreateEventScreen: React.FC<RootStackScreenProps<'CreateEvent'>> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const headerHeight = useHeaderHeight();
  const duplicateFromEventId = route.params?.duplicateFromEventId;
  const [name, setName] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [location, setLocation] = useState('');
  const [boothFee, setBoothFee] = useState('');
  const [travelCost, setTravelCost] = useState('');
  const [suppliesCost, setSuppliesCost] = useState('');
  const [miscCost, setMiscCost] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Product selection
  const [allProducts, setAllProducts] = useState<QuickSaleItem[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedWeather, setSelectedWeather] = useState<string | undefined>(undefined);
  const [receiptPhotoUri, setReceiptPhotoUri] = useState<string | null>(null);

  const TAG_OPTIONS = [
    'farmers_market', 'festival', 'pop_up', 'craft_fair',
    'flea_market', 'food_truck', 'night_market', 'holiday',
    'corporate', 'online',
  ] as const;

  const WEATHER_OPTIONS = [
    { key: 'sunny', emoji: '☀️' },
    { key: 'cloudy', emoji: '☁️' },
    { key: 'rainy', emoji: '🌧️' },
    { key: 'hot', emoji: '🔥' },
    { key: 'cold', emoji: '❄️' },
    { key: 'windy', emoji: '💨' },
  ] as const;

  useEffect(() => {
    const products = getQuickSaleItems();
    setAllProducts(products);

    // If duplicating, pre-fill from source event
    if (duplicateFromEventId) {
      const source = getEventById(duplicateFromEventId);
      if (source) {
        setName(`${source.name} (copy)`);
        setLocation(source.location || '');
        setBoothFee(source.boothFee > 0 ? source.boothFee.toString() : '');
        setTravelCost(source.travelCost > 0 ? source.travelCost.toString() : '');
        setSuppliesCost(source.suppliesCost && source.suppliesCost > 0 ? source.suppliesCost.toString() : '');
        setMiscCost(source.miscCost && source.miscCost > 0 ? source.miscCost.toString() : '');
        setNotes(source.notes);
        if (source.tags && source.tags.length > 0) {
          setSelectedTags(source.tags);
        }
        if (source.weather) {
          setSelectedWeather(source.weather);
        }
        if (source.productIds && source.productIds.length > 0) {
          // Only select products that still exist
          const existingIds = products.map(p => p.id);
          setSelectedProductIds(source.productIds.filter(id => existingIds.includes(id)));
          return;
        }
      }
    }

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

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleReceiptPhoto = () => {
    Alert.alert(
      t('receipt.addReceipt'),
      t('receipt.addReceiptMessage'),
      [
        {
          text: t('addItem.takePhoto'),
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') return;
            const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
            if (!result.canceled && result.assets[0]) {
              const relativePath = await persistReceiptPhoto(result.assets[0].uri);
              setReceiptPhotoUri(relativePath);
            }
          },
        },
        {
          text: t('addItem.chooseFromLibrary'),
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
            if (!result.canceled && result.assets[0]) {
              const relativePath = await persistReceiptPhoto(result.assets[0].uri);
              setReceiptPhotoUri(relativePath);
            }
          },
        },
        ...(receiptPhotoUri ? [{
          text: t('receipt.removeReceipt'),
          style: 'destructive' as const,
          onPress: () => setReceiptPhotoUri(null),
        }] : []),
        { text: t('common.cancel'), style: 'cancel' as const },
      ]
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = t('createEvent.nameRequired');
    }

    if (!date.trim()) {
      newErrors.date = t('createEvent.dateRequired');
    }

    const boothFeeNum = parseFloat(boothFee);
    if (boothFee && isNaN(boothFeeNum)) {
      newErrors.boothFee = t('createEvent.invalidAmount');
    }

    const travelCostNum = parseFloat(travelCost);
    if (travelCost && isNaN(travelCostNum)) {
      newErrors.travelCost = t('createEvent.invalidAmount');
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
        location: location.trim() || undefined,
        boothFee: parseFloat(boothFee) || 0,
        travelCost: parseFloat(travelCost) || 0,
        suppliesCost: parseFloat(suppliesCost) || 0,
        miscCost: parseFloat(miscCost) || 0,
        notes: notes.trim(),
        productIds: selectedProductIds.length > 0 ? selectedProductIds : undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        weather: selectedWeather,
        receiptPhotoUri: receiptPhotoUri || undefined,
      });

      navigation.replace('EventDetail', { eventId: event.id });
    } catch (error) {
      Alert.alert(t('common.error'), t('createEvent.createError'));
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
        style={{ flex: 1 }}
        keyboardVerticalOffset={headerHeight}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Event Info Card */}
          <Card variant="elevated" padding="lg" className="mb-4">
            <Text className="text-lg font-semibold text-[#171717] mb-4">
              {t('createEvent.eventDetails')}
            </Text>

            <InputField
              label={t('createEvent.eventName')}
              placeholder={t('createEvent.eventNamePlaceholder')}
              value={name}
              onChangeText={setName}
              error={errors.name}
              autoFocus
              containerStyle={{ marginBottom: 16 }}
            />

            <InputField
              label={t('createEvent.date')}
              placeholder={t('createEvent.datePlaceholder')}
              value={date}
              onChangeText={setDate}
              error={errors.date}
              keyboardType="numeric"
              containerStyle={{ marginBottom: 16 }}
            />

            <InputField
              label={t('createEvent.location')}
              placeholder={t('createEvent.locationPlaceholder')}
              value={location}
              onChangeText={setLocation}
              containerStyle={{ marginBottom: 16 }}
            />
          </Card>

          {/* Expenses Card */}
          <Card variant="elevated" padding="lg" className="mb-4">
            <Text className="text-lg font-semibold text-[#171717] mb-4">
              {t('createEvent.expenses')}
            </Text>

            <InputField
              label={t('createEvent.boothFee')}
              placeholder="0.00"
              value={boothFee}
              onChangeText={setBoothFee}
              error={errors.boothFee}
              keyboardType="decimal-pad"
              containerStyle={{ marginBottom: 16 }}
            />

            <InputField
              label={t('createEvent.travelCost')}
              placeholder="0.00"
              value={travelCost}
              onChangeText={setTravelCost}
              error={errors.travelCost}
              keyboardType="decimal-pad"
              containerStyle={{ marginBottom: 16 }}
            />

            <InputField
              label={t('createEvent.suppliesCost')}
              placeholder="0.00"
              value={suppliesCost}
              onChangeText={setSuppliesCost}
              keyboardType="decimal-pad"
              containerStyle={{ marginBottom: 16 }}
            />

            <InputField
              label={t('createEvent.miscCost')}
              placeholder="0.00"
              value={miscCost}
              onChangeText={setMiscCost}
              keyboardType="decimal-pad"
            />

            {/* Receipt Photo */}
            <TouchableOpacity
              onPress={handleReceiptPhoto}
              style={{
                marginTop: 16,
                flexDirection: 'row',
                alignItems: 'center',
                padding: 12,
                borderRadius: 10,
                backgroundColor: receiptPhotoUri ? colors.success + '12' : colors.surface,
                borderWidth: 1,
                borderColor: receiptPhotoUri ? colors.success : colors.divider,
                borderStyle: receiptPhotoUri ? 'solid' : 'dashed',
              }}
            >
              {receiptPhotoUri ? (
                <Image source={{ uri: resolveStoredUri(receiptPhotoUri) }} style={{ width: 40, height: 40, borderRadius: 6, marginRight: 12 }} />
              ) : (
                <Ionicons name="receipt-outline" size={22} color={colors.textSecondary} style={{ marginRight: 12 }} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: receiptPhotoUri ? colors.success : colors.textSecondary }}>
                  {receiptPhotoUri ? t('receipt.receiptAdded') : t('receipt.attachReceipt')}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textTertiary, marginTop: 2 }}>
                  {receiptPhotoUri ? t('receipt.tapToChange') : t('receipt.tapToAdd')}
                </Text>
              </View>
              <Ionicons name={receiptPhotoUri ? 'checkmark-circle' : 'camera-outline'} size={20} color={receiptPhotoUri ? colors.success : colors.textMuted} />
            </TouchableOpacity>
          </Card>

          {/* Weather Card */}
          <Card variant="elevated" padding="lg" className="mb-4">
            <Text style={{ fontSize: 18, fontWeight: "600", color: colors.textPrimary, marginBottom: 12 }}>
              {t('weather.title')}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {WEATHER_OPTIONS.map(w => {
                const isSelected = selectedWeather === w.key;
                return (
                  <TouchableOpacity
                    key={w.key}
                    onPress={() => setSelectedWeather(isSelected ? undefined : w.key)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor: isSelected ? colors.primary : colors.surface,
                      borderWidth: 1,
                      borderColor: isSelected ? colors.primary : colors.divider,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>{w.emoji}</Text>
                    <Text style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: isSelected ? '#fff' : colors.textSecondary,
                    }}>
                      {t(`weather.${w.key}`)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>

          {/* Notes Card */}
          <Card variant="elevated" padding="lg" className="mb-4">
            <Text className="text-lg font-semibold text-[#171717] mb-4">
              {t('createEvent.notesOptional')}
            </Text>

            <InputField
              placeholder={t('createEvent.notesPlaceholder')}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </Card>

          {/* Tags Card */}
          <Card variant="elevated" padding="lg" className="mb-4">
            <Text style={{ fontSize: 18, fontWeight: "600", color: colors.textPrimary, marginBottom: 12 }}>
              {t('tags.title')}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 12 }}>
              {t('tags.subtitle')}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {TAG_OPTIONS.map(tag => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => toggleTag(tag)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor: isSelected ? colors.primary : colors.surface,
                      borderWidth: 1,
                      borderColor: isSelected ? colors.primary : colors.divider,
                    }}
                  >
                    <Text style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: isSelected ? '#fff' : colors.textSecondary,
                    }}>
                      {t(`tags.${tag}`)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>

          {/* Products Selection */}
          {allProducts.length > 0 && (
            <Card variant="elevated" padding="lg" className="mb-6">
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 18, fontWeight: "600", color: colors.textPrimary }}>
                  {t('createEvent.itemsToBring')}
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
            <View style={{ flex: 1 }}>
              <PrimaryButton
                title={t('common.cancel')}
                variant="secondary"
                onPress={handleCancel}
              />
            </View>
            <View style={{ flex: 1 }}>
              <PrimaryButton
                title={t('createEvent.createEventButton')}
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
