import Button from "@/components/Button";
import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SocialButtonV2 from "../components/SocialButtonV2";
import { COLORS, FONT_FAMILY, SIZES, icons } from "../constants";
import { useTheme } from "../theme/ThemeProvider";

type Nav = {
    navigate: (value: string) => void
}

const Login = () => {
    const { navigate } = useNavigation<Nav>();
    const { colors, dark } = useTheme();
    const [notice, setNotice] = useState<string | null>(null);

    useEffect(() => {
        if (!notice) return;

        const timeout = setTimeout(() => {
            setNotice(null);
        }, 3000);

        return () => clearTimeout(timeout);
    }, [notice]);

    const showUnavailableProvider = (provider: string) => {
        setNotice(`Inicio con ${provider} estara disponible pronto.`);
    };

    return (
        <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Text style={[styles.title, { color: colors.text }]}>Iniciar sesión</Text>
                <View style={{ marginVertical: 22 }}>
                    <SocialButtonV2 title="Continuar con Facebook" icon={icons.facebook} onPress={() => showUnavailableProvider("Facebook")} />
                    <SocialButtonV2 title="Continuar con Google" icon={icons.google} onPress={() => showUnavailableProvider("Google")} />
                    <SocialButtonV2
                        title="Continuar con Apple"
                        icon={icons.appleLogo}
                        onPress={() => showUnavailableProvider("Apple")}
                        iconStyles={{ tintColor: dark ? COLORS.white : COLORS.black }}
                    />
                </View>
                <View style={styles.lineContainer}>
                    <View style={[styles.line, { backgroundColor: dark ? COLORS.greyScale800 : COLORS.grayscale200 }]} />
                    <Text style={[styles.text, { color: dark ? COLORS.white : COLORS.grayscale700 }]}>O</Text>
                    <View style={[styles.line, { backgroundColor: dark ? COLORS.greyScale800 : COLORS.grayscale200 }]} />
                </View>
                <Button
                    title="Iniciar sesion con telefono"
                    onPress={() => navigate("loginemail")}
                    textColor={dark ? "#101010" : COLORS.white}
                    style={{
                        width: "100%",
                        marginVertical: 22,
                        backgroundColor: dark ? COLORS.white : COLORS.primary
                    }}
                />
                {notice ? (
                    <Text style={styles.notice}>{notice}</Text>
                ) : null}
                <View style={{ flexDirection: "row" }}>
                    <Text style={[styles.loginTitle, {
                        color: dark ? COLORS.white : "black"
                    }]}>No tienes una cuenta? </Text>
                    <TouchableOpacity
                        onPress={() => navigate("signup")}>
                        <Text style={[styles.loginSubtitle, {
                            color: dark ? COLORS.white : COLORS.primary
                        }]}>Registrate</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    area: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
        padding: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 32,
        fontFamily: FONT_FAMILY.bold,
        fontWeight: '700',
        color: COLORS.black,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 12,
        fontFamily: FONT_FAMILY.regular,
        fontWeight: '400',
        color: "black",
        textAlign: "center",
        paddingHorizontal: 16,
    },
    loginTitle: {
        fontSize: 14,
        fontFamily: FONT_FAMILY.regular,
        fontWeight: '400',
        color: "black",
    },
    loginSubtitle: {
        fontSize: 14,
        fontFamily: FONT_FAMILY.bold,
        fontWeight: '700',
        color: COLORS.primary,
    },
    bottomContainer: {
        position: "absolute",
        bottom: 32,
        right: 0,
        left: 0,
        width: SIZES.width - 32,
        alignItems: "center",
    },
    bottomTitle: {
        fontSize: 12,
        fontFamily: FONT_FAMILY.regular,
        fontWeight: '400',
        color: COLORS.black,
    },
    bottomSubtitle: {
        fontSize: 12,
        fontFamily: FONT_FAMILY.regular,
        fontWeight: '400',
        color: COLORS.black,
        textDecorationLine: "underline",
        marginTop: 2,
    },
    lineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.grayscale200,
    },
    text: {
        marginHorizontal: 10,
        color: COLORS.grayscale700,
        fontSize: 18,
        fontFamily: FONT_FAMILY.semiBold
    },
    notice: {
        color: COLORS.red,
        fontFamily: FONT_FAMILY.regular,
        fontSize: 13,
        fontWeight: '400',
        marginBottom: 12,
        marginTop: -8,
        textAlign: "center",
    },
});

export default Login;
