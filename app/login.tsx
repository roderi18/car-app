import AsyncStorage from '@react-native-async-storage/async-storage';
import ExpoCheckbox from 'expo-checkbox';
import { useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { Image, ImageSourcePropType, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ButtonFilled from '../components/ButtonFilled';
import Input from '../components/Input';
import { COLORS, FONT_FAMILY, icons } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../theme/ThemeProvider';
import { validateInput } from '../utils/actions/formActions';
import { getFirebaseAuthErrorMessage } from '../utils/firebaseAuthErrors';
import { reducer } from '../utils/reducers/formReducers';

const isTestMode = false;
const REMEMBERED_EMAIL_KEY = '@carea:rememberedEmail';

const initialState = {
    inputValues: {
        email: isTestMode ? 'example@gmail.com' : '',
        password: isTestMode ? '**********' : '',
    },
    inputValidities: {
        email: false,
        password: false
    },
    formIsValid: false,
}

type Nav = {
    navigate: (value: string) => void
}

type AuthMethodButtonProps = {
    icon: ImageSourcePropType;
    label: string;
    onPress: () => void;
    dark: boolean;
    tintColor?: string;
};

const AuthMethodButton = ({ icon, label, onPress, dark, tintColor }: AuthMethodButtonProps) => (
    <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.75}
        onPress={onPress}
        style={[
            styles.authMethodButton,
            {
                backgroundColor: dark ? COLORS.dark2 : COLORS.white,
                borderColor: dark ? COLORS.greyscale300 : COLORS.grayscale400,
            },
        ]}
    >
        <Image source={icon} resizeMode="contain" style={[styles.authMethodIcon, { tintColor }]} />
        <Text style={[styles.authMethodText, { color: dark ? COLORS.white : COLORS.black }]}>
            {label}
        </Text>
    </TouchableOpacity>
);

const Login = () => {
    const { navigate } = useNavigation<Nav>();
    const [formState, dispatchFormState] = useReducer(reducer, initialState);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isChecked, setChecked] = useState(false);
    const [showEmailForm, setShowEmailForm] = useState(false);
    const { login } = useAuth();
    const { colors, dark } = useTheme();

    useEffect(() => {
        let isMounted = true;

        const loadRememberedEmail = async () => {
            try {
                const rememberedEmail = await AsyncStorage.getItem(REMEMBERED_EMAIL_KEY);

                if (!isMounted || !rememberedEmail) return;

                setChecked(true);
                dispatchFormState({
                    inputId: 'email',
                    inputValue: rememberedEmail,
                    validationResult: validateInput('email', rememberedEmail),
                });
            } catch {
                // Recordarme es una ayuda visual; el login debe seguir funcionando si falla el storage.
            }
        };

        loadRememberedEmail();

        return () => {
            isMounted = false;
        };
    }, []);

    const inputChangedHandler = useCallback(
        (inputId: string, inputValue: string) => {
            setError(null);
            const result = validateInput(inputId, inputValue)
            dispatchFormState({
                inputId,
                validationResult: result,
                inputValue,
            })
        }, [dispatchFormState]);

    useEffect(() => {
        if (!error) return;

        const timeout = setTimeout(() => {
            setError(null);
        }, 3000);

        return () => clearTimeout(timeout);
    }, [error]);

    const loginHandler = async () => {
        const email = formState.inputValues.email?.trim();
        const password = formState.inputValues.password;

        if (!email || !password) {
            setError('Escribe tu correo y contrasena.');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            await login(email, password, isChecked);

            if (isChecked) {
                await AsyncStorage.setItem(REMEMBERED_EMAIL_KEY, email);
            } else {
                await AsyncStorage.removeItem(REMEMBERED_EMAIL_KEY);
            }

            navigate("(tabs)");
        } catch (err) {
            setError(getFirebaseAuthErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const comingSoonHandler = (provider: string) => {
        setError(`Inicio con ${provider} estara disponible pronto.`);
    };

    return (
        <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                style={{ backgroundColor: colors.background }}
            >
                <View style={styles.content}>
                    <Text style={[styles.title, { color: dark ? COLORS.white : COLORS.black }]}>
                        Bienvenido de nuevo.
                    </Text>

                    <View style={styles.authMethods}>
                        <AuthMethodButton
                            dark={dark}
                            icon={icons.google}
                            label="Continuar con Google"
                            onPress={() => comingSoonHandler('Google')}
                        />
                        <AuthMethodButton
                            dark={dark}
                            icon={icons.facebook}
                            label="Continuar con Facebook"
                            onPress={() => comingSoonHandler('Facebook')}
                        />
                        <AuthMethodButton
                            dark={dark}
                            icon={icons.appleLogo}
                            label="Continuar con Apple"
                            onPress={() => comingSoonHandler('Apple')}
                            tintColor={dark ? COLORS.white : COLORS.black}
                        />
                        <AuthMethodButton
                            dark={dark}
                            icon={icons.email}
                            label="Continuar con correo"
                            onPress={() => {
                                setShowEmailForm(true);
                                setError(null);
                            }}
                            tintColor={dark ? COLORS.white : COLORS.black}
                        />
                    </View>

                    {showEmailForm ? (
                        <View style={styles.emailForm}>
                            <Input
                                id="email"
                                onInputChanged={inputChangedHandler}
                                errorText={formState.inputValidities['email']}
                                placeholder="Correo electronico"
                                placeholderTextColor={dark ? COLORS.grayTie : COLORS.black}
                                icon={icons.email}
                                keyboardType="email-address"
                                value={formState.inputValues.email}
                            />
                            <Input
                                onInputChanged={inputChangedHandler}
                                errorText={formState.inputValidities['password']}
                                autoCapitalize="none"
                                id="password"
                                placeholder="Contrasena"
                                placeholderTextColor={dark ? COLORS.grayTie : COLORS.black}
                                icon={icons.padlock}
                                secureTextEntry={true}
                            />
                            <View style={styles.checkBoxContainer}>
                                <ExpoCheckbox
                                    style={styles.checkbox}
                                    value={isChecked}
                                    color={isChecked ? COLORS.primary : dark ? COLORS.white : COLORS.gray}
                                    onValueChange={setChecked}
                                />
                                <Text style={[styles.privacy, { color: dark ? COLORS.white : COLORS.black }]}>
                                    Recordarme
                                </Text>
                            </View>
                            <ButtonFilled
                                title="Iniciar sesion"
                                onPress={loginHandler}
                                isLoading={isLoading}
                                style={styles.button}
                            />
                            <TouchableOpacity onPress={() => navigate("forgotpasswordmethods")}>
                                <Text style={[styles.forgotPasswordBtnText, { color: dark ? COLORS.white : COLORS.primary }]}>
                                    Olvidaste tu contrasena?
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setShowEmailForm(false)}>
                                <Text style={[styles.secondaryAction, { color: dark ? COLORS.grayTie : COLORS.gray }]}>
                                    Ver otras opciones
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}

                    {error ? (
                        <Text style={styles.inlineError}>{error}</Text>
                    ) : null}

                    <View style={styles.signupContainer}>
                        <Text style={[styles.signupText, { color: dark ? COLORS.white : COLORS.black }]}>
                            No tienes cuenta?
                        </Text>
                        <TouchableOpacity onPress={() => navigate("signup")}>
                            <Text style={styles.signupLink}> Crea una</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={[styles.footerText, { color: dark ? COLORS.grayTie : COLORS.gray }]}>
                    Al continuar, aceptas nuestros terminos de servicio y reconoces que nuestra politica de privacidad aplica para ti.
                </Text>
            </ScrollView>
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    area: {
        flex: 1,
        backgroundColor: COLORS.white
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 28,
    },
    content: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        width: '100%',
    },
    title: {
        color: COLORS.black,
        fontFamily: FONT_FAMILY.regular,
        fontSize: 24,
        fontWeight: '400',
        marginBottom: 52,
        textAlign: 'center',
    },
    authMethods: {
        alignItems: 'center',
        gap: 12,
        width: '100%',
    },
    authMethodButton: {
        alignItems: 'center',
        borderRadius: 24,
        borderWidth: 1,
        flexDirection: 'row',
        height: 42,
        justifyContent: 'center',
        maxWidth: 280,
        paddingHorizontal: 18,
        width: '100%',
    },
    authMethodIcon: {
        height: 18,
        marginRight: 12,
        width: 18,
    },
    authMethodText: {
        color: COLORS.black,
        fontFamily: FONT_FAMILY.medium,
        fontSize: 13,
        fontWeight: '500',
        minWidth: 160,
    },
    emailForm: {
        marginTop: 28,
        maxWidth: 430,
        width: '100%',
    },
    checkBoxContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 16,
        width: '100%',
    },
    checkbox: {
        borderColor: COLORS.primary,
        borderRadius: 4,
        borderWidth: 2,
        height: 16,
        marginRight: 8,
        width: 16,
    },
    privacy: {
        color: COLORS.black,
        fontFamily: FONT_FAMILY.regular,
        fontSize: 12,
        fontWeight: '400',
    },
    button: {
        borderRadius: 30,
        marginVertical: 6,
        maxWidth: 430,
        width: '100%',
    },
    forgotPasswordBtnText: {
        color: COLORS.primary,
        fontFamily: FONT_FAMILY.semiBold,
        fontSize: 15,
        fontWeight: '600',
        marginTop: 12,
        textAlign: 'center',
    },
    secondaryAction: {
        color: COLORS.gray,
        fontFamily: FONT_FAMILY.regular,
        fontSize: 13,
        fontWeight: '400',
        marginTop: 14,
        textAlign: 'center',
    },
    inlineError: {
        color: COLORS.red,
        fontFamily: FONT_FAMILY.regular,
        fontSize: 13,
        fontWeight: '400',
        marginTop: 18,
        textAlign: 'center',
    },
    signupContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 42,
    },
    signupText: {
        color: COLORS.black,
        fontFamily: FONT_FAMILY.regular,
        fontSize: 14,
        fontWeight: '400',
    },
    signupLink: {
        color: COLORS.primary,
        fontFamily: FONT_FAMILY.bold,
        fontSize: 14,
        fontWeight: '700',
    },
    footerText: {
        alignSelf: 'center',
        color: COLORS.gray,
        fontFamily: FONT_FAMILY.regular,
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 18,
        maxWidth: 330,
        textAlign: 'center',
    },
});

export default Login
