import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { getQrCodeUri, setQrCodeUri } from '../storage/settings';
import { colors, shadows, radius } from '../theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const QrCodeFab: React.FC = () => {
  const { t } = useTranslation();
  const [qrUri, setQrUri] = useState<string | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);

  // Reload QR URI when screen focuses
  useFocusEffect(
    useCallback(() => {
      setQrUri(getQrCodeUri());
    }, [])
  );

  const handleFabPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (qrUri) {
      setShowModal(true);
    } else {
      setShowSetupModal(true);
    }
  };

  const persistImage = async (pickerUri: string): Promise<string> => {
    const dir = `${FileSystem.documentDirectory}qr/`;
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }
    const filename = `payment_qr_${Date.now()}.jpg`;
    const destUri = `${dir}${filename}`;
    await FileSystem.copyAsync({ from: pickerUri, to: destUri });
    return destUri;
  };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('qrCode.permissionNeeded'), t('qrCode.cameraPermission'));
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      const savedUri = await persistImage(result.assets[0].uri);
      setQrCodeUri(savedUri);
      setQrUri(savedUri);
      setShowSetupModal(false);
      setShowModal(true);
    }
  };

  const pickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      const savedUri = await persistImage(result.assets[0].uri);
      setQrCodeUri(savedUri);
      setQrUri(savedUri);
      setShowSetupModal(false);
      setShowModal(true);
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(t('qrCode.selectQrImage'), undefined, [
      { text: t('qrCode.takePhoto'), onPress: pickFromCamera },
      { text: t('qrCode.chooseFromLibrary'), onPress: pickFromLibrary },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  const handleRemoveQr = () => {
    Alert.alert(t('qrCode.removeConfirm'), t('qrCode.removeMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          // Delete file
          if (qrUri) {
            try { await FileSystem.deleteAsync(qrUri, { idempotent: true }); } catch {}
          }
          setQrCodeUri(undefined);
          setQrUri(undefined);
          setShowModal(false);
        },
      },
    ]);
  };

  return (
    <>
      {/* Floating Button — right side, above tab bar */}
      <TouchableOpacity
        onPress={handleFabPress}
        activeOpacity={0.85}
        style={[
          {
            position: 'absolute',
            right: 16,
            bottom: 100,
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
          },
          shadows.lg,
        ]}
      >
        <Ionicons name="qr-code-outline" size={24} color="#FFF" />
      </TouchableOpacity>

      {/* QR Display Modal (fullscreen, dark bg to let customer scan) */}
      <Modal visible={showModal} animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center' }}>
          {/* Close button */}
          <TouchableOpacity
            onPress={() => setShowModal(false)}
            style={{ position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, right: 20, zIndex: 10 }}
          >
            <Ionicons name="close-circle" size={36} color="#fff" />
          </TouchableOpacity>

          {/* Title */}
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 24, letterSpacing: -0.3 }}>
            {t('qrCode.title')}
          </Text>

          {/* QR Image — big and bright white bg */}
          {qrUri && (
            <View style={{ backgroundColor: '#fff', borderRadius: radius.xl, padding: 16, ...shadows.lg }}>
              <Image
                source={{ uri: qrUri }}
                style={{ width: screenWidth * 0.72, height: screenWidth * 0.72 }}
                resizeMode="contain"
              />
            </View>
          )}

          {/* Action buttons below QR */}
          <View style={{ flexDirection: 'row', marginTop: 32, gap: 16 }}>
            <TouchableOpacity
              onPress={showImagePickerOptions}
              style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: radius.full, backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
              <Ionicons name="camera-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>{t('qrCode.changeQr')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleRemoveQr}
              style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: radius.full, backgroundColor: 'rgba(239,68,68,0.25)' }}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" style={{ marginRight: 8 }} />
              <Text style={{ color: '#EF4444', fontWeight: '600', fontSize: 14 }}>{t('qrCode.removeQr')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Setup Modal (no QR set yet) */}
      <Modal visible={showSetupModal} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowSetupModal(false)}
            style={{ flex: 1 }}
          />
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, paddingBottom: Platform.OS === 'ios' ? 48 : 28 }}>
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.divider, marginBottom: 20 }} />
              <Ionicons name="qr-code" size={48} color={colors.primary} style={{ marginBottom: 16 }} />
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: 8, textAlign: 'center' }}>
                {t('qrCode.setup')}
              </Text>
              <Text style={{ fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 }}>
                {t('qrCode.setupMessage')}
              </Text>
            </View>

            {/* Camera option */}
            <TouchableOpacity
              onPress={pickFromCamera}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.primary,
                borderRadius: radius.full,
                paddingVertical: 16,
                paddingHorizontal: 24,
                marginBottom: 12,
                justifyContent: 'center',
              }}
            >
              <Ionicons name="camera-outline" size={20} color="#fff" style={{ marginRight: 10 }} />
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>{t('qrCode.takePhoto')}</Text>
            </TouchableOpacity>

            {/* Library option */}
            <TouchableOpacity
              onPress={pickFromLibrary}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.primaryLight,
                borderRadius: radius.full,
                paddingVertical: 16,
                paddingHorizontal: 24,
                marginBottom: 12,
                justifyContent: 'center',
              }}
            >
              <Ionicons name="images-outline" size={20} color={colors.primary} style={{ marginRight: 10 }} />
              <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 16 }}>{t('qrCode.chooseFromLibrary')}</Text>
            </TouchableOpacity>

            {/* Cancel */}
            <TouchableOpacity
              onPress={() => setShowSetupModal(false)}
              style={{ alignItems: 'center', paddingVertical: 14 }}
            >
              <Text style={{ color: colors.textSecondary, fontWeight: '600', fontSize: 16 }}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};
