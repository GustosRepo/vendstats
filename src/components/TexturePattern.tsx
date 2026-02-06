/**
 * TexturePattern Component
 * Currency-style engraving crosshatch overlay
 * Adds $100 bill aesthetic to any screen
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Defs, Pattern, Line, Rect } from 'react-native-svg';
import { colors } from '../theme';

const { width, height } = Dimensions.get('window');

export const TexturePattern: React.FC = () => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <Svg width={width} height={height * 2} style={StyleSheet.absoluteFill}>
      <Defs>
        <Pattern
          id="diagonalPattern"
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
        <Pattern
          id="crossHatchPattern"
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
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#diagonalPattern)" />
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#crossHatchPattern)" />
    </Svg>
  </View>
);

export default TexturePattern;
