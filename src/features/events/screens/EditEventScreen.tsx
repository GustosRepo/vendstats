import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../../../navigation/types';
import { InputField, PrimaryButton, Card } from '../../../components';
import { TexturePattern } from '../../../components/TexturePattern';
import { getEventById, updateEvent, deleteEvent, deleteAllSalesForEvent } from '../../../storage';
import { colors } from '../../../theme';

export const EditEventScreen: React.FC<RootStackScreenProps<'EditEvent'>> = ({ 
  navigation, 
  route 
}) => {
  const { eventId } = route.params;
  
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [boothFee, setBoothFee] = useState('');
  const [travelCost, setTravelCost] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const event = getEventById(eventId);
    if (event) {
      setName(event.name);
      setDate(event.date);
      setBoothFee(event.boothFee.toString());
      setTravelCost(event.travelCost.toString());
      setNotes(event.notes);
    } else {
      Alert.alert('Error', 'Event not found');
      navigation.goBack();
    }
  }, [eventId, navigation]);

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

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      updateEvent({
        id: eventId,
        name: name.trim(),
        date,
        boothFee: parseFloat(boothFee) || 0,
        travelCost: parseFloat(travelCost) || 0,
        notes: notes.trim(),
      });

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event? All sales data will also be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
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
              containerClassName="mb-4"
            />

            <InputField
              label="Date"
              placeholder="YYYY-MM-DD"
              value={date}
              onChangeText={setDate}
              error={errors.date}
              keyboardType="numeric"
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
              Notes
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
          <PrimaryButton
            title="Save Changes"
            onPress={handleSave}
            loading={loading}
            className="mb-3"
          />

          <PrimaryButton
            title="Delete Event"
            variant="danger"
            onPress={handleDelete}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
