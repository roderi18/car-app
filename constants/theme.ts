import { Dimensions, Platform } from 'react-native';

const { height, width } = Dimensions.get('window');

export const COLORS = {
    primary: '#101010',
    secondary: '#e7e6e6',
    tertiary: "#6C4DDA",
    success: "#0ABE75",
    black: "#181A20",
    black2: "#1D272F",
    info: "#246BFD",
    warning: "#FACC15",
    error: "#F75555",
    disabled: "#D8D8D8",
    white: "#FFFFFF",
    greeen: "#0ABE75",
    red: "#f65554",
    secondaryWhite: '#F9F9FF',
    tertiaryWhite: '#fafafa',
    gray: "#9E9E9E",
    gray2: "#35383F",
    gray3: "#9E9E9E",
    dark1: "#000000",
    dark2: "#1F222A",
    dark3: "#35383F",
    greyscale900: "#212121",
    greyScale800: "#424242",
    grayscale700: "#616161",
    grayscale400: "#BDBDBD",
    greyscale300: "#E0E0E0",
    greyscale500: "#FAFAFA",
    greyscale600: "#757575",
    grayscale200: "#EEEEEE",
    grayscale100: "#F5F5F5",
    tansparentPrimary: "rgba(16, 16, 16, 0.08)",
    transparentSecondary: "rgba(108,77,218, .15)",
    transparentTertiary: "rgba(51, 94, 247, .1)",
    transparentRed: "rgba(255,62,61, .15)",
    transparentWhite: "rgba(255,255,255, .2)",
    transparentWhite2: "rgba(255,255,255, .5)",
    blackTie: "#474747",
    grayTie: '#BCBCBC',
    blue: "#246BFD",
    silver: "#F3F3F3",
    primary100: "#E7E7E7"
};

export const SIZES = {
    // Global SIZES
    base: 8,
    font: 14,
    radius: 30,
    padding: 8,
    padding2: 12,
    padding3: 16,

    // FONTS Sizes
    largeTitle: 50,
    h1: 36,
    h2: 22,
    h3: 16,
    h4: 14,
    body1: 30,
    body2: 20,
    body3: 16,
    body4: 14,

    // App Dimensions
    width,
    height,
};

export const FONT_FAMILY = {
    regular: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
    medium: Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'System' }),
    semiBold: Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'System' }),
    bold: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
    extraBold: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
    black: Platform.select({ ios: 'System', android: 'sans-serif-black', default: 'System' }),
};

export const FONTS = {
    largeTitle: { fontFamily: FONT_FAMILY.black, fontWeight: '900' as const, fontSize: SIZES.largeTitle, lineHeight: 55, color: "black" },
    h1: { fontFamily: FONT_FAMILY.bold, fontWeight: '700' as const, fontSize: SIZES.h1, lineHeight: 36, color: "black" },
    h2: { fontFamily: FONT_FAMILY.bold, fontWeight: '700' as const, fontSize: SIZES.h2, lineHeight: 30, color: "black" },
    h3: { fontFamily: FONT_FAMILY.bold, fontWeight: '700' as const, fontSize: SIZES.h3, lineHeight: 22, color: "black" },
    h4: { fontFamily: FONT_FAMILY.bold, fontWeight: '700' as const, fontSize: SIZES.h4, lineHeight: 20 },
    body1: { fontFamily: FONT_FAMILY.regular, fontWeight: '400' as const, fontSize: SIZES.body1, lineHeight: 36, color: "black" },
    body2: { fontFamily: FONT_FAMILY.regular, fontWeight: '400' as const, fontSize: SIZES.body2, lineHeight: 30, color: "black" },
    body3: { fontFamily: FONT_FAMILY.regular, fontWeight: '400' as const, fontSize: SIZES.body3, lineHeight: 22, color: "black" },
    body4: { fontFamily: FONT_FAMILY.regular, fontWeight: '400' as const, fontSize: SIZES.body4, lineHeight: 20, color: "black" },
};



const appTheme = { COLORS, SIZES, FONT_FAMILY, FONTS };

export default appTheme;
