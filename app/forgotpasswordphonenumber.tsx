import ExpoCheckbox from 'expo-checkbox';
import { useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ButtonFilled from '../components/ButtonFilled';
import Header from '../components/Header';
import { COLORS, SIZES, icons, images, FONT_FAMILY } from '../constants';
import { useTheme } from '../theme/ThemeProvider';

type Nav = {
    navigate: (value: string) => void
}

const ForgotPasswordPhoneNumber = () => {
    const { navigate } = useNavigation<Nav>();
    const [isChecked, setChecked] = useState(false);
    const [areas, setAreas] = useState([]);
    const [selectedArea, setSelectedArea] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const { colors, dark } = useTheme();

    // Fetch codes from rescountries api
    useEffect(() => {
        fetch("https://restcountries.com/v3.1/all?fields=cca2,name,idd,flags")
            .then(response => response.json())
            .then(data => {
                const areaData = data
                    .filter(
                        (item: any) =>
                            item.cca2 &&
                            item.name?.common &&
                            item.idd?.root &&
                            Array.isArray(item.idd.suffixes) &&
                            item.idd.suffixes.length > 0
                    )
                    .map((item: any) => ({
                        code: item.cca2,
                        item: item.name.common,
                        callingCode: `${item.idd.root}${item.idd.suffixes[0]}`,
                        flag: `https://flagsapi.com/${item.cca2}/flat/64.png`, // use flagsapi here
                    }));


                setAreas(areaData);
                if (areaData.length > 0) {
                    let defaultData = areaData.filter((a: any) => a.code === "US");

                    if (defaultData.length > 0) {
                        setSelectedArea(defaultData[0])
                    }
                }
            })
    }, []);

    // Render countries codes modal
    function RenderAreasCodesModal() {

        const renderItem = ({ item }: { item: any }) => {
            return (
                <TouchableOpacity
                    style={{
                        padding: 10,
                        flexDirection: "row"
                    }}
                    onPress={() => {
                        setSelectedArea(item);
                        setModalVisible(false);
                    }}>
                    <Image
                        source={{ uri: item.flag }}
                        resizeMode='contain'
                        style={{
                            height: 30,
                            width: 30,
                            marginRight: 10
                        }}
                    />
                    <Text style={{ fontSize: 16, color: "#fff" }}>{item.item}</Text>
                </TouchableOpacity>
            )
        }
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}>
                <TouchableWithoutFeedback
                    onPress={() => setModalVisible(false)}>
                    <View
                        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                        <View
                            style={{
                                height: 400,
                                width: SIZES.width * 0.8,
                                backgroundColor: COLORS.primary,
                                borderRadius: 12
                            }}>
                            <FlatList
                                data={areas}
                                renderItem={renderItem}
                                horizontal={false}
                                keyExtractor={(item) => item.code}
                                style={{
                                    padding: 20,
                                    marginBottom: 20
                                }}
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        )
    }

    return (
        <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Header title="Olvide mi contrasena" />
                <ScrollView style={{ marginVertical: 54 }} showsVerticalScrollIndicator={false}>
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
                    }]}>Ingresa tu numero de telefono</Text>
                    <View style={[styles.inputContainer, { backgroundColor: dark ? COLORS.dark2 : COLORS.greyscale500 }]}>
                        <TouchableOpacity
                            style={styles.selectFlagContainer}
                            onPress={() => setModalVisible(true)}>
                            <View style={{ justifyContent: "center" }}>
                                <Image
                                    source={icons.down}
                                    resizeMode='contain'
                                    style={styles.downIcon}
                                />
                            </View>
                            <View style={{ justifyContent: "center", marginLeft: 5 }}>
                                <Image
                                    source={{ uri: selectedArea?.flag }}
                                    resizeMode="contain"
                                    style={styles.flagIcon}
                                />
                            </View>
                            <View style={{ justifyContent: "center", marginLeft: 5 }}>
                                <Text style={{ color: dark ? COLORS.white : COLORS.black, fontSize: 12 }}>{selectedArea?.callingCode}</Text>
                            </View>
                        </TouchableOpacity>
                        {/* Phone Number Text Input */}
                        <TextInput
                            style={[styles.input, { color: dark ? COLORS.white : COLORS.black }]}
                            placeholder="Ingresa tu numero de telefono"
                            placeholderTextColor={COLORS.gray}
                            selectionColor="#111"
                            keyboardType="numeric"
                        />
                    </View>
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
                        title="Restablecer contrasena"
                        onPress={() => navigate("otpverification")}
                        style={styles.button}
                    />
                    <TouchableOpacity
                        onPress={() => navigate("login")}>
                        <Text style={[styles.forgotPasswordBtnText, {
                            color: dark ? COLORS.white : COLORS.primary
                        }]}>Recordaste la contrasena?</Text>
                    </TouchableOpacity>
                    <View>
                    </View>
                </ScrollView>
                <View style={styles.bottomContainer}>
                    <Text style={[styles.bottomLeft, {
                        color: dark ? COLORS.white : COLORS.black
                    }]}>No tienes una cuenta?</Text>
                    <TouchableOpacity
                        onPress={() => navigate("signup")}
                    >
                        <Text style={[styles.bottomRight, {
                            color: dark ? COLORS.white : COLORS.primary
                        }]}>{" "}Registrate</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {RenderAreasCodesModal()}
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
    inputContainer: {
        flexDirection: "row",
        borderColor: COLORS.greyscale500,
        borderWidth: .4,
        borderRadius: 6,
        height: 58,
        width: SIZES.width - 32,
        alignItems: 'center',
        marginVertical: 16,
        backgroundColor: COLORS.greyscale500,
    },
    downIcon: {
        width: 10,
        height: 10,
        tintColor: "#111"
    },
    selectFlagContainer: {
        width: 90,
        height: 50,
        marginHorizontal: 5,
        flexDirection: "row",
    },
    flagIcon: {
        width: 30,
        height: 30
    },
    input: {
        flex: 1,
        marginVertical: 10,
        height: 40,
        fontSize: 14,
        color: "#111"
    }
})

export default ForgotPasswordPhoneNumber
