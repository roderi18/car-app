import React, { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { View, Text, StyleSheet, TextInput, Image, TextInputProps, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, FONT_FAMILY } from '../constants';
import { useTheme } from '../theme/ThemeProvider';

interface InputProps extends TextInputProps {
    id: string;
    icon?: any;
    placeholderTextColor?: string;
    errorText?: string[];
    onInputChanged: (id: string, text: string) => void;
    surface?: 'soft' | 'outlined';
}

const Input: React.FC<InputProps> = (props) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasText, setHasText] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const { dark } = useTheme();
    const isEmailInput = props.keyboardType === 'email-address';
    const isPasswordInput = Boolean(props.secureTextEntry);
    const shouldHidePassword = isPasswordInput && !isPasswordVisible;
    const shouldDisableTextHelp = isEmailInput || isPasswordInput;
    const isOutlinedSurface = props.surface === 'outlined';
    const iconColor = isFocused
        ? dark ? COLORS.white : COLORS.primary
        : '#BCBCBC';

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const onChangeText = (text: string) => {
        setHasText(text.length > 0);
        props.onInputChanged(props.id, text);
    };

    return (
        <View style={[styles.container]}>
            <View
                style={[
                    styles.inputContainer,
                    {
                        borderColor: isFocused
                            ? dark ? COLORS.primary100 : COLORS.primary
                            : isOutlinedSurface
                                ? dark ? COLORS.dark2 : COLORS.grayscale200
                                : dark ? COLORS.dark2 : COLORS.greyscale500,
                        backgroundColor: isFocused
                            ? isOutlinedSurface
                                ? dark ? COLORS.dark2 : COLORS.white
                                : COLORS.tansparentPrimary
                            : isOutlinedSurface
                                ? dark ? COLORS.dark2 : COLORS.white
                                : dark ? COLORS.dark2 : COLORS.greyscale500,
                    },
                ]}
            >
                {props.icon && (
                    <Image
                        source={props.icon}
                        style={[
                            styles.icon,
                            {
                                tintColor: iconColor,
                            },
                        ]}
                    />
                )}
                <TextInput
                    {...props}
                    autoCapitalize={props.autoCapitalize ?? 'none'}
                    autoComplete={isEmailInput ? 'email' : props.autoComplete}
                    autoCorrect={shouldDisableTextHelp ? false : props.autoCorrect}
                    inputMode={isEmailInput ? 'email' : props.inputMode}
                    onChangeText={onChangeText}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    secureTextEntry={shouldHidePassword}
                    spellCheck={shouldDisableTextHelp ? false : props.spellCheck}
                    style={[
                        styles.input,
                        shouldHidePassword && hasText && styles.secureInput,
                        { color: dark ? COLORS.white : COLORS.black }
                    ]}
                    placeholder={props.placeholder}
                    placeholderTextColor={props.placeholderTextColor}
                    textContentType={isEmailInput ? 'emailAddress' : props.textContentType}
                />
                {isPasswordInput ? (
                    <TouchableOpacity
                        accessibilityLabel={isPasswordVisible ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                        accessibilityRole="button"
                        activeOpacity={0.7}
                        onPress={() => setIsPasswordVisible((current) => !current)}
                        style={styles.passwordToggle}
                    >
                        <Feather
                            name={isPasswordVisible ? 'eye-off' : 'eye'}
                            size={20}
                            color={iconColor}
                        />
                    </TouchableOpacity>
                ) : null}
            </View>
            {props.errorText && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{props.errorText}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    inputContainer: {
        width: '100%',
        paddingHorizontal: SIZES.padding,
        paddingVertical: SIZES.padding2,
        borderRadius: 12,
        borderWidth: 1,
        marginVertical: 5,
        flexDirection: 'row',
        height: 52,
        alignItems: 'center',
    },
    icon: {
        marginRight: 10,
        height: 20,
        width: 20,
        tintColor: '#BCBCBC',
    },
    input: {
        color: COLORS.black,
        flex: 1,
        fontFamily: FONT_FAMILY.regular,
        fontWeight: '400',
        fontSize: 14,
        paddingTop: 0,
    },
    secureInput: {
        fontFamily: FONT_FAMILY.bold,
        fontWeight: '700',
        fontSize: 18,
        letterSpacing: 2,
    },
    passwordToggle: {
        alignItems: 'center',
        height: 36,
        justifyContent: 'center',
        marginRight: -8,
        width: 36,
    },
    errorContainer: {
        marginVertical: 4,
    },
    errorText: {
        color: 'red',
        fontSize: 12,
    },
});

export default Input;
