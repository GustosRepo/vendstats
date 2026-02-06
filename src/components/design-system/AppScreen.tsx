import React, { ReactNode } from 'react';
import { View, SafeAreaView, StatusBar, ViewStyle, StyleSheet, Dimensions } from 'react-native';
import Svg, { Defs, Pattern, Line, Rect } from 'react-native-svg';
import { colors } from '../../theme';

const { width, height } = Dimensions.get('window');

interface AppScreenProps {
  children: ReactNode;
  header?: ReactNode;
  noPadding?: boolean;
  style?: ViewStyle;
}

/**
 * Currency-style texture pattern overlay
 * Engraving lines like $100 bill
 */
const TexturePattern = () => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <Svg width={width} height={height * 2} style={StyleSheet.absoluteFill}>
      <Defs>
        {/* Fine diagonal lines - engraving effect */}
        <Pattern
          id="diagonalLines"
          patternUnits="userSpaceOnUse"
          width="6"
          height="6"
        >
          <Line
            x1="0"
            y1="6"
            x2="6"
            y2="0"
            stroke={colors.textPrimary}
            strokeWidth="0.5"
            opacity="0.12"
          />
        </Pattern>
        
        {/* Cross-hatch for depth */}
        <Pattern
          id="crossHatch"
          patternUnits="userSpaceOnUse"
          width="6"
          height="6"
        >
          <Line
            x1="0"
            y1="0"
            x2="6"
            y2="6"
            stroke={colors.textPrimary}
            strokeWidth="0.4"
            opacity="0.06"
          />
        </Pattern>
      </Defs>
      
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#diagonalLines)" />
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#crossHatch)" />
    </Svg>
  </View>
);

/**
 * AppScreen - Base screen wrapper
 * Applies consistent background, safe area, and padding
 * Now includes subtle currency-style texture
 */
export const AppScreen: React.FC<AppScreenProps> = ({
  children,
  header,
  noPadding = false,
  style,
}) => {
  return (
    <SafeAreaView
      className="flex-1 bg-[#F7F7F8]"
      style={{ backgroundColor: colors.background }}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <TexturePattern />
      {header}
      <View
        className={`flex-1 ${noPadding ? '' : 'px-5'}`}
        style={style}
      >
        {children}
      </View>
    </SafeAreaView>
  );
};
