import Button from "@/components/Button";
import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SocialButtonV2 from "../components/SocialButtonV2";
import { COLORS, FONT_FAMILY, icons } from "../constants";
import { useTheme } from "../theme/ThemeProvider";

type Nav = {
    navigate: (value: string) => void
}

const Signup = () => {
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
        setNotice(`Registro con ${provider} estara disponible pronto.`);
    };

    return (
        <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Text style={[styles.title, { color: colors.text }]}>Crea tu cuenta</Text>
                <View style={styles.socialButtons}>
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
                    title="Continuar con correo electronico"
                    onPress={() => navigate("signupemail")}
                    textColor={dark ? "#101010" : COLORS.white}
                    style={{
                        ...styles.primaryButton,
                        backgroundColor: dark ? COLORS.white : COLORS.primary
                    }}
                />
                {notice ? (
                    <Text style={styles.notice}>{notice}</Text>
                ) : null}
                <View style={styles.bottomRow}>
                    <Text style={[styles.loginTitle, {
                        color: dark ? COLORS.white : COLORS.black
                    }]}>Ya tienes una cuenta? </Text>
                    <TouchableOpacity onPress={() => navigate("login")}>
                        <Text style={[styles.loginSubtitle, {
                            color: dark ? COLORS.white : COLORS.primary
                        }]}>Inicia sesion</Text>
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
        fontWeight: "700",
        color: COLORS.black,
        textAlign: "center",
    },
    socialButtons: {
        marginVertical: 22,
        width: "90%",
    },
    lineContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "90%",
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
    primaryButton: {
        marginVertical: 22,
        width: "90%",
    },
    notice: {
        color: COLORS.red,
        fontFamily: FONT_FAMILY.regular,
        fontSize: 13,
        fontWeight: "400",
        marginBottom: 12,
        marginTop: -8,
        textAlign: "center",
    },
    bottomRow: {
        flexDirection: "row",
    },
    loginTitle: {
        fontSize: 14,
        fontFamily: FONT_FAMILY.regular,
        fontWeight: "400",
        color: COLORS.black,
    },
    loginSubtitle: {
        fontSize: 14,
        fontFamily: FONT_FAMILY.bold,
        fontWeight: "700",
        color: COLORS.primary,
    },
});

export default Signup;
