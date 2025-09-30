
import { Button } from '@/components/button';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/app/integrations/supabase/client';
import React, { useState } from 'react';
import { router } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 15,
  },
  methodContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  methodTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 15,
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedMethod: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
    borderWidth: 2,
  },
  methodText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 10,
  },
  formContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    color: colors.text,
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  minimumText: {
    fontSize: 16,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
});

export default function WithdrawalModal() {
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const withdrawalMethods = [
    { id: 'bank_transfer', name: 'Bank Transfer', icon: 'building-columns' },
    { id: 'crypto_usdt', name: 'USDT (TRC-20)', icon: 'bitcoin-sign' },
    { id: 'crypto_btc', name: 'Bitcoin', icon: 'bitcoin-sign' },
    { id: 'crypto_eth', name: 'Ethereum (ERC-20)', icon: 'ethereum' },
    { id: 'paypal', name: 'PayPal', icon: 'paypal' },
  ];

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    setFormData({});
  };

  const renderMethodForm = () => {
    switch (selectedMethod) {
      case 'bank_transfer':
        return (
          <View>
            <Text style={styles.label}>Account Holder Name</Text>
            <TextInput
              style={styles.input}
              value={formData.accountHolderName || ''}
              onChangeText={(text) => setFormData({ ...formData, accountHolderName: text })}
              placeholder="Enter account holder name"
              placeholderTextColor={colors.textSecondary}
            />
            <Text style={styles.label}>Bank Name</Text>
            <TextInput
              style={styles.input}
              value={formData.bankName || ''}
              onChangeText={(text) => setFormData({ ...formData, bankName: text })}
              placeholder="Enter bank name"
              placeholderTextColor={colors.textSecondary}
            />
            <Text style={styles.label}>Account Number</Text>
            <TextInput
              style={styles.input}
              value={formData.accountNumber || ''}
              onChangeText={(text) => setFormData({ ...formData, accountNumber: text })}
              placeholder="Enter account number"
              placeholderTextColor={colors.textSecondary}
            />
            <Text style={styles.label}>Routing Number</Text>
            <TextInput
              style={styles.input}
              value={formData.routingNumber || ''}
              onChangeText={(text) => setFormData({ ...formData, routingNumber: text })}
              placeholder="Enter routing number"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        );
      case 'crypto_usdt':
      case 'crypto_btc':
      case 'crypto_eth':
        return (
          <View>
            <Text style={styles.label}>Wallet Address</Text>
            <TextInput
              style={styles.input}
              value={formData.walletAddress || ''}
              onChangeText={(text) => setFormData({ ...formData, walletAddress: text })}
              placeholder="Enter wallet address"
              placeholderTextColor={colors.textSecondary}
            />
            <Text style={styles.label}>Network: {
              selectedMethod === 'crypto_usdt' ? 'TRC-20' :
              selectedMethod === 'crypto_btc' ? 'Bitcoin' : 'ERC-20'
            }</Text>
          </View>
        );
      case 'paypal':
        return (
          <View>
            <Text style={styles.label}>PayPal Email</Text>
            <TextInput
              style={styles.input}
              value={formData.email || ''}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="Enter PayPal email"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
            />
          </View>
        );
      default:
        return null;
    }
  };

  const handleWithdraw = async () => {
    if (!selectedMethod) {
      Alert.alert('Error', 'Please select a withdrawal method');
      return;
    }

    if (!amount || parseFloat(amount) < 10) {
      Alert.alert('Error', 'Minimum withdrawal amount is $10');
      return;
    }

    if (!user || parseFloat(amount) > user.walletBalance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    // Validate form data based on method
    const requiredFields = {
      bank_transfer: ['accountHolderName', 'bankName', 'accountNumber', 'routingNumber'],
      crypto_usdt: ['walletAddress'],
      crypto_btc: ['walletAddress'],
      crypto_eth: ['walletAddress'],
      paypal: ['email'],
    };

    const required = requiredFields[selectedMethod as keyof typeof requiredFields] || [];
    const missingFields = required.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);

      // Insert withdrawal request
      const { error } = await supabase
        .from('withdrawals')
        .insert({
          user_id: user.id,
          amount: parseFloat(amount),
          method: selectedMethod,
          details: formData,
        });

      if (error) {
        console.error('Error submitting withdrawal:', error);
        Alert.alert('Error', 'Failed to submit withdrawal request');
        return;
      }

      Alert.alert(
        'Withdrawal Request Submitted',
        'Your withdrawal request has been submitted and will be processed within 3-5 business days. You will receive an email confirmation shortly.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Withdraw Funds</Text>
      </View>

      <Text style={styles.minimumText}>Minimum withdrawal: $10</Text>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Amount to Withdraw</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder="Enter amount"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />
        <Text style={styles.label}>Available Balance: ${user?.walletBalance.toFixed(2) || '0.00'}</Text>
      </View>

      <View style={styles.methodContainer}>
        <Text style={styles.methodTitle}>Select Withdrawal Method</Text>
        {withdrawalMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodButton,
              selectedMethod === method.id && styles.selectedMethod,
            ]}
            onPress={() => handleMethodSelect(method.id)}
          >
            <IconSymbol name={method.icon as any} size={20} color={colors.primary} />
            <Text style={styles.methodText}>{method.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedMethod && (
        <View style={styles.formContainer}>
          <Text style={styles.methodTitle}>Payment Details</Text>
          {renderMethodForm()}
        </View>
      )}

      <Text style={styles.infoText}>
        All withdrawals are processed manually and will take 3-5 business days to complete. 
        You will receive an email confirmation once your withdrawal has been processed.
      </Text>

      <Button
        title={isSubmitting ? "Submitting..." : "Submit Withdrawal Request"}
        onPress={handleWithdraw}
        disabled={!selectedMethod || !amount || isSubmitting}
      />
    </ScrollView>
  );
}
