import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert, Platform, KeyboardAvoidingView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { TexturePattern } from '../../../components/TexturePattern';
import { Card, InputField, PrimaryButton } from '../../../components';
import { addQuickSaleItem } from '../../../storage';
import { canAddItem, getRemainingFreeItems } from '../../../storage';
import { colors } from '../../../theme';
import { Ingredient } from '../../../types';
import { persistProductImage, resolveProductImageUri } from '../../../utils/image';

export const AddProductScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const headerHeight = useHeaderHeight();
  const { t } = useTranslation();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [itemName, setItemName] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [stockCount, setStockCount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ingredients, setIngredients] = useState<{ name: string; cost: string }[]>([]);
  const [showIngredients, setShowIngredients] = useState(false);

  const requestPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('addItem.permissionNeeded'), t('addItem.cameraPermission'));
        return false;
      }
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleShowImagePicker = () => {
    Alert.alert(
      t('addItem.addPhoto'),
      t('addItem.addPhotoMessage'),
      [
        { text: t('addItem.takePhoto'), onPress: handleTakePhoto },
        { text: t('addItem.chooseFromLibrary'), onPress: handlePickImage },
        { text: t('common.cancel'), style: 'cancel' },
      ]
    );
  };

  const addIngredient = () => {
    setIngredients(prev => [...prev, { name: '', cost: '' }]);
  };

  const updateIngredient = (index: number, field: 'name' | 'cost', value: string) => {
    setIngredients(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeIngredient = (index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const ingredientTotal = ingredients.reduce((sum, ing) => sum + (parseFloat(ing.cost) || 0), 0);

  const applyIngredientCost = () => {
    setCostPrice(ingredientTotal.toFixed(2));
  };

  const handleSave = async () => {
    if (!itemName.trim()) {
      Alert.alert(t('addItem.missingInfo'), t('addItem.enterItemName'));
      return;
    }
    if (!sellPrice) {
      Alert.alert(t('addItem.missingInfo'), t('addItem.enterSellingPrice'));
      return;
    }

    // Check item limit for free users
    if (!canAddItem()) {
      navigation.navigate('Paywall');
      return;
    }

    setIsSubmitting(true);

    try {
      // Persist image to documents directory so it survives app updates
      const persistedUri = imageUri ? await persistProductImage(imageUri) : undefined;

      const parsedIngredients: Ingredient[] = ingredients
        .filter(ing => ing.name.trim() && parseFloat(ing.cost) > 0)
        .map(ing => ({ name: ing.name.trim(), cost: parseFloat(ing.cost) || 0 }));

      addQuickSaleItem({
        itemName: itemName.trim(),
        defaultPrice: parseFloat(sellPrice) || 0,
        defaultCost: parseFloat(costPrice) || 0,
        imageUri: persistedUri,
        stockCount: stockCount ? parseInt(stockCount, 10) : undefined,
        ingredients: parsedIngredients.length > 0 ? parsedIngredients : undefined,
      });

      navigation.goBack();
    } catch (error) {
      Alert.alert(t('common.error'), t('addItem.saveError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const profit = (parseFloat(sellPrice) || 0) - (parseFloat(costPrice) || 0);
  const profitPercent = (parseFloat(costPrice) || 0) > 0 
    ? ((profit / parseFloat(costPrice)) * 100).toFixed(0) 
    : '—';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
      <TexturePattern />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={headerHeight}
      >
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Photo Section - Instagram Style */}
        <TouchableOpacity
          onPress={handleShowImagePicker}
          activeOpacity={0.9}
          style={{
            width: '100%',
            height: Math.min(Dimensions.get('window').width * 0.9, 320),
            backgroundColor: colors.surface,
            borderRadius: 16,
            borderWidth: 2,
            borderColor: imageUri ? colors.primary : colors.divider,
            borderStyle: imageUri ? 'solid' : 'dashed',
            overflow: 'hidden',
            marginBottom: 24,
          }}
        >
          {imageUri ? (
            <>
              <Image
                source={{ uri: resolveProductImageUri(imageUri) }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
              <View
                style={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  padding: 10,
                  borderRadius: 20,
                }}
              >
                <Ionicons name="camera" size={24} color="#fff" />
              </View>
            </>
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: colors.copper + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <Ionicons name="camera" size={36} color={colors.copper} />
              </View>
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginBottom: 4 }}>
                {t('addItem.tapToAddPhoto')}
              </Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                {t('addItem.tapToAddPhotoSubtitle')}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Product Details */}
        <Card variant="elevated" padding="lg" className="mb-4">
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 16 }}>
            {t('addItem.itemDetails')}
          </Text>
          
          <InputField
            label={t('addItem.itemName')}
            value={itemName}
            onChangeText={setItemName}
            placeholder={t('addItem.itemNamePlaceholder')}
            autoCapitalize="words"
          />
        </Card>

        {/* Pricing Section */}
        <Card variant="elevated" padding="lg" className="mb-4">
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 16 }}>
            {t('addItem.pricing')}
          </Text>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <InputField
                label={t('addItem.costPrice')}
                value={costPrice}
                onChangeText={setCostPrice}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>
            <View className="flex-1">
              <InputField
                label={t('addItem.sellPrice')}
                value={sellPrice}
                onChangeText={setSellPrice}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Profit Preview */}
          {(costPrice || sellPrice) && (
            <View 
              style={{ 
                marginTop: 16, 
                padding: 12, 
                backgroundColor: profit >= 0 ? colors.success + '15' : colors.error + '15',
                borderRadius: 8,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                {t('addItem.profitPerUnit')}
              </Text>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ 
                  color: profit >= 0 ? colors.success : colors.error, 
                  fontWeight: '700',
                  fontSize: 18,
                }}>
                  ${profit.toFixed(2)}
                </Text>
                {profitPercent !== '—' && (
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                    {profitPercent}{t('addItem.margin')}
                  </Text>
                )}
              </View>
            </View>
          )}
        </Card>

        {/* Ingredient Cost Calculator */}
        <Card variant="elevated" padding="lg" className="mb-4">
          <TouchableOpacity
            onPress={() => setShowIngredients(!showIngredients)}
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="calculator-outline" size={20} color={colors.primary} />
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>
                {t('ingredients.title')}
              </Text>
            </View>
            <Ionicons name={showIngredients ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {showIngredients && (
            <View style={{ marginTop: 16 }}>
              <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 12 }}>
                {t('ingredients.subtitle')}
              </Text>

              {ingredients.map((ing, index) => (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <View style={{ flex: 2 }}>
                    <InputField
                      placeholder={t('ingredients.namePlaceholder')}
                      value={ing.name}
                      onChangeText={(val) => updateIngredient(index, 'name', val)}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <InputField
                      placeholder="0.00"
                      value={ing.cost}
                      onChangeText={(val) => updateIngredient(index, 'cost', val)}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <TouchableOpacity onPress={() => removeIngredient(index)} style={{ padding: 4 }}>
                    <Ionicons name="close-circle" size={22} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                onPress={addIngredient}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingVertical: 10,
                }}
              >
                <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 14 }}>
                  {t('ingredients.addIngredient')}
                </Text>
              </TouchableOpacity>

              {ingredients.length > 0 && ingredientTotal > 0 && (
                <View style={{
                  marginTop: 12,
                  padding: 12,
                  backgroundColor: colors.primary + '12',
                  borderRadius: 10,
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>
                      {t('ingredients.totalCost')}
                    </Text>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: colors.primary }}>
                      ${ingredientTotal.toFixed(2)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={applyIngredientCost}
                    style={{
                      marginTop: 10,
                      backgroundColor: colors.primary,
                      paddingVertical: 8,
                      borderRadius: 8,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>
                      {t('ingredients.applyAsCost')}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </Card>

        {/* Stock Section */}
        <Card variant="elevated" padding="lg" className="mb-6">
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 16 }}>
            {t('addItem.inventoryOptional')}
          </Text>
          
          <InputField
            label={t('addItem.startingCount')}
            value={stockCount}
            onChangeText={setStockCount}
            placeholder={t('addItem.howManyDoYouHave')}
            keyboardType="number-pad"

          />
          <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
            {t('addItem.leaveBlankIfNotTracking')}
          </Text>
        </Card>

        {/* Save Button */}
        <PrimaryButton
          title={isSubmitting ? t('common.saving') : t('addItem.addItemButton')}
          onPress={handleSave}
          disabled={isSubmitting}
        />

        {/* Cancel Button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ alignItems: 'center', paddingVertical: 14, marginTop: 4 }}
        >
          <Text style={{ fontSize: 16, fontWeight: '500', color: colors.textSecondary }}>
            {t('common.cancel')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
