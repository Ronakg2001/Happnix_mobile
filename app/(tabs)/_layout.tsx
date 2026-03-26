import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import { Compass, Home, Ticket, UserCircle } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Image, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { HX_LOGO2 } from '../../constants/images';

const tabConfig: Record<string, { color: string, icon: any }> = {
  index: { color: 'rgba(219, 48, 130, 0.7)', icon: Home },
  discover: { color: 'rgba(155, 60, 212, 0.7)', icon: Compass },
  create: { color: 'rgba(98, 91, 214, 0.7)', icon: null },
  tickets: { color: 'rgba(54, 118, 198, 0.7)', icon: Ticket },
  profile: { color: 'rgba(20, 146, 175, 0.7)', icon: UserCircle },
};

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const activeIndex = state.index;
  const activeRouteName = state.routes[activeIndex].name;
  const activeColor = tabConfig[activeRouteName]?.color || 'rgba(255, 255, 255, 0.1)';

  // Animate the container's border and shadow dynamically
  const containerProgress = useSharedValue(0);

  useEffect(() => {
    containerProgress.value = withTiming(activeIndex, { duration: 300 });
  }, [activeIndex]);

  const containerAnimatedStyle = useAnimatedStyle(() => {
    // We cannot easily animate box-shadow colors in Reanimated directly on all platforms reliably without
    // interpolateColor or separate shadow opacity handling, but we can animate borderColor easily.
    const borderColor = withTiming(activeColor, { duration: 300 });
    const shadowColor = withTiming(activeColor.replace('0.7', '1'), { duration: 300 });

    return {
      borderColor,
      shadowColor,
    };
  });

  return (
    <View style={styles.tabContainerWrapper}>
      <Animated.View style={[styles.tabContainer, containerAnimatedStyle]}>
        {state.routes.map((route, index) => {
          if (!tabConfig[route.name]) {
            return null; // Skip rendering any auto-injected tabs like 'explore'
          }
          const { options } = descriptors[route.key];

          const isFocused = state.index === index;
          const config = tabConfig[route.name] || { color: 'rgba(255, 255, 255, 0.5)', icon: Compass };

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
            />
          );
        })}
      </Animated.View>
    </View>
  );
}

function TabButton({ isFocused, onPress, config, isCenter }: any) {
  const scale = useSharedValue(isFocused ? (isCenter ? 1.1 : 1.15) : 1);
  const translateY = useSharedValue(isFocused ? (isCenter ? 0 : -4) : 0);
  const opacity = useSharedValue(isFocused ? 1 : 0.4);

  useEffect(() => {
    scale.value = withSpring(isFocused ? (isCenter ? 1.1 : 1.15) : 1, { damping: 14, stiffness: 150 });
    translateY.value = withSpring(isFocused ? (isCenter ? 0 : -4) : 0, { damping: 14, stiffness: 150 });
    opacity.value = withTiming(isFocused ? 1 : 0.4, { duration: 250 });
  }, [isFocused]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { scale: scale.value }
      ],
      // Let opacity animate the color of non-center icons
    };
  });

  if (isCenter) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.centerTabBtn}>
        <Animated.View style={[styles.centerLogoActive, animatedStyle]}>
          <Image source={HX_LOGO2} style={styles.happnixLogoImg} resizeMode="contain" />
        </Animated.View>
      </TouchableOpacity>
    );
  }

  const IconComponent = config?.icon || Compass;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.tabBtn}>
      <Animated.View style={[animatedStyle, { opacity }]}>
        <IconComponent
          size={28}
          color={isFocused ? config.color.replace('0.7', '1') : 'rgba(255, 255, 255, 1)'}
          strokeWidth={isFocused ? 2.5 : 2}
        />
      </Animated.View>
    </TouchableOpacity>
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

const styles = StyleSheet.create({
  tabContainerWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 20,
    width: '100%',
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    marginHorizontal: 'auto',
    height: 64,
    backgroundColor: 'rgba(30, 35, 50, 0.95)', // Used instead of blur for broad compatibility
    borderWidth: 2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 70,
    borderBottomRightRadius: 70,
    paddingHorizontal: 12,
    // Base shadow, the shadowColor will be animated dynamically
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  tabBtn: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  centerTabBtn: {
    width: 60,
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
    width: 60,
    height: 60,
  }
});
