import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { RootStackScreenProps } from '../../../navigation/types';
import { InputField, PrimaryButton, Card } from '../../../components';
import { TexturePattern } from '../../../components/TexturePattern';
import { getEventById, updateEvent, deleteEvent, deleteAllSalesForEvent, eventHasSales } from '../../../storage';
import { colors } from '../../../theme';
import * as ImagePicker from 'expo-image-picker';
import { persistReceiptPhoto, resolveStoredUri, deleteStoredFile } from '../../../utils/image';

export const EditEventScreen: React.FC<RootStackScreenProps<'EditEvent'>> = ({ 
  navigation, 
  route 
}) => {
  const { eventId } = route.params;
  const headerHeight = useHeaderHeight();
  const { t } = useTranslation();
  
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [boothFee, setBoothFee] = useState('');
  const [travelCost, setTravelCost] = useState('');
  const [suppliesCost, setSuppliesCost] = useState('');
  const [miscCost, setMiscCost] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLocked, setIsLocked] = useState(false);
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
              if (receiptPhotoUri) await deleteStoredFile(receiptPhotoUri);
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
              if (receiptPhotoUri) await deleteStoredFile(receiptPhotoUri);
              const relativePath = await persistReceiptPhoto(result.assets[0].uri);
              setReceiptPhotoUri(relativePath);
            }
          },
        },
        ...(receiptPhotoUri ? [{
          text: t('receipt.removeReceipt'),
          style: 'destructive' as const,
          onPress: async () => {
            await deleteStoredFile(receiptPhotoUri);
            setReceiptPhotoUri(null);
          },
        }] : []),
        { text: t('common.cancel'), style: 'cancel' as const },
      ]
    );
  };

  useEffect(() => {
    const event = getEventById(eventId);
    if (event) {
      setName(event.name);
      setDate(event.date);
      setLocation(event.location || '');
      setBoothFee(event.boothFee.toString());
      setTravelCost(event.travelCost.toString());
      setSuppliesCost(event.suppliesCost ? event.suppliesCost.toString() : '');
      setMiscCost(event.miscCost ? event.miscCost.toString() : '');
      setNotes(event.notes);
      setSelectedTags(event.tags || []);
      setSelectedWeather(event.weather || undefined);
      setReceiptPhotoUri(event.receiptPhotoUri || null);
      // Lock name/date if event has sales logged
      setIsLocked(eventHasSales(eventId));
    } else {
      Alert.alert(t('common.error'), t('editEvent.eventNotFound'));
      navigation.goBack();
    }
  }, [eventId, navigation]);

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

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      updateEvent({
        id: eventId,
        name: name.trim(),
        date,
        location: location.trim() || undefined,
        boothFee: parseFloat(boothFee) || 0,
        travelCost: parseFloat(travelCost) || 0,
        suppliesCost: parseFloat(suppliesCost) || 0,
        miscCost: parseFloat(miscCost) || 0,
        notes: notes.trim(),
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        weather: selectedWeather,
        receiptPhotoUri: receiptPhotoUri || undefined,
      });

      navigation.goBack();
    } catch (error) {
      Alert.alert(t('common.error'), t('editEvent.updateError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t('editEvent.deleteEvent'),
      t('editEvent.deleteEventConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            deleteAllSalesForEvent(eventId);
            deleteEvent(eventId);
            navigation.navigate('Main', { screen: 'Events' });
          },
        },
      ]
    );
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

            {isLocked && (
              <View className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <Text className="text-amber-800 text-sm">
                  {t('editEvent.lockedWarning')}
                </Text>
              </View>
            )}

            <InputField
              label={t('createEvent.eventName')}
              placeholder={t('createEvent.eventNamePlaceholder')}
              value={name}
              onChangeText={setName}
              error={errors.name}
              containerStyle={{ marginBottom: 16 }}
              editable={!isLocked}
              style={isLocked ? { color: '#9ca3af' } : undefined}
            />

            <InputField
              label={t('createEvent.date')}
              placeholder={t('createEvent.datePlaceholder')}
              value={date}
              onChangeText={setDate}
              error={errors.date}
              keyboardType="numeric"
              editable={!isLocked}
              style={isLocked ? { color: '#9ca3af' } : undefined}
              containerStyle={{ marginBottom: 16 }}
            />

            <InputField
              label={t('createEvent.location')}
              placeholder={t('createEvent.locationPlaceholder')}
              value={location}
              onChangeText={setLocation}
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
              {t('editEvent.notes')}
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
          <Card variant="elevated" padding="lg" className="mb-6">
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

          {/* Actions */}
          <PrimaryButton
            title={t('editEvent.saveChanges')}
            onPress={handleSave}
            loading={loading}
            className="mb-3"
          />

          <PrimaryButton
            title={t('editEvent.deleteEvent')}
            variant="danger"
            onPress={handleDelete}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
