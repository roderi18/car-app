import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS } from '../constants';

type AddressMapProps = {
    dark: boolean;
};

const AddressMap = ({ dark }: AddressMapProps) => {
    return (
        <View
            style={[
                styles.mapFallback,
                {
                    backgroundColor: dark ? COLORS.dark2 : COLORS.grayscale100,
                },
            ]}>
            <View style={styles.pin}>
                <Text style={styles.pinText}>•</Text>
            </View>
            <View style={[styles.label, { backgroundColor: dark ? COLORS.dark1 : COLORS.white }]}>
                <Text style={[styles.labelText, { color: dark ? COLORS.white : COLORS.black }]}>
                    User Address
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    mapFallback: {
        height: '100%',
        zIndex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pin: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pinText: {
        color: COLORS.white,
        fontSize: 40,
        lineHeight: 40,
    },
    label: {
        marginTop: 12,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    labelText: {
        ...FONTS.body4,
        fontWeight: 'bold',
    },
});

export default AddressMap;
