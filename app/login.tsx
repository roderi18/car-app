import AsyncStorage from '@react-native-async-storage/async-storage';
import ExpoCheckbox from 'expo-checkbox';
import { useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ButtonFilled from '../components/ButtonFilled';
import Header from '../components/Header';
import Input from '../components/Input';
import OrSeparator from '../components/OrSeparator';
import SocialButton from '../components/SocialButton';
import { COLORS, FONT_FAMILY, SIZES, icons, images } from '../constants';
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

const Login = () => {
    const { navigate } = useNavigation<Nav>();
    const [formState, dispatchFormState] = useReducer(reducer, initialState);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isChecked, setChecked] = useState(false);
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
                // Remember me is a convenience feature; login should still work if storage fails.
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

    // Implementing apple authentication
    const appleAuthHandler = () => {
        console.log("Apple Authentication")
    };

    // Implementing facebook authentication
    const facebookAuthHandler = () => {
        console.log("Facebook Authentication")
    };

    // Implementing google authentication
    const googleAuthHandler = () => {
        console.log("Google Authentication")
    };

    return (
        <SafeAreaView style={[styles.area, {
            backgroundColor: colors.background
        }]}>
            <View style={[styles.container, {
                backgroundColor: colors.background
            }]}>
                <Header title="" />
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={images.logo}
                            resizeMode='contain'
                            style={[styles.logo, {
                                tintColor: dark ? COLORS.white : COLORS.black
                            }]}
                        />
                    </View>
                    <Text style={[styles.title, {
                        color: dark ? COLORS.white : COLORS.black
                    }]}>Inicia sesion en tu cuenta</Text>
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
                        <View style={{ flexDirection: 'row' }}>
                            <ExpoCheckbox
                                style={styles.checkbox}
                                value={isChecked}
                                color={isChecked ? COLORS.primary : dark ? COLORS.white : "gray"}
                                onValueChange={setChecked}
                            />
                                <Text style={[styles.privacy, {
                                    color: dark ? COLORS.white : COLORS.black
                                }]}>Recordarme</Text>
                        </View>
                    </View>
                    <ButtonFilled
                        title="Iniciar sesion"
                        onPress={loginHandler}
                        isLoading={isLoading}
                        style={styles.button}
                    />
                    {error ? (
                        <Text style={styles.inlineError}>{error}</Text>
                    ) : null}
                    <TouchableOpacity
                        onPress={() => navigate("forgotpasswordmethods")}>
                        <Text style={[styles.forgotPasswordBtnText, {
                            color: dark ? COLORS.white : COLORS.primary
                        }]}>Olvidaste tu contrasena?</Text>
                    </TouchableOpacity>
                    <View>
                        <OrSeparator text="o continua con" />
                        <View style={styles.socialBtnContainer}>
                            <SocialButton
                                icon={icons.appleLogo}
                                onPress={appleAuthHandler}
                                tintColor={dark ? COLORS.white : COLORS.black}
                            />
                            <SocialButton
                                icon={icons.facebook}
                                onPress={facebookAuthHandler}
                            />
                            <SocialButton
                                icon={icons.google}
                                onPress={googleAuthHandler}
                            />
                        </View>
                    </View>
                </ScrollView>
                <View style={styles.bottomContainer}>
                    <Text style={[styles.bottomLeft, {
                        color: dark ? COLORS.white : COLORS.black
                    }]}>No tienes una cuenta?</Text>
                    <TouchableOpacity
                        onPress={() => navigate("signup")}>
                        <Text style={[styles.bottomRight, {
                            color: dark ? COLORS.white : COLORS.primary
                        }]}>{"  "}Regístrate</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    area: {
        flex: 1,
        backgroundColor: COLORS.white
    },
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: COLORS.white
    },
    logo: {
        width: 100,
        height: 100,
        tintColor: COLORS.primary
    },
    logoContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 32
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 26,
        fontFamily: FONT_FAMILY.bold,
        fontWeight: '700',
        color: COLORS.black,
        textAlign: "center",
        marginBottom: 22
    },
    checkBoxContainer: {
       flexDirection: "row",
        alignItems: "center",
        justifyContent: "center", // <--- Add this line
        marginVertical: 18,
        width: "100%",
    },
    checkbox: {
        marginRight: 8,
        height: 16,
        width: 16,
        borderRadius: 4,
        borderColor: COLORS.primary,
        borderWidth: 2,
    },
    privacy: {
        fontSize: 12,
        fontFamily: FONT_FAMILY.regular,
        fontWeight: '400',
        color: COLORS.black,
    },
    socialTitle: {
        fontSize: 19.25,
        fontFamily: FONT_FAMILY.medium,
        fontWeight: '500',
        color: COLORS.black,
        textAlign: "center",
        marginVertical: 26
    },
    socialBtnContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    bottomContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 18,
        position: "absolute",
        bottom: 12,
        right: 0,
        left: 0,
    },
    bottomLeft: {
        fontSize: 14,
        fontFamily: FONT_FAMILY.regular,
        fontWeight: '400',
        color: "black"
    },
    bottomRight: {
        fontSize: 16,
        fontFamily: FONT_FAMILY.medium,
        fontWeight: '500',
        color: COLORS.primary
    },
    button: {
        marginVertical: 6,
        width: SIZES.width - 32,
        borderRadius: 30
    },
    forgotPasswordBtnText: {
        fontSize: 16,
        fontFamily: FONT_FAMILY.semiBold,
        fontWeight: '600',
        color: COLORS.primary,
        textAlign: "center",
        marginTop: 12
    },
    inlineError: {
        color: COLORS.red,
        fontSize: 13,
        fontFamily: FONT_FAMILY.regular,
        fontWeight: '400',
        marginTop: 8,
        textAlign: "center"
    }
})

export default Login
