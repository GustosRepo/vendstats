import React from 'react';
import { ScrollView, View, Text, Dimensions, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Pattern, Line, Rect } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, shadows, radius } from '../theme';
import { MascotImages } from '../../assets';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Currency-style texture pattern overlay
const TexturePattern = () => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <Svg width={screenWidth} height={screenHeight * 2} style={StyleSheet.absoluteFill}>
      <Defs>
        <Pattern
          id="dashDiagonal"
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
          id="dashCrossHatch"
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
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#dashDiagonal)" />
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#dashCrossHatch)" />
    </Svg>
  </View>
);

// Mock data - revenue trend
const revenueData = [2100, 2400, 2850, 2600, 3200, 3100, 3650, 3400, 3850, 4200, 4100, 4680];

const recentEvents = [
  { id: '1', name: "Farmer's Market Downtown", date: 'Feb 1, 2026', profit: 342.60 },
  { id: '2', name: 'Art Walk Festival', date: 'Jan 28, 2026', profit: 617.00 },
  { id: '3', name: 'Food Truck Friday', date: 'Jan 24, 2026', profit: 271.30 },
];

// Finance-grade chart with thicker stroke and subtle gradient fill
const FinanceChart: React.FC<{ data: number[]; height?: number }> = ({ data, height = 100 }) => {
  const width = screenWidth - 64;
  const padding = { top: 12, bottom: 8, left: 0, right: 0 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const minValue = Math.min(...data) * 0.85;
  const maxValue = Math.max(...data) * 1.05;
  const range = maxValue - minValue;

  const points = data.map((value, index) => ({
    x: padding.left + (index / (data.length - 1)) * chartWidth,
    y: padding.top + chartHeight - ((value - minValue) / range) * chartHeight,
  }));

  // Create smooth bezier curve
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const tension = 0.3;
    const cp1x = prev.x + (curr.x - prev.x) * tension;
    const cp2x = curr.x - (curr.x - prev.x) * tension;
    pathD += ` C ${cp1x} ${prev.y}, ${cp2x} ${curr.y}, ${curr.x} ${curr.y}`;
  }

  // Area fill path
  const areaD = pathD + ` L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
  const lastPoint = points[points.length - 1];

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="tealGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={colors.chartLine} stopOpacity={0.12} />
          <Stop offset="100%" stopColor={colors.chartLine} stopOpacity={0.01} />
        </LinearGradient>
      </Defs>
      {/* Subtle gradient fill */}
      <Path d={areaD} fill="url(#tealGradient)" />
      {/* Thicker line for authority */}
      <Path d={pathD} stroke={colors.chartLine} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* End point indicator */}
      <Circle cx={lastPoint.x} cy={lastPoint.y} r={5} fill={colors.surface} stroke={colors.chartLine} strokeWidth={2.5} />
    </Svg>
  );
};

// Pill-style button
const PillButton: React.FC<{ label: string; onPress: () => void }> = ({ label, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      backgroundColor: colors.primary,
      borderRadius: radius.full,
      paddingVertical: 10,
      paddingHorizontal: 20,
    }}
    activeOpacity={0.85}
  >
    <Text style={{ fontSize: 14, fontWeight: '600', color: '#FFFFFF' }}>{label}</Text>
  </TouchableOpacity>
);

// Hero Revenue Card with embedded chart
const HeroRevenueCard: React.FC<{ revenue: string; change: string }> = ({ revenue, change }) => (
  <View style={[{ 
    backgroundColor: colors.surface, 
    borderRadius: radius.xl, 
    padding: 24,
    paddingBottom: 16,
  }, shadows.lg]}>
    <Text style={{ 
      fontSize: 11, 
      fontWeight: '600', 
      color: colors.textTertiary, 
      letterSpacing: 0.8, 
      textTransform: 'uppercase',
      marginBottom: 8,
    }}>
      Total Revenue
    </Text>
    <Text style={{ 
      fontSize: 44, 
      fontWeight: '700', 
      color: colors.textPrimary, 
      letterSpacing: -1.5,
      marginBottom: 4,
    }}>
      {revenue}
    </Text>
    <Text style={{ 
      fontSize: 14, 
      fontWeight: '600', 
      color: colors.growth,
      marginBottom: 20,
    }}>
      {change}
    </Text>
    <FinanceChart data={revenueData} height={90} />
  </View>
);

// Compact metric card for secondary stats
const MetricCard: React.FC<{ label: string; value: string; subtitle?: string }> = ({ label, value, subtitle }) => (
  <View style={[{ 
    backgroundColor: colors.surface, 
    borderRadius: radius.xl, 
    padding: 20,
    flex: 1,
  }, shadows.md]}>
    <Text style={{ 
      fontSize: 11, 
      fontWeight: '600', 
      color: colors.textTertiary, 
      letterSpacing: 0.8, 
      textTransform: 'uppercase',
      marginBottom: 10,
    }}>
      {label}
    </Text>
    <Text style={{ 
      fontSize: 26, 
      fontWeight: '700', 
      color: colors.textPrimary, 
      letterSpacing: -0.3,
    }}>
      {value}
    </Text>
    {subtitle && (
      <Text style={{ 
        fontSize: 13, 
        fontWeight: '500', 
        color: colors.growth, 
        marginTop: 4,
      }}>
        {subtitle}
      </Text>
    )}
  </View>
);

// Event row for recent events
const EventRow: React.FC<{
  event: { id: string; name: string; date: string; profit: number };
  onPress: () => void;
  isLast?: boolean;
}> = ({ event, onPress, isLast }) => (
  <TouchableOpacity 
    onPress={onPress} 
    style={{ 
      flexDirection: 'row', 
      alignItems: 'center', 
      paddingVertical: 16,
      borderBottomWidth: isLast ? 0 : 1,
      borderBottomColor: colors.divider,
    }} 
    activeOpacity={0.7}
  >
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }} numberOfLines={1}>
        {event.name}
      </Text>
      <Text style={{ fontSize: 13, color: colors.textTertiary, marginTop: 3 }}>
        {event.date}
      </Text>
    </View>
    <Text style={{ fontSize: 17, fontWeight: '700', color: colors.growth, marginRight: 12 }}>
      +${event.profit.toFixed(0)}
    </Text>
    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
  </TouchableOpacity>
);

interface DashboardScreenProps {
  navigation: any;
}

/**
 * DashboardScreen - Executive Finance-Grade Design
 * Calm, confident, authority - feels like real money
 */
export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TexturePattern />
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Header Section */}
        <View style={{ 
          paddingHorizontal: 24, 
          paddingTop: 60, 
          paddingBottom: 28,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image 
                source={MascotImages.wink} 
                style={{ width: 56, height: 56, marginRight: 12 }} 
                resizeMode="contain" 
              />
              <View>
                <Text style={{ 
                  fontSize: 28, 
                  fontWeight: '700', 
                  color: colors.textPrimary, 
                  letterSpacing: -0.5,
                  marginBottom: 2,
                }}>
                  Your Hustle
                </Text>
                <Text style={{ 
                  fontSize: 14, 
                  color: colors.textSecondary,
                }}>
                  This Month Overview
                </Text>
              </View>
            </View>
            <PillButton 
              label="New Event" 
              onPress={() => navigation?.navigate('CreateEvent')} 
            />
          </View>
        </View>

        {/* Content */}
        <View style={{ paddingHorizontal: 24 }}>
          {/* Hero Revenue Card */}
          <View style={{ marginBottom: 16 }}>
            <HeroRevenueCard revenue="$4,680" change="+12.5% from last month" />
          </View>

          {/* Secondary Metrics Row */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 32 }}>
            <MetricCard label="Net Profit" value="$2,124" subtitle="+8.2%" />
            <MetricCard label="Events" value="12" subtitle="This month" />
          </View>

          {/* Recent Events Section */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={{ 
                fontSize: 11, 
                fontWeight: '600', 
                color: colors.textTertiary, 
                letterSpacing: 0.8, 
                textTransform: 'uppercase',
              }}>
                Recent Events
              </Text>
              <TouchableOpacity onPress={() => navigation?.navigate('Events')}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={[{ 
              backgroundColor: colors.surface, 
              borderRadius: radius.xl, 
              paddingHorizontal: 20,
            }, shadows.md]}>
              {recentEvents.map((event, index) => (
                <EventRow 
                  key={event.id} 
                  event={event} 
                  onPress={() => navigation?.navigate('EventDetail', { eventId: event.id })} 
                  isLast={index === recentEvents.length - 1} 
                />
              ))}
            </View>
          </View>

          {/* Quick Action */}
          <TouchableOpacity
            onPress={() => navigation?.navigate('QuickSale', { eventId: recentEvents[0]?.id })}
            style={[{
              backgroundColor: colors.surface,
              borderRadius: radius.xl,
              padding: 20,
              flexDirection: 'row',
              alignItems: 'center',
            }, shadows.md]}
            activeOpacity={0.7}
          >
            <View style={{ 
              width: 44, 
              height: 44, 
              borderRadius: 12, 
              backgroundColor: colors.primaryLight, 
              alignItems: 'center', 
              justifyContent: 'center',
              marginRight: 16,
            }}>
              <Ionicons name="flash" size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>
                Quick Sale
              </Text>
              <Text style={{ fontSize: 13, color: colors.textTertiary, marginTop: 2 }}>
                Record a sale in seconds
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default DashboardScreen;
