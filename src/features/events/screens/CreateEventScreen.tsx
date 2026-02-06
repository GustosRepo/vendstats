import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../../../navigation/types';
import { InputField, PrimaryButton, Card } from '../../../components';
import { TexturePattern } from '../../../components/TexturePattern';
import { createEvent } from '../../../storage';
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
          <Card variant="elevated" padding="lg" className="mb-6">
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
