import React, { useRef, useCallback, useState } from 'react';
import { View, Text, ScrollView, Image, Share, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { RootStackScreenProps } from '../../../navigation/types';
import { TexturePattern } from '../../../components/TexturePattern';
import { Card, PrimaryButton } from '../../../components';
import { getQuickSaleItems } from '../../../storage';
import { formatCurrency } from '../../../utils/currency';
import { QuickSaleItem } from '../../../types';
import { colors, shadows, radius } from '../../../theme';

export const MenuDisplayScreen: React.FC<RootStackScreenProps<'MenuDisplay'>> = ({
  navigation,
}) => {
  const { t } = useTranslation();
  const viewShotRef = useRef<ViewShot>(null);
  const [products, setProducts] = useState<QuickSaleItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      const items = getQuickSaleItems();
      setProducts(items);
    }, [])
  );

  const handleShareText = async () => {
    if (products.length === 0) return;

    const lines = products.map(p => `• ${p.itemName}  —  ${formatCurrency(p.defaultPrice)}`);
    const menu = [
      `�️ ${t('menu.menuTitle')}`,
      '',
      ...lines,
      '',
      `— ${t('menu.poweredBy')} VendStats`,
    ].join('\n');

    try {
      await Share.share({ message: menu });
    } catch {}
  };

  const handleShareImage = async () => {
    if (products.length === 0 || !viewShotRef.current) return;

    try {
      const capture = viewShotRef.current.capture;
      if (!capture) return;
      const uri = await capture();

      // Copy to shareable location
      const dest = `${FileSystem.cacheDirectory}vendstats-menu-${Date.now()}.png`;
      await FileSystem.copyAsync({ from: uri, to: dest });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(dest, {
          mimeType: 'image/png',
          dialogTitle: t('menu.shareMenu'),
          UTI: 'public.png',
        });
      } else {
        Alert.alert(t('menu.shareMenu'), t('menu.sharingNotAvailable'));
      }
    } catch (e) {
      console.error('Menu share error:', e);
      // Fallback to text share
      handleShareText();
    }
  };

  if (products.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
        <TexturePattern />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
          <Ionicons name="restaurant-outline" size={48} color={colors.textMuted} />
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginTop: 16, textAlign: 'center' }}>
            {t('menu.noItems')}
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 8, textAlign: 'center' }}>
            {t('menu.noItemsMessage')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
      <TexturePattern />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Capturable Menu Card */}
        <ViewShot
          ref={viewShotRef}
          options={{ format: 'png', quality: 1.0, result: 'tmpfile' }}
          style={{ margin: 20 }}
        >
          <View style={[{
            backgroundColor: colors.surface,
            borderRadius: radius.xl,
            padding: 24,
            overflow: 'hidden',
          }, shadows.lg]}>
            {/* Menu Header */}
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Text style={{
                fontSize: 24,
                fontWeight: '800',
                color: colors.textPrimary,
                letterSpacing: -0.5,
              }}>
                🛍️ {t('menu.menuTitle')}
              </Text>
              <View style={{
                width: 40,
                height: 3,
                backgroundColor: colors.primary,
                borderRadius: 2,
                marginTop: 8,
              }} />
            </View>

            {/* Menu Items */}
            {products.map((product, index) => (
              <View
                key={product.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 14,
                  borderBottomWidth: index < products.length - 1 ? 1 : 0,
                  borderBottomColor: colors.divider,
                }}
              >
                {/* Product Image */}
                {product.imageUri ? (
                  <Image
                    source={{ uri: product.imageUri }}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 10,
                      marginRight: 14,
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 10,
                      backgroundColor: colors.copper + '20',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 14,
                    }}
                  >
                    <Ionicons name="cube-outline" size={24} color={colors.copper} />
                  </View>
                )}

                {/* Item Info */}
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: colors.textPrimary,
                    }}
                    numberOfLines={2}
                  >
                    {product.itemName}
                  </Text>
                  {product.stockCount !== undefined && product.stockCount > 0 && (
                    <Text style={{
                      fontSize: 12,
                      color: colors.textTertiary,
                      marginTop: 2,
                    }}>
                      {t('menu.inStock')}
                    </Text>
                  )}
                  {product.stockCount !== undefined && product.stockCount === 0 && (
                    <Text style={{
                      fontSize: 12,
                      color: colors.error,
                      fontWeight: '600',
                      marginTop: 2,
                    }}>
                      {t('menu.soldOut')}
                    </Text>
                  )}
                </View>

                {/* Price */}
                <View style={{
                  backgroundColor: colors.primaryLight,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: colors.primary,
                  }}>
                    {formatCurrency(product.defaultPrice)}
                  </Text>
                </View>
              </View>
            ))}

            {/* Footer */}
            <View style={{ alignItems: 'center', marginTop: 16 }}>
              <Text style={{ fontSize: 11, color: colors.textMuted }}>
                {t('menu.poweredBy')} VendStats
              </Text>
            </View>
          </View>
        </ViewShot>

        {/* Share Buttons */}
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          <PrimaryButton
            title={t('menu.shareAsImage')}
            onPress={handleShareImage}
            size="lg"
          />
          <PrimaryButton
            title={t('menu.shareAsText')}
            variant="secondary"
            onPress={handleShareText}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
