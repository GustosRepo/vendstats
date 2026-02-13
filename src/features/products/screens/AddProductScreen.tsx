import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { TexturePattern } from '../../../components/TexturePattern';
import { Card, InputField, PrimaryButton } from '../../../components';
import { addQuickSaleItem } from '../../../storage';
import { colors } from '../../../theme';

export const AddProductScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const headerHeight = useHeaderHeight();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [itemName, setItemName] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [stockCount, setStockCount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera access is required to take product photos');
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
      'Add Product Photo',
      'How would you like to add a photo?',
      [
        { text: 'Take Photo', onPress: handleTakePhoto },
        { text: 'Choose from Library', onPress: handlePickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSave = async () => {
    if (!itemName.trim()) {
      Alert.alert('Missing Info', 'Please enter a product name');
      return;
    }
    if (!sellPrice) {
      Alert.alert('Missing Info', 'Please enter a selling price');
      return;
    }

    setIsSubmitting(true);

    try {
      addQuickSaleItem({
        itemName: itemName.trim(),
        defaultPrice: parseFloat(sellPrice) || 0,
        defaultCost: parseFloat(costPrice) || 0,
        imageUri: imageUri || undefined,
        stockCount: stockCount ? parseInt(stockCount, 10) : undefined,
      });

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save product');
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
            aspectRatio: 1,
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
                source={{ uri: imageUri }}
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
                Tap to Add Photo
              </Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                Take a photo or choose from library
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Product Details */}
        <Card variant="elevated" padding="lg" className="mb-4">
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 16 }}>
            Product Details
          </Text>
          
          <InputField
            label="Product Name"
            value={itemName}
            onChangeText={setItemName}
            placeholder="e.g., Hot Dog, Lemonade, T-Shirt"
            autoCapitalize="words"
          />
        </Card>

        {/* Pricing Section */}
        <Card variant="elevated" padding="lg" className="mb-4">
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 16 }}>
            Pricing
          </Text>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <InputField
                label="Cost Price"
                value={costPrice}
                onChangeText={setCostPrice}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>
            <View className="flex-1">
              <InputField
                label="Sell Price"
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
                Profit per unit
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
                    {profitPercent}% margin
                  </Text>
                )}
              </View>
            </View>
          )}
        </Card>

        {/* Stock Section */}
        <Card variant="elevated" padding="lg" className="mb-6">
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 16 }}>
            Inventory (Optional)
          </Text>
          
          <InputField
            label="Starting Stock"
            value={stockCount}
            onChangeText={setStockCount}
            placeholder="How many do you have?"
            keyboardType="number-pad"

          />
          <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
            Leave blank if you're not tracking inventory
          </Text>
        </Card>

        {/* Save Button */}
        <PrimaryButton
          title={isSubmitting ? 'Saving...' : 'Add Product'}
          onPress={handleSave}
          disabled={isSubmitting}
        />
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
