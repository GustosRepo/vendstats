import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  Dimensions, 
  Alert,
  FlatList 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { TexturePattern } from '../../../components/TexturePattern';
import { PressableScale, AnimatedListItem } from '../../../components/animations';
import { getQuickSaleItems, deleteQuickSaleItem, getLowStockThreshold } from '../../../storage';
import { hasPremiumAccess } from '../../../storage';
import { QuickSaleItem } from '../../../types';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../../utils/currency';
import { colors } from '../../../theme';
import { MascotImages } from '../../../../assets';

const { width } = Dimensions.get('window');
const GRID_GAP = 4;
const NUM_COLUMNS = width >= 768 ? 5 : 3;
const ITEM_SIZE = (width - GRID_GAP * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

export const ProductsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [products, setProducts] = useState<QuickSaleItem[]>([]);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [stockThreshold, setStockThreshold] = useState(5);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  const loadProducts = () => {
    const items = getQuickSaleItems();
    const threshold = getLowStockThreshold();
    setProducts(items);
    setStockThreshold(threshold);

    // Calculate stock alert counts (Pro only)
    if (hasPremiumAccess()) {
      const oos = items.filter(p => p.stockCount !== undefined && p.stockCount === 0).length;
      const low = items.filter(p => p.stockCount !== undefined && p.stockCount > 0 && p.stockCount <= threshold).length;
      setOutOfStockCount(oos);
      setLowStockCount(low);
    }
  };

  const handleAddProduct = () => {
    navigation.navigate('AddProduct');
  };

  const handleProductPress = (product: QuickSaleItem) => {
    navigation.navigate('EditProduct', { productId: product.id });
  };

  const handleProductLongPress = (product: QuickSaleItem) => {
    Alert.alert(
      product.itemName,
      `${t('items.cost')}: ${formatCurrency(product.defaultCost)}\n${t('items.price')}: ${formatCurrency(product.defaultPrice)}\n${t('items.onHand')}: ${product.stockCount ?? t('common.na')}`,
      [
        { text: t('common.edit'), onPress: () => handleProductPress(product) },
        { 
          text: t('common.delete'), 
          style: 'destructive',
          onPress: () => {
            Alert.alert(t('items.deleteItem'), t('items.deleteItemConfirm', { name: product.itemName }), [
              { text: t('common.cancel'), style: 'cancel' },
              { 
                text: t('common.delete'), 
                style: 'destructive',
                onPress: () => {
                  deleteQuickSaleItem(product.id);
                  loadProducts();
                }
              }
            ]);
          }
        },
        { text: t('common.cancel'), style: 'cancel' },
      ]
    );
  };

  const renderProductItem = ({ item, index }: { item: QuickSaleItem; index: number }) => {
    const isOutOfStock = item.stockCount !== undefined && item.stockCount === 0;
    const isLowStock = item.stockCount !== undefined && item.stockCount > 0 && item.stockCount <= stockThreshold;
    const borderColor = isOutOfStock ? colors.stockOut : isLowStock ? colors.stockLow : colors.divider;
    const borderW = (isOutOfStock || isLowStock) ? 2 : 1;

    return (
    <AnimatedListItem index={index} type="scale" delay={50}>
      <PressableScale
        onPress={() => handleProductPress(item)}
        onLongPress={() => handleProductLongPress(item)}
        scaleValue={0.92}
        style={{
          width: ITEM_SIZE,
          height: ITEM_SIZE,
          margin: GRID_GAP / 2,
          backgroundColor: colors.surface,
          borderRadius: 8,
          overflow: 'hidden',
          borderWidth: borderW,
          borderColor: borderColor,
        }}
      >
        {item.imageUri ? (
          <Image
            source={{ uri: item.imageUri }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        ) : (
          <View 
            style={{ 
              flex: 1, 
              backgroundColor: colors.copper + '20',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="cube-outline" size={32} color={colors.copper} />
          </View>
        )}
        
        {/* Price badge */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.65)',
            paddingVertical: 4,
            paddingHorizontal: 6,
          }}
        >
          <Text 
            style={{ 
              color: '#fff', 
              fontSize: 11, 
              fontWeight: '600',
            }}
            numberOfLines={1}
          >
            {item.itemName}
          </Text>
          <Text style={{ color: colors.success, fontSize: 12, fontWeight: '700' }}>
            {formatCurrency(item.defaultPrice)}
          </Text>
        </View>

        {/* Stock badge */}
        {item.stockCount !== undefined && (
          <View
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              backgroundColor: item.stockCount > 0 ? colors.primary : colors.error,
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '600' }}>
              {item.stockCount}
            </Text>
          </View>
        )}
      </PressableScale>
    </AnimatedListItem>
  );
  };

  const EmptyState = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
      <Image 
        source={MascotImages.lookPhone} 
        style={{ width: 120, height: 120, marginBottom: 24 }} 
        resizeMode="contain" 
      />
      <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: 8, textAlign: 'center' }}>
        {t('items.noItemsYet')}
      </Text>
      <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>
        {t('items.noItemsMessage')}
      </Text>
      <TouchableOpacity
        onPress={handleAddProduct}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.primary,
          paddingHorizontal: 24,
          paddingVertical: 14,
          borderRadius: 12,
        }}
      >
        <Ionicons name="camera" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
          {t('items.addFirstItem')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <TexturePattern />
      
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
        backgroundColor: colors.surface,
      }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.textPrimary }}>
          {t('items.title')}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {products.length > 0 && (
            <TouchableOpacity
              onPress={() => navigation.navigate('MenuDisplay')}
              style={{
                backgroundColor: colors.primaryLight,
                width: 40,
                height: 40,
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="storefront-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleAddProduct}
            style={{
              backgroundColor: colors.primary,
              width: 40,
              height: 40,
              borderRadius: 20,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {products.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={{ padding: GRID_GAP / 2, paddingBottom: 160 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            (outOfStockCount > 0 || lowStockCount > 0) ? (
              <View style={{
                flexDirection: 'row',
                marginHorizontal: GRID_GAP / 2,
                marginBottom: 8,
                gap: 8,
              }}>
                {outOfStockCount > 0 && (
                  <View style={{
                    flex: 1,
                    backgroundColor: colors.stockOutBg,
                    borderRadius: 12,
                    padding: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: colors.stockOut + '30',
                  }}>
                    <Ionicons name="close-circle" size={18} color={colors.stockOut} style={{ marginRight: 8 }} />
                    <View>
                      <Text style={{ fontSize: 18, fontWeight: '700', color: colors.stockOut }}>{outOfStockCount}</Text>
                      <Text style={{ fontSize: 11, color: colors.stockOut, fontWeight: '600' }}>{t('inventory.outOfStock')}</Text>
                    </View>
                  </View>
                )}
                {lowStockCount > 0 && (
                  <View style={{
                    flex: 1,
                    backgroundColor: colors.stockLowBg,
                    borderRadius: 12,
                    padding: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: colors.stockLow + '30',
                  }}>
                    <Ionicons name="warning" size={18} color={colors.stockLow} style={{ marginRight: 8 }} />
                    <View>
                      <Text style={{ fontSize: 18, fontWeight: '700', color: colors.stockLow }}>{lowStockCount}</Text>
                      <Text style={{ fontSize: 11, color: colors.stockLow, fontWeight: '600' }}>{t('inventory.lowStock')}</Text>
                    </View>
                  </View>
                )}
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};
