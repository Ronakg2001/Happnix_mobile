import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, Image, Dimensions, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ArrowLeft, MapPin, Calendar, Clock, Users, Ticket,
  Share2, Heart, BadgeCheck,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function EventDetailScreen() {
  const params = useLocalSearchParams();

  const event = {
    id: params.id as string,
    title: params.title as string || 'Event',
    description: params.description as string || '',
    hostUsername: params.hostUsername as string || 'Host',
    locationName: params.locationName as string || 'Location TBD',
    latitude: params.latitude as string || '0',
    longitude: params.longitude as string || '0',
    startAt: params.startAt as string || '',
    endAt: params.endAt as string || '',
    startLabel: params.startLabel as string || '',
    price: params.price as string || '0',
    currency: params.currency as string || 'INR',
    imageUrl: params.imageUrl as string || '',
    eventCategory: params.eventCategory as string || 'Event',
    maxAttendees: params.maxAttendees as string || '0',
    ticketsSold: params.ticketsSold as string || '0',
    canBook: params.canBook === 'true',
    mapUrl: params.mapUrl as string || '',
  };

  const isFree = parseFloat(event.price) === 0;
  const formattedDate = event.startAt
    ? new Date(event.startAt).toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : event.startLabel || 'Date TBD';
  const formattedTime = event.startAt
    ? new Date(event.startAt).toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit',
      })
    : '';

  const openMap = () => {
    const url = event.mapUrl || `https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`;
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.bgWrapper}>
          <LinearGradient colors={['rgba(7, 11, 23, 0.96)', 'rgba(7, 11, 23, 0.86)']} style={StyleSheet.absoluteFillObject} />
          <View style={[styles.orb, styles.orbViolet]} />
          <View style={[styles.orb, styles.orbCyan]} />
        </View>

        {/* Floating Header */}
        <View style={styles.floatingHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <ArrowLeft color="#fff" size={22} />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerBtn}>
              <Heart color="#fff" size={22} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn}>
              <Share2 color="#fff" size={22} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Cover Image */}
          <View style={styles.coverContainer}>
            {event.imageUrl ? (
              <Image source={{ uri: event.imageUrl }} style={styles.coverImage} />
            ) : (
              <LinearGradient colors={['#7c3aed', '#c026d3', '#22d3ee']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.coverPlaceholder}>
                <Text style={styles.coverPlaceholderText}>{event.title.charAt(0)}</Text>
              </LinearGradient>
            )}
            <LinearGradient
              colors={['transparent', 'rgba(7, 11, 23, 0.95)']}
              style={styles.coverGradient}
            />
            <View style={styles.coverBadge}>
              <Text style={styles.coverBadgeText}>
                {event.eventCategory.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Title */}
            <Text style={styles.eventTitle}>{event.title}</Text>

            {/* Host */}
            <View style={styles.hostRow}>
              <View style={styles.hostAvatar}>
                <Text style={styles.hostAvatarText}>
                  {event.hostUsername.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <View style={styles.hostNameRow}>
                  <Text style={styles.hostName}>{event.hostUsername}</Text>
                  <BadgeCheck color="#47e8ff" size={16} />
                </View>
                <Text style={styles.hostLabel}>Event Host</Text>
              </View>
            </View>

            {/* Info Cards */}
            <View style={styles.infoGrid}>
              <View style={styles.infoCard}>
                <Calendar color="#d946ef" size={20} />
                <Text style={styles.infoLabel}>DATE</Text>
                <Text style={styles.infoValue} numberOfLines={2}>{formattedDate}</Text>
              </View>
              {formattedTime ? (
                <View style={styles.infoCard}>
                  <Clock color="#22d3ee" size={20} />
                  <Text style={styles.infoLabel}>TIME</Text>
                  <Text style={styles.infoValue}>{formattedTime}</Text>
                </View>
              ) : null}
              <View style={styles.infoCard}>
                <Ticket color="#d946ef" size={20} />
                <Text style={styles.infoLabel}>PRICE</Text>
                <Text style={styles.infoValue}>
                  {isFree ? 'Free' : `${event.currency} ${event.price}`}
                </Text>
              </View>
              {parseInt(event.maxAttendees) > 0 && (
                <View style={styles.infoCard}>
                  <Users color="#22d3ee" size={20} />
                  <Text style={styles.infoLabel}>CAPACITY</Text>
                  <Text style={styles.infoValue}>
                    {event.ticketsSold}/{event.maxAttendees}
                  </Text>
                </View>
              )}
            </View>

            {/* Location */}
            <TouchableOpacity onPress={openMap} activeOpacity={0.7} style={styles.locationCard}>
              <MapPin color="#d946ef" size={22} />
              <View style={{ flex: 1 }}>
                <Text style={styles.locationName}>{event.locationName}</Text>
                <Text style={styles.locationHint}>Tap to open in Maps →</Text>
              </View>
            </TouchableOpacity>

            {/* Description */}
            {event.description ? (
              <View style={styles.descSection}>
                <Text style={styles.sectionTitle}>ABOUT</Text>
                <Text style={styles.descText}>{event.description}</Text>
              </View>
            ) : null}

            {/* Book Button */}
            {event.canBook && (
              <TouchableOpacity activeOpacity={0.8} style={{ marginTop: 20 }}>
                <LinearGradient
                  colors={['#ec4899', '#9333ea', '#22d3ee']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.bookBtn}
                >
                  <Text style={styles.bookBtnText}>
                    {isFree ? 'RSVP — Free Entry' : `Book — ${event.currency} ${event.price}`}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#070b17' },
  container: { flex: 1, backgroundColor: '#070b17' },
  bgWrapper: { position: 'absolute', width: '100%', height: '100%', zIndex: 0 },
  orb: { position: 'absolute', width: 400, height: 400, borderRadius: 200, opacity: 0.15 },
  orbViolet: { top: 200, right: '-30%', backgroundColor: '#ff4fd8' },
  orbCyan: { bottom: -100, left: '-30%', backgroundColor: '#47e8ff' },

  floatingHeader: {
    position: 'absolute', top: 48, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 20, zIndex: 20,
  },
  headerActions: { flexDirection: 'row', gap: 12 },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)',
  },

  scrollContent: { paddingBottom: 80 },

  coverContainer: { width: '100%', height: width * 0.8, position: 'relative' },
  coverImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  coverPlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  coverPlaceholderText: { fontFamily: 'Syne_800ExtraBold', fontSize: 80, color: 'rgba(255,255,255,0.2)' },
  coverGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 120 },
  coverBadge: {
    position: 'absolute', bottom: 16, left: 20,
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 12, borderWidth: 1, borderColor: '#d946ef',
  },
  coverBadgeText: { fontFamily: 'Outfit_800ExtraBold', color: '#d946ef', fontSize: 10, letterSpacing: 1 },

  content: { paddingHorizontal: 20, paddingTop: 4 },

  eventTitle: { fontFamily: 'Syne_800ExtraBold', fontSize: 28, color: '#f8f9ff', lineHeight: 36, marginBottom: 16 },

  hostRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  hostAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#7c3aed', justifyContent: 'center', alignItems: 'center',
  },
  hostAvatarText: { fontFamily: 'Syne_800ExtraBold', color: '#fff', fontSize: 18 },
  hostNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hostName: { fontFamily: 'Sora_700Bold', fontSize: 15, color: '#f8f9ff' },
  hostLabel: { fontFamily: 'Sora_400Regular', fontSize: 12, color: '#94a3b8', marginTop: 2 },

  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  infoCard: {
    flex: 1, minWidth: (width - 50) / 2,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)',
    gap: 6,
  },
  infoLabel: { fontFamily: 'Outfit_800ExtraBold', fontSize: 10, color: '#64748b', letterSpacing: 1.5 },
  infoValue: { fontFamily: 'Sora_700Bold', fontSize: 14, color: '#f8f9ff' },

  locationCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 20,
  },
  locationName: { fontFamily: 'Sora_700Bold', fontSize: 14, color: '#f8f9ff' },
  locationHint: { fontFamily: 'Sora_400Regular', fontSize: 12, color: '#94a3b8', marginTop: 4 },

  descSection: { marginBottom: 10 },
  sectionTitle: { fontFamily: 'Outfit_800ExtraBold', fontSize: 10, color: '#9ca3af', letterSpacing: 2, marginBottom: 10 },
  descText: { fontFamily: 'Sora_400Regular', fontSize: 15, color: '#cbd5e1', lineHeight: 24 },

  bookBtn: { padding: 16, borderRadius: 14, alignItems: 'center' },
  bookBtnText: { fontFamily: 'Sora_800ExtraBold', color: '#fff', fontSize: 15, letterSpacing: 0.5 },
});
