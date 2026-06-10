import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ImageSourcePropType, GestureResponderEvent } from 'react-native';
import { COLORS, SIZES, FONT_FAMILY } from '../constants';
import { getTimeAgo } from '../utils/date';
import { useTheme } from '../theme/ThemeProvider';

interface NotificationCardProps {
    icon: ImageSourcePropType;
    title: string;
    description: string;
    date: Date | string;
    onPress: (event: GestureResponderEvent) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ icon, title, description, date, onPress }) => {
    const { dark } = useTheme();

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
        >
            <View style={styles.leftContainer}>
                <TouchableOpacity style={styles.iconContainer}>
                    <Image
                        source={icon}
                        resizeMode="cover"
                        style={styles.icon}
                    />
                </TouchableOpacity>
                <View>
                    <Text style={[
                        styles.title,
                        { color: dark ? COLORS.white : COLORS.greyscale900 }
                    ]}>
                        {title}
                    </Text>
                    <Text style={styles.description}>{description}</Text>
                </View>
            </View>
            <Text style={styles.date}>{getTimeAgo(date)}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 12,
        width: SIZES.width - 32,
    },
    leftContainer: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1
    },
    iconContainer: {
        height: 44,
        width: 44,
        backgroundColor: COLORS.black2,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 999,
        marginRight: 12
    },
    icon: {
        width: 22,
        height: 22,
        tintColor: COLORS.white
    },
    title: {
        fontSize: 14,
        fontFamily: FONT_FAMILY.medium,
        fontWeight: '500',
        color: COLORS.black,
        marginBottom: 6
    },
    description: {
        fontSize: 14,
        fontFamily: FONT_FAMILY.regular,
        fontWeight: '400',
        color: "gray"
    },
    date: {
        fontSize: 12,
        fontFamily: FONT_FAMILY.regular,
        fontWeight: '400',
        color: "gray",
    }
});

export default NotificationCard;
