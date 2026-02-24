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
import { getQuickSaleItems, deleteQuickSaleItem } from '../../../storage';
import { QuickSaleItem } from '../../../types';
import { formatCurrency } from '../../../utils/currency';
import { colors } from '../../../theme';
import { MascotImages } from '../../../../assets';

const { width } = Dimensions.get('window');
const GRID_GAP = 4;
const NUM_COLUMNS = width >= 768 ? 5 : 3;
const ITEM_SIZE = (width - GRID_GAP * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

export const ProductsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [products, setProducts] = useState<QuickSaleItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  const loadProducts = () => {
    const items = getQuickSaleItems();
    setProducts(items);
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
      `Cost: ${formatCurrency(product.defaultCost)}\nPrice: ${formatCurrency(product.defaultPrice)}\nStock: ${product.stockCount ?? 'N/A'}`,
      [
        { text: 'Edit', onPress: () => handleProductPress(product) },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Delete Product', `Delete "${product.itemName}"?`, [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Delete', 
                style: 'destructive',
                onPress: () => {
                  deleteQuickSaleItem(product.id);
                  loadProducts();
                }
              }
            ]);
          }
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const renderProductItem = ({ item, index }: { item: QuickSaleItem; index: number }) => (
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
          borderWidth: 1,
          borderColor: colors.divider,
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

  const EmptyState = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
      <Image 
        source={MascotImages.lookPhone} 
        style={{ width: 120, height: 120, marginBottom: 24 }} 
        resizeMode="contain" 
      />
      <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: 8, textAlign: 'center' }}>
        No Products Yet
      </Text>
      <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>
        Snap a photo of each product, set your prices, and you're ready for 1-tap sales!
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
          Add First Product
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
          Products
        </Text>
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
        />
      )}
    </SafeAreaView>
  );
};
