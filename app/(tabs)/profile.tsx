
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { colors, commonStyles } from '@/styles/commonStyles';
import { Button } from '@/components/button';
import { IconSymbol } from '@/components/IconSymbol';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const { user, updateUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to change your profile photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await updateUser({ profilePhoto: result.assets[0].uri });
      Alert.alert('Success', 'Profile photo updated successfully!');
    }
  };

  const handleSaveChanges = async () => {
    try {
      const updates: any = {};
      
      if (editData.email !== user?.email) {
        updates.email = editData.email;
      }
      
      if (editData.phoneNumber !== user?.phoneNumber) {
        updates.phoneNumber = editData.phoneNumber;
      }
      
      if (editData.newPassword) {
        if (editData.newPassword !== editData.confirmPassword) {
          Alert.alert('Error', 'New passwords do not match');
          return;
        }
        
        if (editData.newPassword.length < 8) {
          Alert.alert('Error', 'Password must be at least 8 characters long');
          return;
        }
        
        // In a real app, you'd verify the current password
        updates.password = editData.newPassword;
      }
      
      if (Object.keys(updates).length > 0) {
        await updateUser(updates);
        Alert.alert('Success', 'Profile updated successfully!');
      }
      
      setIsEditing(false);
      setEditData({
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // In a real app, this would delete the account
            Alert.alert('Account Deleted', 'Your account has been deleted.');
            logout();
          },
        },
      ]
    );
  };

  if (!user) {
    return null;
  }

  return (
    <ScrollView style={commonStyles.wrapper} contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <IconSymbol 
            name={isEditing ? 'xmark' : 'pencil'} 
            size={20} 
            color={colors.primary} 
          />
        </TouchableOpacity>
      </View>

      {/* Profile Photo */}
      <View style={styles.photoSection}>
        <TouchableOpacity style={styles.photoContainer} onPress={handleImagePicker}>
          {user.profilePhoto ? (
            <Image source={{ uri: user.profilePhoto }} style={styles.profilePhoto} />
          ) : (
            <View style={styles.defaultPhoto}>
              <IconSymbol name="person.fill" size={48} color={colors.textSecondary} />
            </View>
          )}
          <View style={styles.photoEditIcon}>
            <IconSymbol name="camera.fill" size={16} color="white" />
          </View>
        </TouchableOpacity>
        <Text style={styles.photoLabel}>Tap to change photo</Text>
      </View>

      {/* Profile Information */}
      <View style={[commonStyles.card, styles.infoCard]}>
        <Text style={styles.cardTitle}>Personal Information</Text>
        
        {/* Non-editable fields */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>First Name</Text>
          <View style={styles.nonEditableField}>
            <Text style={styles.fieldValue}>{user.firstName}</Text>
            <Text style={styles.nonEditableNote}>Cannot be changed</Text>
          </View>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Last Name</Text>
          <View style={styles.nonEditableField}>
            <Text style={styles.fieldValue}>{user.lastName}</Text>
            <Text style={styles.nonEditableNote}>Cannot be changed</Text>
          </View>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Country</Text>
          <View style={styles.nonEditableField}>
            <Text style={styles.fieldValue}>{user.country}</Text>
            <Text style={styles.nonEditableNote}>Cannot be changed</Text>
          </View>
        </View>

        {/* Editable fields */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Email</Text>
          {isEditing ? (
            <TextInput
              style={commonStyles.input}
              value={editData.email}
              onChangeText={(text) => setEditData(prev => ({ ...prev, email: text }))}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          ) : (
            <Text style={styles.fieldValue}>{user.email}</Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Phone Number</Text>
          {isEditing ? (
            <TextInput
              style={commonStyles.input}
              value={editData.phoneNumber}
              onChangeText={(text) => setEditData(prev => ({ ...prev, phoneNumber: text }))}
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={styles.fieldValue}>{user.phoneNumber}</Text>
          )}
        </View>

        {/* Password change section */}
        {isEditing && (
          <>
            <View style={styles.passwordSection}>
              <Text style={styles.passwordSectionTitle}>Change Password</Text>
              
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Current Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[commonStyles.input, styles.passwordInput]}
                    value={editData.currentPassword}
                    onChangeText={(text) => setEditData(prev => ({ ...prev, currentPassword: text }))}
                    secureTextEntry={!showCurrentPassword}
                    placeholder="Enter current password"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    <IconSymbol
                      name={showCurrentPassword ? 'eye.slash' : 'eye'}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>New Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[commonStyles.input, styles.passwordInput]}
                    value={editData.newPassword}
                    onChangeText={(text) => setEditData(prev => ({ ...prev, newPassword: text }))}
                    secureTextEntry={!showNewPassword}
                    placeholder="Enter new password"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    <IconSymbol
                      name={showNewPassword ? 'eye.slash' : 'eye'}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Confirm New Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[commonStyles.input, styles.passwordInput]}
                    value={editData.confirmPassword}
                    onChangeText={(text) => setEditData(prev => ({ ...prev, confirmPassword: text }))}
                    secureTextEntry={!showConfirmPassword}
                    placeholder="Confirm new password"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <IconSymbol
                      name={showConfirmPassword ? 'eye.slash' : 'eye'}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
        )}

        {isEditing && (
          <Button 
            title="Save Changes"
            onPress={handleSaveChanges} 
            style={styles.saveButton}
            textStyle={styles.saveButtonText}
          />
        )}
      </View>

      {/* Account Actions */}
      <View style={[commonStyles.card, styles.actionsCard]}>
        <Text style={styles.cardTitle}>Account Actions</Text>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
          <IconSymbol name="arrow.right.square" size={24} color={colors.textSecondary} />
          <Text style={styles.actionText}>Sign Out</Text>
          <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleDeleteAccount}>
          <IconSymbol name="trash" size={24} color={colors.danger} />
          <Text style={[styles.actionText, { color: colors.danger }]}>Delete Account</Text>
          <IconSymbol name="chevron.right" size={16} color={colors.danger} />
        </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
  },
  editButton: {
    padding: 8,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  defaultPhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEditIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoCard: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  fieldValue: {
    fontSize: 16,
    color: colors.text,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
  },
  nonEditableField: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
  },
  nonEditableNote: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  passwordSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  passwordSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  actionsCard: {
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
});
