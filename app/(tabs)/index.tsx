import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity, SafeAreaView, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Sun, Heart, MessageCircle, MoreHorizontal, Send, Bookmark, Plus } from 'lucide-react-native';
import { router } from 'expo-router';
import { eventApi } from '../../services/api';
import { HX_LOGO } from '../../constants/images';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventApi.nearby(28.7041, 77.1025, 50);
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderEvent = ({ item }: any) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push({ pathname: '/event-detail', params: {
        id: item.id?.toString(),
        title: item.title,
        description: item.description,
        hostUsername: item.hostUsername,
        locationName: item.locationName,
        latitude: item.latitude?.toString(),
        longitude: item.longitude?.toString(),
        startAt: item.startAt,
        startLabel: item.startLabel,
        price: item.price?.toString(),
        currency: item.currency,
        imageUrl: item.imageUrl,
        eventCategory: item.eventCategory,
        maxAttendees: item.maxAttendees?.toString(),
        ticketsSold: item.ticketsSold?.toString(),
        canBook: item.canBook?.toString(),
        mapUrl: item.mapUrl,
      }})}
    >
    <LinearGradient
      colors={['rgba(17, 23, 48, 0.7)', 'rgba(10, 14, 29, 0.58)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.feedCard}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
           <View style={styles.hostAvatarPlaceholder}>
              <Text style={styles.hostAvatarText}>{item.hostUsername?.charAt(0)?.toUpperCase() || 'H'}</Text>
           </View>
           <View>
             <Text style={styles.hostName}>{item.hostUsername || 'Host'}</Text>
             <Text style={styles.locationText}>{item.locationName}</Text>
           </View>
        </View>
        <TouchableOpacity style={styles.moreOptions}><MoreHorizontal color="#f8f9ff" size={20} /></TouchableOpacity>
      </View>

      <View style={styles.cardImageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
        ) : (
          <View style={styles.cardImagePlaceholder}>
             <LinearGradient colors={['#7c3aed', '#c026d3']} style={StyleSheet.absoluteFillObject} />
             <Text style={styles.placeholderText}>Vibe</Text>
          </View>
        )}
        <View style={styles.eventBadge}>
          <Text style={styles.eventBadgeText}>UPCOMING</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <View style={styles.actionLeft}>
          <TouchableOpacity style={styles.actionBtn}><Heart color="#f8f9ff" size={24} /></TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}><MessageCircle color="#f8f9ff" size={24} /></TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}><Send color="#f8f9ff" size={24} /></TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.actionBtn}><Bookmark color="#f8f9ff" size={24} /></TouchableOpacity>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.likesText}>{item.currency} {item.price > 0 ? item.price : 'Free'}</Text>
        <Text style={styles.caption}>
          <Text style={styles.captionUser}>{item.hostUsername || 'Host'} </Text>
          {item.title}
        </Text>
        <Text style={styles.captionDesc}>{item.description}</Text>
        <Text style={styles.timeText}>{new Date(item.startAt || Date.now()).toLocaleDateString()}</Text>
      </View>
    </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.bgWrapper}>
           <LinearGradient colors={['rgba(7, 11, 23, 0.96)', 'rgba(7, 11, 23, 0.86)']} style={StyleSheet.absoluteFillObject} />
           <View style={[styles.orb, styles.orbViolet]} />
           <View style={[styles.orb, styles.orbCyan]} />
        </View>

        <View style={styles.header}>
          <Image source={HX_LOGO} style={styles.brandLogo} resizeMode="contain" />
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconCircle}><MapPin color="#f8f9ff" size={24} /></TouchableOpacity>
            <TouchableOpacity style={styles.iconCircle}><Sun color="#f8f9ff" size={24} /></TouchableOpacity>
            <TouchableOpacity style={styles.iconCircle}>
              <Heart color="#f8f9ff" size={24} />
              <View style={styles.pulseDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconCircle}><MessageCircle color="#f8f9ff" size={24} /></TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#47e8ff" />
          </View>
        ) : (
          <FlatList
            data={events.length > 0 ? events : [{id: 1, hostUsername: 'happnix', locationName: 'Local Club', title: 'Summer Groove'}]}
            keyExtractor={(item: any) => item.id.toString()}
            renderItem={renderEvent}
            ListHeaderComponent={() => (
              <View style={styles.storiesContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesScroll}>
                  <TouchableOpacity style={styles.addStory}>
                    <View style={styles.addStoryCircle}>
                      <Plus color="#fff" size={28} />
                    </View>
                    <Text style={styles.storyText}>Add Story</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.storyItem}>
                    <View style={styles.storyRing}>
                      <Image source={{uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop'}} style={styles.storyImage} />
                    </View>
                    <Text style={styles.storyText}>techno_...</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.storyItem}>
                    <View style={styles.storyRing}>
                      <Image source={{uri: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&h=100&fit=crop'}} style={styles.storyImage} />
                    </View>
                    <Text style={styles.storyText}>sarah_d...</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#070b17' },
  container: { flex: 1, backgroundColor: '#070b17' },
  bgWrapper: { position: 'absolute', width: '100%', height: '100%', zIndex: 0 },
  orb: { position: 'absolute', width: 400, height: 400, borderRadius: 200, opacity: 0.18 },
  orbViolet: { top: -50, left: '-10%', backgroundColor: '#ff4fd8' },
  orbCyan: { top: '30%', right: '-30%', backgroundColor: '#47e8ff' },
  
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(14, 20, 44, 0.88)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.14)',
    zIndex: 10,
  },
  brandLogo: { width: 120, height: 34 },
  headerIcons: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  iconCircle: { position: 'relative', width: 28, height: 28, justifyContent: 'center', alignItems: 'center' },
  pulseDot: { position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: '#ff4fd8' },

  storiesContainer: { paddingVertical: 16, marginBottom: 8 },
  storiesScroll: { paddingHorizontal: 20, gap: 16 },
  addStory: { alignItems: 'center', gap: 6, minWidth: 68 },
  addStoryCircle: { width: 68, height: 68, borderRadius: 34, borderWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  storyItem: { alignItems: 'center', gap: 6, minWidth: 68 },
  storyRing: { width: 68, height: 68, borderRadius: 34, padding: 2, borderWidth: 2, borderColor: '#d946ef', justifyContent: 'center', alignItems: 'center' },
  storyImage: { width: '100%', height: '100%', borderRadius: 34 },
  storyText: { fontFamily: 'Sora_600SemiBold', fontSize: 11, color: 'rgba(255, 255, 255, 0.6)' },

  listContent: { paddingHorizontal: 16, paddingBottom: 120 },
  feedCard: {
    marginBottom: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#040814',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.46,
    shadowRadius: 34,
    elevation: 8,
    overflow: 'hidden',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  hostAvatarPlaceholder: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#7c3aed', justifyContent: 'center', alignItems: 'center' },
  hostAvatarText: { fontFamily: 'Syne_800ExtraBold', color: '#fff', fontSize: 16 },
  hostName: { fontFamily: 'Sora_700Bold', fontSize: 14, color: '#f8f9ff' },
  locationText: { fontFamily: 'Sora_400Regular', fontSize: 12, color: '#94a3b8' },
  moreOptions: { justifyContent: 'center', alignItems: 'center' },

  cardImageContainer: { width: '100%', aspectRatio: 4/5, backgroundColor: 'rgba(7, 11, 23, 0.8)' },
  cardImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  cardImagePlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontFamily: 'Syne_800ExtraBold', color: '#fff', fontSize: 24, letterSpacing: 2 },
  eventBadge: { position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#47e8ff' },
  eventBadgeText: { fontFamily: 'Outfit_800ExtraBold', color: '#47e8ff', fontSize: 10, letterSpacing: 1 },

  cardActions: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  actionLeft: { flexDirection: 'row', gap: 16 },
  actionBtn: { padding: 2 },

  cardContent: { paddingHorizontal: 16, paddingBottom: 16 },
  likesText: { fontFamily: 'Sora_800ExtraBold', fontSize: 14, color: '#f8f9ff', marginBottom: 6 },
  caption: { fontFamily: 'Sora_400Regular', fontSize: 14, color: '#f8f9ff', lineHeight: 20 },
  captionUser: { fontFamily: 'Sora_700Bold' },
  captionDesc: { fontFamily: 'Sora_400Regular', fontSize: 14, color: '#94a3b8', marginTop: 4, lineHeight: 20 },
  timeText: { fontFamily: 'Outfit_600SemiBold', fontSize: 11, color: '#64748b', marginTop: 8, textTransform: 'uppercase', letterSpacing: 1 },
});
