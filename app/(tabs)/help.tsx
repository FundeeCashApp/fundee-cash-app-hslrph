
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { colors, commonStyles } from '@/styles/commonStyles';
import { Button } from '@/components/button';
import { IconSymbol } from '@/components/IconSymbol';
import { faqs } from '@/data/faqs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/app/integrations/supabase/client';

export default function HelpScreen() {
  const { user } = useAuth();
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [supportForm, setSupportForm] = useState({
    email: user?.email || '',
    subject: '',
    message: '',
  });
  const [showSupportForm, setShowSupportForm] = useState(false);

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleSupportSubmit = async () => {
    if (!supportForm.email || !supportForm.subject || !supportForm.message) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user?.id || null,
          email: supportForm.email,
          subject: supportForm.subject,
          message: supportForm.message,
        });

      if (error) {
        console.error('Error submitting support ticket:', error);
        Alert.alert('Error', 'Failed to submit support request');
        return;
      }

      Alert.alert(
        'Support Request Sent',
        'Thank you for contacting us. We will get back to you within 24 hours.',
        [{ text: 'OK', onPress: () => {
          setSupportForm({ email: user?.email || '', subject: '', message: '' });
          setShowSupportForm(false);
        }}]
      );
    } catch (error) {
      console.error('Error submitting support ticket:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const openTermsAndConditions = () => {
    // In a real app, this would open a web view or navigate to terms page
    Alert.alert(
      'Terms and Conditions',
      'This would open the full terms and conditions document in a web view.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Web', onPress: () => Linking.openURL('https://fundeecash.com/terms') },
      ]
    );
  };

  const categories = [...new Set(faqs.map(faq => faq.category))];

  return (
    <ScrollView style={commonStyles.wrapper} contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Help & Support</Text>
        <Text style={styles.subtitle}>Find answers to common questions</Text>
      </View>

      {/* Quick Actions */}
      <View style={[commonStyles.card, styles.quickActionsCard]}>
        <TouchableOpacity style={styles.quickAction} onPress={openTermsAndConditions}>
          <IconSymbol name="doc.text" size={24} color={colors.primary} />
          <Text style={styles.quickActionText}>Terms & Conditions</Text>
          <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.quickAction} 
          onPress={() => setShowSupportForm(!showSupportForm)}
        >
          <IconSymbol name="envelope" size={24} color={colors.primary} />
          <Text style={styles.quickActionText}>Contact Support</Text>
          <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Support Form */}
      {showSupportForm && (
        <View style={[commonStyles.card, styles.supportFormCard]}>
          <Text style={styles.cardTitle}>Contact Support</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={commonStyles.input}
              value={supportForm.email}
              onChangeText={(text) => setSupportForm(prev => ({ ...prev, email: text }))}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Subject</Text>
            <TextInput
              style={commonStyles.input}
              value={supportForm.subject}
              onChangeText={(text) => setSupportForm(prev => ({ ...prev, subject: text }))}
              placeholder="Brief description of your issue"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Message</Text>
            <TextInput
              style={[commonStyles.input, styles.messageInput]}
              value={supportForm.message}
              onChangeText={(text) => setSupportForm(prev => ({ ...prev, message: text }))}
              placeholder="Describe your issue in detail"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.formButtons}>
            <Button
              title="Cancel"
              onPress={() => setShowSupportForm(false)}
              style={[styles.formButton, styles.cancelButton]}
              textStyle={styles.cancelButtonText}
            />
            <Button 
              title="Send Message"
              onPress={handleSupportSubmit} 
              style={[styles.formButton, styles.submitButton]}
              textStyle={styles.submitButtonText}
            />
          </View>
        </View>
      )}

      {/* FAQ Categories */}
      {categories.map((category) => (
        <View key={category} style={[commonStyles.card, styles.categoryCard]}>
          <Text style={styles.categoryTitle}>{category}</Text>
          
          {faqs
            .filter(faq => faq.category === category)
            .map((faq) => (
              <View key={faq.id} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleFAQ(faq.id)}
                >
                  <Text style={styles.questionText}>{faq.question}</Text>
                  <IconSymbol
                    name={expandedFAQ === faq.id ? 'chevron.up' : 'chevron.down'}
                    size={16}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
                
                {expandedFAQ === faq.id && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.answerText}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            ))}
        </View>
      ))}

      {/* Contact Information */}
      <View style={[commonStyles.card, styles.contactCard]}>
        <Text style={styles.cardTitle}>Still Need Help?</Text>
        <Text style={styles.contactDescription}>
          If you can&apos;t find the answer you&apos;re looking for, don&apos;t hesitate to reach out to our support team.
        </Text>
        
        <View style={styles.contactMethods}>
          <View style={styles.contactMethod}>
            <IconSymbol name="envelope" size={20} color={colors.primary} />
            <Text style={styles.contactMethodText}>support@fundeecash.com</Text>
          </View>
          
          <View style={styles.contactMethod}>
            <IconSymbol name="clock" size={20} color={colors.primary} />
            <Text style={styles.contactMethodText}>Response time: 24 hours</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  quickActionsCard: {
    marginBottom: 20,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  quickActionText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  supportFormCard: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  messageInput: {
    height: 100,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  formButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.backgroundAlt,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  categoryCard: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  questionText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    paddingBottom: 16,
    paddingLeft: 0,
  },
  answerText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  contactCard: {
    marginBottom: 20,
  },
  contactDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  contactMethods: {
    gap: 12,
  },
  contactMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactMethodText: {
    fontSize: 14,
    color: colors.text,
  },
});
