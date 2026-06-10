import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { ImageBackground, StyleSheet, Text } from 'react-native';
import { COLORS, images, FONT_FAMILY } from '../constants';

type Nav = {
    navigate: (value: string) => void
}

const Onboarding1 = () => {
    const { navigate } = useNavigation<Nav>();
    // Add useEffect
    useEffect(() => {
        const timeout = setTimeout(() => {
            navigate('onboarding');
        }, 2000);

        return () => clearTimeout(timeout);
    }, []); // run only once after component mounts

    return (
        <ImageBackground
            source={images.splashOnboarding}
            style={styles.area}>
            <LinearGradient
                // Background linear gradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.background}>
                <Text style={styles.greetingText}>Welcome to 👋</Text>
                <Text style={styles.logoName}>Carea</Text>
                <Text style={styles.subtitle}>The best car marketplace app of the century for your transportation needs!</Text>
            </LinearGradient>
        </ImageBackground>
    )
};

const styles = StyleSheet.create({
    area: {
        flex: 1
    },
    background: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: 270,
        paddingHorizontal: 16
    },
    greetingText: {
        fontSize: 40,
        color: COLORS.white,
        fontFamily: FONT_FAMILY.bold,
        fontWeight: '700',
        marginVertical: 12
    },
    logoName: {
        fontSize: 76,
        color: COLORS.white,
        fontFamily: FONT_FAMILY.extraBold,
        fontWeight: '800',
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.white,
        marginVertical: 12,
        fontFamily: FONT_FAMILY.semiBold,
        fontWeight: '600',
    }
})

export default Onboarding1;