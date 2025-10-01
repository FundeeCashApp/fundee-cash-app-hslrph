
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { Button } from '@/components/button';
import { IconSymbol } from '@/components/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, '#9c5dff', '#7c3aed']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Logo/Icon Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <IconSymbol name="dollarsign.circle.fill" size={80} color="white" />
            </View>
            <Text style={styles.appName}>Fundee Cash</Text>
            <Text style={styles.tagline}>Win Big, Play Daily</Text>
          </View>

          {/* Features Section */}
          <View style={styles.featuresSection}>
            <View style={styles.feature}>
              <IconSymbol name="ticket.fill" size={24} color="white" />
              <Text style={styles.featureText}>Buy tickets for daily draws</Text>
            </View>
            <View style={styles.feature}>
              <IconSymbol name="tv.fill" size={24} color="white" />
              <Text style={styles.featureText}>Watch ads to earn free tickets</Text>
            </View>
            <View style={styles.feature}>
              <IconSymbol name="person.2.fill" size={24} color="white" />
              <Text style={styles.featureText}>Refer friends and earn rewards</Text>
            </View>
            <View style={styles.feature}>
              <IconSymbol name="banknote.fill" size={24} color="white" />
              <Text style={styles.featureText}>Win up to $100 daily</Text>
            </View>
          </View>

          {/* Prize Info */}
          <View style={styles.prizeInfo}>
            <Text style={styles.prizeTitle}>Daily Prizes</Text>
            <View style={styles.prizeRow}>
              <Text style={styles.prizeText}>10 winners × $100</Text>
              <Text style={styles.prizeText}>6 winners × $50</Text>
              <Text style={styles.prizeText}>20 winners × $10</Text>
            </View>
            <Text style={styles.prizeNote}>
              Prizes increase as more members join!
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonSection}>
            <Button
              onPress={() => router.push('/auth/signup')}
              style={styles.signupButton}
            >
              <Text style={styles.signupButtonText}>Get Started</Text>
            </Button>
            
            <TouchableOpacity
              onPress={() => router.push('/auth/login')}
              style={styles.loginButton}
            >
              <Text style={styles.loginButtonText}>Already have an account? Sign In</Text>
            </TouchableOpacity>
          </View>

          {/* Draw Time Info */}
          <View style={styles.drawInfo}>
            <IconSymbol name="clock.fill" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.drawText}>Daily draw at 10:00 PM ET</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  featuresSection: {
    marginVertical: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  featureText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 16,
    fontWeight: '500',
  },
  prizeInfo: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
  },
  prizeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
  },
  prizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  prizeText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  prizeNote: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonSection: {
    marginTop: 20,
  },
  signupButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
  },
  signupButtonText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  loginButton: {
    paddingVertical: 12,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  drawInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  drawText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 8,
    fontWeight: '500',
  },
});
