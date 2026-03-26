import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Camera, Zap, Sparkles, LayoutGrid, User, MapPin, Calendar, Clock, Ticket, Smile, Banknote, ClipboardList, Image as ImageIcon, Navigation } from 'lucide-react-native';
import DatePickerModal from '@/components/ui/date-picker';
import TimePickerModal from '@/components/ui/time-picker';
import CategoryPicker from '@/components/ui/category-picker';
import ImagePickerButton from '@/components/ui/image-picker-button';
import { eventApi, EVENT_CATEGORIES } from '../../services/api';

export default function CreateScreen() {
  const [activeTab, setActiveTab] = useState<'post' | 'event'>('post');

  // Post State
  const [caption, setCaption] = useState('');
  const [postImages, setPostImages] = useState<string[]>([]);
  const [loadingPost, setLoadingPost] = useState(false);

  // Event State
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [highlights, setHighlights] = useState('');
  const [age, setAge] = useState('18+');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [eventCategory, setEventCategory] = useState('house party');
  const [ticketType, setTicketType] = useState('Free');
  const [price, setPrice] = useState('');
  const [maxAttendees, setMaxAttendees] = useState('');
  const [loadingEvent, setLoadingEvent] = useState(false);
  const [startLabel, setStartLabel] = useState('');
  const [eventCoverImages, setEventCoverImages] = useState<string[]>([]);

  // Coordinates (defaults to Delhi - will be replaced by location picker)
  const [latitude, setLatitude] = useState(28.7041);
  const [longitude, setLongitude] = useState(77.1025);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleCreatePost = () => {
    if (!caption) return Alert.alert('Error', 'Please write a caption');
    setLoadingPost(true);
    setTimeout(() => {
      setLoadingPost(false);
      Alert.alert('Success', 'Post published!');
      setCaption('');
    }, 1000);
  };

  const handleCreateEvent = async () => {
    if (!title || !bio || !location) {
      return Alert.alert('Error', 'Please fill title, bio, and location.');
    }

    setLoadingEvent(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', bio);
      formData.append('locationName', location);
      formData.append('latitude', latitude.toString());
      formData.append('longitude', longitude.toString());
      formData.append('eventCategory', eventCategory);
      formData.append('price', ticketType === 'Free' ? '0' : price || '0');
      formData.append('currency', 'INR');
      formData.append('maxAttendees', maxAttendees || '0');

      if (startLabel) {
        formData.append('startLabel', startLabel);
      }

      // Attach images if selected
      eventCoverImages.forEach((uri, i) => {
        const filename = uri.split('/').pop() || `image_${i}.jpg`;
        formData.append('eventMedia', {
          uri,
          name: filename,
          type: 'image/jpeg',
        } as any);
      });

      const res = await eventApi.create(formData);
      Alert.alert('Success', res.data.message || 'Event published!');

      // Reset form
      setTitle('');
      setBio('');
      setHighlights('');
      setLocation('');
      setDate('');
      setTime('');
      setStartLabel('');
      setPrice('');
      setMaxAttendees('');
      setEventCoverImages([]);
    } catch (error: any) {
      const msg = error.response?.data?.error || error.response?.data?.message || 'Failed to create event.';
      Alert.alert('Error', msg);
    } finally {
      setLoadingEvent(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    try {
      const Location = require('expo-location');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is needed to auto-fill your location.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLatitude(loc.coords.latitude);
      setLongitude(loc.coords.longitude);

      // Try reverse geocoding
      try {
        const [address] = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        if (address) {
          const name = [address.name, address.district, address.city].filter(Boolean).join(', ');
          setLocation(name || `${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`);
        }
      } catch {
        setLocation(`${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`);
      }
      Alert.alert('Location Set', 'Current location captured.');
    } catch (e) {
      Alert.alert('Error', 'expo-location is not available. Please enter location manually.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        <View style={styles.bgWrapper}>
           <LinearGradient colors={['rgba(7, 11, 23, 0.96)', 'rgba(7, 11, 23, 0.86)']} style={StyleSheet.absoluteFillObject} />
           <View style={[styles.orb, styles.orbViolet]} />
           <View style={[styles.orb, styles.orbCyan]} />
        </View>

        <View style={styles.header}>
            <Text style={styles.headerTitle}>Vibe</Text>
        </View>

        <View style={styles.segmentWrapper}>
           <View style={styles.segmentContainer}>
             <TouchableOpacity style={[styles.segmentBtn, activeTab === 'post' && styles.segmentActiveBtn]} onPress={() => setActiveTab('post')}>
               <Text style={[styles.segmentBtnText, activeTab === 'post' && styles.segmentActiveText]}>Post</Text>
             </TouchableOpacity>
             <TouchableOpacity style={[styles.segmentBtn, activeTab === 'event' && styles.segmentActiveBtn]} onPress={() => setActiveTab('event')}>
               <Text style={[styles.segmentBtnText, activeTab === 'event' && styles.segmentActiveText]}>Event</Text>
             </TouchableOpacity>
           </View>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {activeTab === 'post' ? (
              <View style={styles.formSection}>

                <ImagePickerButton
                  onImagesSelected={setPostImages}
                  selectedImages={postImages}
                  multiple
                  maxCount={10}
                  label="Upload Visuals (Max 10)"
                />

                <View style={styles.field}>
                  <TextInput
                    style={[styles.inputNeon, styles.textArea]}
                    placeholder="What's the vibe×"
                    value={caption}
                    onChangeText={setCaption}
                    multiline
                    placeholderTextColor="#64748b"
                  />
                </View>

                <View style={styles.linkWrap}>
                  <View style={styles.linkHeaderRow}>
                      <Text style={styles.linkHeaderTitle}>ATTACH TO EVENT</Text>
                      <Text style={styles.linkHeaderOpt}>OPTIONAL</Text>
                  </View>
                  <View style={styles.linkSelectBox}>
                      <Text style={{fontFamily: 'Sora_600SemiBold', color: '#fff', fontSize: 14}}>Just a normal post</Text>
                      <Text style={{fontFamily: 'Outfit_700Bold', color: '#9ca3af', fontSize: 12}}>▼</Text>
                  </View>
                  <Text style={styles.linkHelperTxt}>Choose one of your hosted events to turn this into a highlight.</Text>
                </View>

                <TouchableOpacity onPress={handleCreatePost} disabled={loadingPost} style={styles.submitSwipePanel}>
                  {loadingPost ? <ActivityIndicator color="#fff" /> : (
                      <>
                        <Text style={styles.swipePanelText}>PUBLISH POST</Text>
                        <View style={styles.swipePanelIcon}>
                           <Text style={{color: '#fff', fontSize: 16, fontWeight: 'bold'}}>»</Text>
                        </View>
                      </>
                  )}
                </TouchableOpacity>

              </View>
            ) : (
              <View style={styles.formSection}>

                <View style={styles.stepHeaderRow}>
                   <Text style={styles.stepHeaderTitle}>EVENT BUILDER</Text>
                </View>

                <View style={styles.inputNeonWrap}>
                   <Zap style={styles.neonIconAbs} color="#22d3ee" size={16} />
                   <TextInput
                      style={styles.inputNeonPad}
                      placeholder="Event Title (Max 50 chars)"
                      value={title}
                      onChangeText={setTitle}
                      maxLength={50}
                      placeholderTextColor="#9ca3af"
                   />
                </View>

                <ImagePickerButton
                  onImagesSelected={setEventCoverImages}
                  selectedImages={eventCoverImages}
                  multiple
                  maxCount={10}
                  label="Upload Cover & Highlights"
                />

                <View style={styles.inputNeonWrap}>
                  <TextInput
                    style={[styles.inputNeon, styles.textAreaEvent]}
                    placeholder="Event Bio (Tell us the vibe...)"
                    value={bio}
                    onChangeText={setBio}
                    multiline
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View style={styles.inputNeonWrap}>
                   <Sparkles style={styles.neonIconAbs} color="#d946ef" size={16} />
                   <TextInput
                      style={styles.inputNeonPad}
                      placeholder="Event Highlights (Optional)"
                      value={highlights}
                      onChangeText={setHighlights}
                      placeholderTextColor="#9ca3af"
                   />
                </View>

                {/* Category Picker */}
                <View style={{ marginBottom: 4 }}>
                  <Text style={[styles.stepHeaderTitle, { marginBottom: 8 }]}>EVENT CATEGORY</Text>
                  <CategoryPicker
                    categories={EVENT_CATEGORIES}
                    selected={eventCategory}
                    onSelect={setEventCategory}
                  />
                </View>

                <View style={styles.gridRow}>
                   <View style={[styles.inputNeonWrap, { flex: 2 }]}>
                      <LayoutGrid style={styles.neonIconAbs} color="#22d3ee" size={16} />
                      <TextInput style={styles.inputNeonPad} placeholder="Event Type" placeholderTextColor="#9ca3af" />
                   </View>
                   <View style={[styles.inputNeonWrap, { flex: 1 }]}>
                      <User style={styles.neonIconAbs} color="#d946ef" size={16} />
                      <TextInput style={styles.inputNeonPad} placeholder="18+" value={age} onChangeText={setAge} placeholderTextColor="#9ca3af" />
                   </View>
                </View>

                {/* Location with "Use Current" button */}
                <View style={styles.inputNeonWrap}>
                   <MapPin style={styles.neonIconAbs} color="#d946ef" size={16} />
                   <TextInput
                      style={[styles.inputNeonPad, { paddingRight: 48 }]}
                      placeholder="Event location"
                      value={location}
                      onChangeText={setLocation}
                      placeholderTextColor="#9ca3af"
                   />
                   <TouchableOpacity
                     style={styles.locationBtn}
                     onPress={handleUseCurrentLocation}
                     activeOpacity={0.7}
                   >
                     <Navigation color="#22d3ee" size={16} />
                   </TouchableOpacity>
                </View>

                <View style={styles.gridRow}>
                   <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.8} style={[styles.inputNeonWrap, { flex: 1 }]}>
                      <Calendar style={styles.neonIconAbs} color="#d946ef" size={16} />
                      <View style={styles.inputNeonPad}>
                        <Text style={{ color: date ? '#fff' : '#9ca3af', fontFamily: 'Sora_400Regular' }}>{date || "Date"}</Text>
                      </View>
                   </TouchableOpacity>
                   <TouchableOpacity onPress={() => setShowTimePicker(true)} activeOpacity={0.8} style={[styles.inputNeonWrap, { flex: 1 }]}>
                      <Clock style={styles.neonIconAbs} color="#22d3ee" size={16} />
                      <View style={styles.inputNeonPad}>
                        <Text style={{ color: time ? '#fff' : '#9ca3af', fontFamily: 'Sora_400Regular' }}>{time || "Start time"}</Text>
                      </View>
                   </TouchableOpacity>
                </View>

                {/* Max Attendees */}
                <View style={styles.inputNeonWrap}>
                   <User style={styles.neonIconAbs} color="#22d3ee" size={16} />
                   <TextInput
                      style={styles.inputNeonPad}
                      placeholder="Max Attendees (0 = unlimited)"
                      value={maxAttendees}
                      onChangeText={setMaxAttendees}
                      keyboardType="number-pad"
                      placeholderTextColor="#9ca3af"
                   />
                </View>

                <View style={[styles.stepHeaderRow, { marginTop: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', paddingBottom: 10 }]}>
                   <Ticket color="#d946ef" size={20} />
                   <Text style={[styles.stepHeaderTitle, { color: '#fff', fontSize: 16, textTransform: 'none', marginLeft: 8, flex: 1 }]}>Ticketing</Text>
                </View>

                <View style={styles.ticketGridRow}>
                   <TouchableOpacity onPress={() => setTicketType('Free')} style={[styles.ticketBox, ticketType === 'Free' && styles.ticketBoxActive]}>
                      <Smile color={ticketType === 'Free' ? '#4ade80' : '#9ca3af'} size={28} style={{marginBottom: 8}} />
                      <Text style={styles.ticketBoxTitle}>Free Event</Text>
                   </TouchableOpacity>
                   <TouchableOpacity onPress={() => setTicketType('Paid')} style={[styles.ticketBox, ticketType === 'Paid' && styles.ticketBoxActive]}>
                      <Banknote color={ticketType === 'Paid' ? '#22d3ee' : '#9ca3af'} size={28} style={{marginBottom: 8}} />
                      <Text style={styles.ticketBoxTitle}>Paid Tickets</Text>
                   </TouchableOpacity>
                   <View style={styles.ticketBoxDisabled}>
                      <ClipboardList color="#64748b" size={28} style={{marginBottom: 8}} />
                      <Text style={styles.ticketBoxTitle}>Guestlist</Text>
                   </View>
                </View>

                {ticketType === 'Paid' && (
                  <View style={styles.inputNeonWrap}>
                    <Banknote style={styles.neonIconAbs} color="#22d3ee" size={16} />
                    <TextInput
                      style={styles.inputNeonPad}
                      placeholder="Ticket Price (INR)"
                      value={price}
                      onChangeText={setPrice}
                      keyboardType="number-pad"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                )}

                <TouchableOpacity onPress={handleCreateEvent} disabled={loadingEvent} activeOpacity={0.8} style={{marginTop: 16}}>
                  <LinearGradient colors={['#ec4899', '#9333ea', '#22d3ee']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.btnPrimary}>
                    {loadingEvent ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Publish Event</Text>}
                  </LinearGradient>
                </TouchableOpacity>

              </View>
            )}

          </ScrollView>
        </KeyboardAvoidingView>

        <DatePickerModal
          visible={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          onSave={(d) => {
            const dateStr = d.toLocaleDateString();
            setDate(dateStr);
            // Create startLabel for backend
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const currentStart = startLabel;
            const timePart = currentStart.includes(' ') ? currentStart.split(' ').slice(1).join(' ') : '';
            setStartLabel(`${year}-${month}-${day}${timePart ? ' ' + timePart : ''}`);
            setShowDatePicker(false);
          }}
        />
        <TimePickerModal
          visible={showTimePicker}
          onClose={() => setShowTimePicker(false)}
          onSave={(t) => {
            const timeStr = `${t.hour}:${t.minute.toString().padStart(2, '0')} ${t.period}`;
            setTime(timeStr);
            // Update startLabel with time
            const datePart = startLabel.split(' ')[0] || '';
            if (datePart) {
              // Convert 12h to 24h for backend
              let h = t.hour;
              if (t.period === 'PM' && h !== 12) h += 12;
              if (t.period === 'AM' && h === 12) h = 0;
              setStartLabel(`${datePart} ${String(h).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`);
            }
            setShowTimePicker(false);
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#070b17' },
  container: { flex: 1, backgroundColor: '#070b17' },
  bgWrapper: { position: 'absolute', width: '100%', height: '100%', zIndex: 0 },
  orb: { position: 'absolute', width: 400, height: 400, borderRadius: 200, opacity: 0.18 },
  orbViolet: { top: -50, right: '-20%', backgroundColor: '#ff4fd8' },
  orbCyan: { bottom: 100, left: '-30%', backgroundColor: '#47e8ff' },

  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 },
  headerTitle: { fontFamily: 'Syne_800ExtraBold', fontSize: 32, color: '#fff', letterSpacing: -0.5 },

  segmentWrapper: { paddingHorizontal: 20, paddingBottom: 24, zIndex: 10 },
  segmentContainer: { flexDirection: 'row', backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: 12, padding: 4 },
  segmentBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  segmentActiveBtn: { backgroundColor: 'rgba(51, 65, 85, 1)', shadowColor: '#000', shadowOffset: {width:0, height: 4}, shadowOpacity:0.3, shadowRadius:4, elevation: 5 },
  segmentBtnText: { fontFamily: 'Sora_700Bold', color: '#9ca3af', fontSize: 13 },
  segmentActiveText: { color: '#fff' },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 150 },
  formSection: { gap: 16 },

  mediaWrapPost: { height: 256, backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(255, 255, 255, 0.1)', justifyContent: 'center', alignItems: 'center' },
  mediaIconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  mediaWrapText: { fontFamily: 'Sora_600SemiBold', color: '#64748b', fontSize: 14 },
  field: {},
  inputNeon: { fontFamily: 'Sora_400Regular', backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: 16, padding: 16, fontSize: 14, color: '#fff', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
  textArea: { height: 128, textAlignVertical: 'top' },

  linkWrap: { gap: 12 },
  linkHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  linkHeaderTitle: { fontFamily: 'Outfit_800ExtraBold', fontSize: 10, color: '#9ca3af', letterSpacing: 2 },
  linkHeaderOpt: { fontFamily: 'Outfit_800ExtraBold', fontSize: 10, color: 'rgba(103, 232, 249, 0.8)', letterSpacing: 2 },
  linkSelectBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(30, 41, 59, 0.5)', paddingHorizontal: 16, paddingVertical: 12 },
  linkHelperTxt: { fontFamily: 'Sora_400Regular', fontSize: 12, color: '#9ca3af' },

  submitSwipePanel: { marginTop: 12, backgroundColor: '#0f172a', borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  swipePanelText: { fontFamily: 'Outfit_800ExtraBold', color: '#64748b', fontSize: 11, letterSpacing: 2, marginRight: 8 },
  swipePanelIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },

  stepHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  stepHeaderTitle: { fontFamily: 'Outfit_800ExtraBold', fontSize: 10, color: '#9ca3af', letterSpacing: 2 },
  inputNeonWrap: { position: 'relative', justifyContent: 'center' },
  neonIconAbs: { position: 'absolute', left: 16, zIndex: 10 },
  inputNeonPad: { fontFamily: 'Sora_400Regular', backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: 12, paddingLeft: 44, paddingRight: 16, paddingVertical: 14, fontSize: 14, color: '#fff', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
  textAreaEvent: { height: 96, textAlignVertical: 'top', borderRadius: 12 },
  mediaWrapEvent: { height: 180, backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: 16, borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.1)', justifyContent: 'center', alignItems: 'center' },

  gridRow: { flexDirection: 'row', gap: 12 },
  locationBtn: {
    position: 'absolute', right: 12, zIndex: 10,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(34, 211, 238, 0.15)',
    justifyContent: 'center', alignItems: 'center',
  },

  ticketGridRow: { flexDirection: 'row', gap: 12 },
  ticketBox: { flex: 1, backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  ticketBoxActive: { backgroundColor: 'rgba(30, 41, 59, 0.9)', borderColor: '#22d3ee' },
  ticketBoxDisabled: { flex: 1, backgroundColor: 'rgba(30, 41, 59, 0.2)', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', opacity: 0.5 },
  ticketBoxTitle: { fontFamily: 'Sora_700Bold', color: '#fff', fontSize: 12, textAlign: 'center' },

  btnPrimary: { padding: 16, borderRadius: 12, alignItems: 'center' },
  btnText: { fontFamily: 'Sora_800ExtraBold', color: '#fff', fontSize: 15 },
});
