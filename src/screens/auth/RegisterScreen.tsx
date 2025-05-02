import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, FONTS, SIZES, SPACING } from '../../constants/theme';
import Button from '../../components/Button';
import Input from '../../components/Input';

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const RegisterScreen = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (name: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (Object.values(formData).some(value => !value)) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (formData.password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const { confirmPassword, ...userData } = formData;
      await register(userData);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="First Name"
            placeholder="Enter your first name"
            leftIcon="account"
            value={formData.firstName}
            onChangeText={handleChange('firstName')}
          />

          <Input
            label="Last Name"
            placeholder="Enter your last name"
            leftIcon="account"
            value={formData.lastName}
            onChangeText={handleChange('lastName')}
          />

          <Input
            label="Email"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="email"
            value={formData.email}
            onChangeText={handleChange('email')}
          />

          <Input
            label="Phone Number"
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            leftIcon="phone"
            value={formData.phoneNumber}
            onChangeText={handleChange('phoneNumber')}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
            leftIcon="lock"
            value={formData.password}
            onChangeText={handleChange('password')}
          />

          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            secureTextEntry
            leftIcon="lock"
            value={formData.confirmPassword}
            onChangeText={handleChange('confirmPassword')}
          />

          <Button
            title="Sign Up"
            onPress={handleRegister}
            loading={loading}
            style={styles.button}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Button
            title="Sign In"
            variant="outline"
            size="small"
            onPress={() => navigation.navigate('Login')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.l,
  },
  header: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: SIZES.extraLarge,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: SIZES.font,
    fontFamily: FONTS.regular,
    color: COLORS.grey,
  },
  form: {
    marginBottom: SPACING.xl,
  },
  button: {
    marginTop: SPACING.m,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  footerText: {
    fontSize: SIZES.font,
    fontFamily: FONTS.regular,
    color: COLORS.grey,
  },
});

export default RegisterScreen; 