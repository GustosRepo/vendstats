/**
 * TexturedBackground Component
 * Adds subtle currency-style engraving texture to screens
 * Inspired by $100 bill guilloche patterns
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Defs, Pattern, Line, Rect } from 'react-native-svg';
import { colors } from '../theme/tokens';

const { width, height } = Dimensions.get('window');

interface TexturedBackgroundProps {
  children: React.ReactNode;
  style?: object;
}

export const TexturedBackground: React.FC<TexturedBackgroundProps> = ({ 
  children, 
  style 
}) => {
  return (
    <View style={[styles.container, { backgroundColor: colors.background }, style]}>
      {/* Fine diagonal crosshatch pattern - like engraving lines */}
      <View style={styles.patternLayer}>
        <Svg width={width} height={height * 2} style={StyleSheet.absoluteFill}>
          <Defs>
            {/* Primary diagonal lines */}
            <Pattern
              id="diagonalLines"
              patternUnits="userSpaceOnUse"
              width="8"
              height="8"
            >
              <Line
                x1="0"
                y1="8"
                x2="8"
                y2="0"
                stroke={colors.textPrimary}
                strokeWidth="0.3"
                opacity="0.04"
              />
            </Pattern>
            
            {/* Cross-hatch for depth */}
            <Pattern
              id="crossHatch"
              patternUnits="userSpaceOnUse"
              width="12"
              height="12"
            >
              <Line
                x1="0"
                y1="12"
                x2="12"
                y2="0"
                stroke={colors.textPrimary}
                strokeWidth="0.25"
                opacity="0.03"
              />
              <Line
                x1="0"
                y1="0"
                x2="12"
                y2="12"
                stroke={colors.textPrimary}
                strokeWidth="0.25"
                opacity="0.02"
              />
            </Pattern>

            {/* Fine horizontal lines - like paper texture */}
            <Pattern
              id="horizontalLines"
              patternUnits="userSpaceOnUse"
              width="4"
              height="3"
            >
              <Line
                x1="0"
                y1="1.5"
                x2="4"
                y2="1.5"
                stroke={colors.textPrimary}
                strokeWidth="0.2"
                opacity="0.025"
              />
            </Pattern>
          </Defs>
          
          {/* Layer the patterns for depth */}
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#diagonalLines)" />
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#crossHatch)" />
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#horizontalLines)" />
        </Svg>
      </View>
      
      {/* Content layer */}
      <View style={styles.contentLayer}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  patternLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  contentLayer: {
    flex: 1,
  },
});

export default TexturedBackground;
