import { View, Text, StyleSheet, Image } from 'react-native';
import React from 'react';
import { COLORS, illustrations, FONT_FAMILY } from '../constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { useTheme } from '../theme/ThemeProvider';
import ButtonFilled from '../components/ButtonFilled';
import { NavigationProp, useNavigation } from '@react-navigation/native';

const MakeOfferProcessed = () => {
    const navigation = useNavigation<NavigationProp<any>>();
    const { colors, dark } = useTheme();

    return (
        <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Header title="Make an Offer" />
                <View style={styles.contentContainer}>
                    <Image
                        source={illustrations.offerProcessed}
                        resizeMode='contain'
                        style={styles.offerImage}
                    />
                    <Text style={[styles.offerTitle, {
                        color: dark ? COLORS.white : COLORS.greyscale900,
                    }]}>
                        Your offer is being processed
                    </Text>
                    <Text style={[styles.offerSubtitle, {
                        color: dark ? COLORS.white : COLORS.grayscale700
                    }]}>
                        Please check notifications periodically to
                        see if your offer was accepted or rejected by the seller.
                    </Text>
                </View>
                <ButtonFilled
                    title="Continue"
                    onPress={() => navigation.navigate("makeofferaccepted")}
                />
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
        backgroundColor: COLORS.white,
        padding: 16
    },
    title: {
        fontSize: 16,
        fontFamily: FONT_FAMILY.regular,
        fontWeight: '400',
        color: COLORS.greyscale900,
        marginLeft: 12,
        marginVertical: 32,
        textAlign: "center"
    },
    contentContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    offerImage: {
        width: 260,
        height: 158
    },
    offerTitle: {
        fontSize: 32,
        fontFamily: FONT_FAMILY.bold,
        fontWeight: '700',
        color: COLORS.primary,
        textAlign: "center",
        marginTop: 24,
        paddingBottom: 16,
        paddingHorizontal: 32
    },
    offerSubtitle: {
        fontSize: 14,
        fontFamily: FONT_FAMILY.regular,
        fontWeight: '400',
        color: COLORS.grayscale700,
        textAlign: "center",
        paddingHorizontal: 32
    }
})

export default MakeOfferProcessed