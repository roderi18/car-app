import Input from '@/components/Input';
import ExpoCheckbox from 'expo-checkbox';
import { useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ButtonFilled from '../components/ButtonFilled';
import Header from '../components/Header';
import { COLORS, icons, FONT_FAMILY } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../theme/ThemeProvider';
import { validateInput } from '../utils/actions/formActions';
import { getFirebaseAuthErrorMessage } from '../utils/firebaseAuthErrors';
import { reducer } from '../utils/reducers/formReducers';

const isTestMode = false;

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

const Signup = () => {
    const { navigate } = useNavigation<Nav>();
    const [formState, dispatchFormState] = useReducer(reducer, initialState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isChecked, setChecked] = useState(false);
    const { signup } = useAuth();
    const { colors, dark } = useTheme();

    const inputChangedHandler = useCallback(
        (inputId: string, inputValue: string) => {
            setError(null);
            const result = validateInput(inputId, inputValue)
            dispatchFormState({
                inputId,
                validationResult: result,
                inputValue,
            })
        },
        [dispatchFormState]);

    useEffect(() => {
        if (!error) return;

        const timeout = setTimeout(() => {
            setError(null);
        }, 3000);

        return () => clearTimeout(timeout);
    }, [error])

    const signupHandler = async () => {
        const email = formState.inputValues.email?.trim();
        const password = formState.inputValues.password;

        if (!email || !password) {
            setError('Escribe tu correo y contrasena.');
            return;
        }

        if (!isChecked) {
            setError('Debes aceptar la politica de privacidad para continuar.');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            await signup({
                email,
                password,
                displayName: email.split('@')[0],
            });
            navigate("fillyourprofile");
        } catch (err) {
            setError(getFirebaseAuthErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Header title="" />
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.contentSection}>
                        <Text style={[styles.title, {
                            color: dark ? COLORS.white : COLORS.black
                        }]}>Crea tu cuenta</Text>
                        <View style={styles.formContent}>
                            <Input
                                id="email"
                                onInputChanged={inputChangedHandler}
                                errorText={formState.inputValidities['email']}
                                placeholder="Correo electronico"
                                placeholderTextColor={dark ? COLORS.grayTie : COLORS.black}
                                icon={icons.email}
                                keyboardType="email-address"
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
                            <View style={styles.checkboxRow}>
                                <ExpoCheckbox
                                    style={styles.checkbox}
                                    value={isChecked}
                                    color={isChecked ? COLORS.primary : dark ? COLORS.white : "gray"}
                                    onValueChange={setChecked}
                                />
                                <Text style={[styles.privacy, {
                                    color: dark ? COLORS.white : COLORS.black
                                }]}>
                                    Al continuar aceptas nuestra{' '}
                                    <Text
                                        onPress={() => navigate("settingsprivacypolicy")}
                                        style={styles.privacyLink}
                                    >
                                        politica de privacidad
                                    </Text>
                                </Text>
                            </View>
                        </View>
                            <ButtonFilled
                                title="Registrarme"
                                onPress={signupHandler}
                                isLoading={isLoading}
                                style={styles.button}
                            />
                        </View>
                        {error ? (
                            <Text style={styles.inlineError}>{error}</Text>
                        ) : null}
                    </View>
                </ScrollView>
                <View style={styles.bottomContainer}>
                    <Text style={[styles.bottomLeft, {
                        color: dark ? COLORS.white : COLORS.black
                    }]}>Ya tienes una cuenta?</Text>
                    <TouchableOpacity
                        onPress={() => navigate("login")}>
                        <Text style={[styles.bottomRight, {
                            color: dark ? COLORS.white : COLORS.primary
                        }]}>{" "}Inicia sesion</Text>
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
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingBottom: 72,
    },
    contentSection: {
        justifyContent: 'center',
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    formContent: {
        alignSelf: 'center',
        width: '90%',
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
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginVertical: 18,
        width: '100%',
    },
    checkboxRow: {
        alignItems: 'flex-start',
        flexDirection: 'row',
        width: '100%',
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
        fontSize: 14,
        flex: 1,
        fontFamily: FONT_FAMILY.regular,
        fontWeight: '400',
        color: COLORS.black,
    },
    privacyLink: {
        color: COLORS.primary,
        fontFamily: FONT_FAMILY.semiBold,
        fontSize: 14,
        fontWeight: '600',
        textDecorationLine: 'underline',
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
        fontSize: 14,
        fontFamily: FONT_FAMILY.semiBold,
        fontWeight: '600',
        color: COLORS.primary
    },
    button: {
        marginVertical: 6,
        width: '100%',
        borderRadius: 30
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

export default Signup
