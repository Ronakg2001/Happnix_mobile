import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { GlassView } from 'expo-glass-effect';
import { MeshGradientView } from 'expo-mesh-gradient';
import { Tabs } from 'expo-router';
import { Compass, Home, Ticket, UserCircle } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef } from 'react';
import { Image, LayoutChangeEvent, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { HX_LOGO2 } from '../../constants/images';

// ─── Tab configuration ──────────────────────────────────────────────────────
const tabConfig: Record<string, { color: string; glowColor: string; icon: any }> = {
  index: { color: 'rgba(219, 48, 130, 0.7)', glowColor: '#DB3082', icon: Home },
  discover: { color: 'rgba(155, 60, 212, 0.7)', glowColor: '#9B3CD4', icon: Compass },
  create: { color: 'rgba(98, 91, 214, 0.7)', glowColor: '#625BD6', icon: null },
  tickets: { color: 'rgba(54, 118, 198, 0.7)', glowColor: '#3676C6', icon: Ticket },
  profile: { color: 'rgba(20, 146, 175, 0.7)', glowColor: '#1492AF', icon: UserCircle },
};

// Spring config for liquid-feeling motion
const LIQUID_SPRING = { damping: 18, stiffness: 160, mass: 0.8 };
const PILL_SPRING = { damping: 20, stiffness: 140, mass: 0.6 };

// ─── Liquid Glass Selector Pill ─────────────────────────────────────────────
function LiquidGlassPill({
  translateX,
  activeColor,
  activeGlow,
}: {
  translateX: SharedValue<number>;
  activeColor: SharedValue<string>;
  activeGlow: SharedValue<string>;
}) {
  const shimmerProgress = useSharedValue(0);

  useEffect(() => {
    shimmerProgress.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    backgroundColor: activeColor.value,
    shadowColor: activeGlow.value,
  }));

  const shimmerStyle = useAnimatedStyle(() => {
    const x = interpolate(shimmerProgress.value, [0, 1], [-20, 60]);
    return {
      transform: [{ translateX: x }, { rotate: '25deg' }],
      opacity: interpolate(shimmerProgress.value, [0, 0.5, 1], [0.15, 0.45, 0.15]),
    };
  });

  return (
    <Animated.View style={[styles.liquidPill, pillStyle]}>
      <View style={styles.pillInnerGlass}>
        <View style={styles.pillSpecularTop} />
        <Animated.View style={[styles.pillShimmer, shimmerStyle]} />
      </View>
      <View style={styles.pillInnerBorder} />
    </Animated.View>
  );
}

// ─── Individual Tab Button ──────────────────────────────────────────────────
function TabButton({
  isFocused,
  onPress,
  config,
  isCenter,
  onLayout,
}: {
  isFocused: boolean;
  onPress: () => void;
  config: { color: string; glowColor: string; icon: any };
  isCenter: boolean;
  onLayout?: (event: LayoutChangeEvent) => void;
}) {
  const scale = useSharedValue(isFocused ? (isCenter ? 1.1 : 1.15) : 1);
  const translateY = useSharedValue(isFocused ? (isCenter ? 0 : -4) : 0);
  const opacity = useSharedValue(isFocused ? 1 : 0.4);

  useEffect(() => {
    scale.value = withSpring(isFocused ? (isCenter ? 1.1 : 1.1) : 1, { damping: 14, stiffness: 150 });
    translateY.value = withSpring(isFocused ? (isCenter ? 0 : -2) : 0, { damping: 14, stiffness: 150 });
    opacity.value = withTiming(isFocused ? 1 : 0.6, { duration: 250 });
  }, [isFocused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ],
    opacity: opacity.value,
  }));

  if (isCenter) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={styles.centerTabBtn}
        onLayout={onLayout}
      >
        <Animated.View style={[styles.centerLogoActive, animatedStyle]}>
          <Image source={HX_LOGO2} style={styles.happnixLogoImg} resizeMode="contain" />
        </Animated.View>
      </TouchableOpacity>
    );
  }

  const IconComponent = config?.icon || Compass;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.tabBtn}
      onLayout={onLayout}
    >
      <Animated.View style={[animatedStyle, { zIndex: 2 }]}>
        <IconComponent
          size={24}
          color={isFocused ? '#ffffff' : 'rgba(255, 255, 255, 0.7)'}
          strokeWidth={isFocused ? 2.5 : 2}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Custom Tab Bar ─────────────────────────────────────────────────────────
function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const activeIndex = state.index;
  const activeRouteName = state.routes[activeIndex]?.name;
  const activeConfig = tabConfig[activeRouteName] || tabConfig['index'];

  const tabPositions = useRef<number[]>([]);
  const pillTranslateX = useSharedValue(0);
  const animatedColor = useSharedValue(activeConfig.color);
  const animatedGlow = useSharedValue(activeConfig.glowColor);

  useEffect(() => {
    animatedColor.value = withTiming(activeConfig.color, { duration: 350 });
    animatedGlow.value = withTiming(activeConfig.glowColor, { duration: 350 });

    const targetX = tabPositions.current[activeIndex];
    if (targetX !== undefined) {
      pillTranslateX.value = withSpring(targetX - PILL_SIZE / 2, PILL_SPRING);
    }
  }, [activeIndex, activeConfig]);

  const handleTabLayout = useCallback(
    (index: number) => (event: LayoutChangeEvent) => {
      const { x, width } = event.nativeEvent.layout;
      tabPositions.current[index] = x + width / 2;
      if (index === activeIndex) {
        pillTranslateX.value = x + width / 2 - PILL_SIZE / 2;
      }
    },
    [activeIndex]
  );

  const containerAnimatedStyle = useAnimatedStyle(() => {
    const borderColor = withTiming(activeConfig.color, { duration: 300 });
    const shadowColor = withTiming(activeConfig.glowColor, { duration: 300 });
    return {
      borderColor,
      shadowColor,
    };
  });

  return (
    <View style={styles.tabContainerWrapper}>
      <Animated.View style={[styles.tabContainer, containerAnimatedStyle]}>
        <View style={styles.glassWrapper}>
          <MeshGradientView
            style={StyleSheet.absoluteFill}
            columns={3}
            rows={3}
            colors={[
              '#1a1f35', '#242b4d', '#1a1f35',
              '#2d3663', '#1e2540', '#2d3663',
              '#1a1f35', '#242b4d', '#1a1f35'
            ]}
          />
          <GlassView
            glassEffectStyle="regular"
            colorScheme="dark"
            style={StyleSheet.absoluteFill}
          />
        </View>

        <LiquidGlassPill
          translateX={pillTranslateX}
          activeColor={animatedColor}
          activeGlow={animatedGlow}
        />

        {state.routes.map((route, index) => {
          if (!tabConfig[route.name]) return null;
          const isFocused = state.index === index;
          const config = tabConfig[route.name];

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <TabButton
              key={route.key}
              isFocused={isFocused}
              onPress={onPress}
              config={config}
              isCenter={route.name === 'create'}
              onLayout={handleTabLayout(index)}
            />
          );
        })}
      </Animated.View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="discover" />
      <Tabs.Screen name="create" />
      <Tabs.Screen name="tickets" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const PILL_SIZE = 44; // Matches original activePill size

const styles = StyleSheet.create({
  tabContainerWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 20, // Restored original
    width: '100%',
    paddingHorizontal: 24, // Restored original
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Restored original
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
    marginHorizontal: 'auto',
    height: 70, // Restored original
    backgroundColor: 'rgba(20, 24, 39, 0.4)', // Restored original
    borderWidth: 1.5, // Restored original
    borderRadius: 35, // Restored original
    paddingHorizontal: 8, // Restored original
    shadowOffset: { width: 0, height: 15 }, // Restored original
    shadowOpacity: 0.4, // Restored original
    shadowRadius: 25, // Restored original
    elevation: 20, // Restored original
    overflow: 'hidden',
  },
  glassWrapper: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 35,
    overflow: 'hidden',
    zIndex: 0,
  },
  liquidPill: {
    position: 'absolute',
    width: PILL_SIZE,
    height: PILL_SIZE,
    borderRadius: PILL_SIZE / 2,
    overflow: 'hidden',
    top: (70 - PILL_SIZE) / 2, // Precisely centered vertically in 70px height
    zIndex: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 10,
  },
  pillInnerGlass: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: PILL_SIZE / 2,
    overflow: 'hidden',
  },
  pillSpecularTop: {
    position: 'absolute',
    top: 0,
    left: 6,
    right: 6,
    height: 1.5,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  pillShimmer: {
    position: 'absolute',
    top: -8,
    left: -10,
    width: 28,
    height: 60,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  pillInnerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: PILL_SIZE / 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  tabBtn: {
    width: 60, // Restored original
    height: 60, // Restored original
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    position: 'relative',
  },
  centerTabBtn: {
    width: 60, // Restored original
    height: 60, // Restored original
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  centerLogoActive: {
    borderColor: 'rgba(98, 91, 214, 0.7)',
    shadowColor: 'rgba(255, 255, 255, 0.8)',
    shadowRadius: 15,
  },
  happnixLogoImg: {
    width: 50, // Restored original
    height: 50, // Restored original
  },
});
