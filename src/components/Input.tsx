import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, SIZES } from '../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  secureTextEntry,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error && styles.inputError]}>
        {leftIcon && (
          <Icon name={leftIcon} size={20} color={COLORS.grey} style={styles.leftIcon} />
        )}
        <TextInput
          style={[styles.input, leftIcon && styles.inputWithLeftIcon]}
          placeholderTextColor={COLORS.grey}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...props}
        />
        {(rightIcon || secureTextEntry) && (
          <TouchableOpacity
            onPress={secureTextEntry ? togglePasswordVisibility : onRightIconPress}
            style={styles.rightIcon}
          >
            <Icon
              name={secureTextEntry ? (isPasswordVisible ? 'eye-off' : 'eye') : rightIcon!}
              size={20}
              color={COLORS.grey}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.medium,
  },
  label: {
    fontSize: SIZES.font,
    fontFamily: FONTS.medium,
    color: COLORS.black,
    marginBottom: SIZES.base,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGrey,
    borderRadius: SIZES.base,
    backgroundColor: COLORS.white,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: SIZES.medium,
    fontSize: SIZES.font,
    fontFamily: FONTS.regular,
    color: COLORS.black,
  },
  inputWithLeftIcon: {
    paddingLeft: SIZES.base,
  },
  leftIcon: {
    marginLeft: SIZES.medium,
  },
  rightIcon: {
    padding: SIZES.medium,
  },
  error: {
    color: COLORS.error,
    fontSize: SIZES.small,
    fontFamily: FONTS.regular,
    marginTop: SIZES.base,
  },
});

export default Input; 