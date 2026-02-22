import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/auth-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API } from '@/constants/api';

export default function AskQuestion() {
  const { token } = useAuth();
  const router = useRouter();
  const { courseId, courseName, teacherName } = useLocalSearchParams<{
    courseId: string;
    courseName: string;
    teacherName: string;
  }>();

  const [question, setQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = question.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      const res = await fetch(API.QUERIES, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ course_id: courseId, question: trimmed }),
      });
      if (res.ok) {
        Alert.alert('Success', 'Your query has been sent to the teacher!', [
          { text: 'OK', onPress: () => router.replace('/(student)/' as never) },
        ]);
        return;
      } else {
        const data = await res.json();
        Alert.alert('Error', data.detail || 'Something went wrong');
      }
    } catch {
      Alert.alert('Error', 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Intro Card */}
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>Ask Your Question</Text>
          <Text style={styles.introSub}>
            {courseName} {teacherName}
          </Text>
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Write Your Query ....."
            placeholderTextColor="#BDBDBD"
            value={question}
            onChangeText={setQuestion}
            multiline
          />
          <TouchableOpacity
            style={styles.sendBtn}
            onPress={handleSubmit}
            disabled={submitting || !question.trim()}
            activeOpacity={0.7}
          >
            <Text style={styles.sendArrow}>{'>'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Back */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color="#FFF" />
      </TouchableOpacity>

      {/* Bottom Nav Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/(student)/' as never)}>
          <Ionicons name="home-outline" size={22} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
          <Ionicons name="chatbox-outline" size={22} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="time-outline" size={22} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="notifications-outline" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2F2F2F', paddingHorizontal: 17 },

  introCard: {
    width: '100%',
    height: 120,
    backgroundColor: '#444444',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  introTitle: { fontSize: 22, fontWeight: '600', color: '#FFFFFF', lineHeight: 33, textAlign: 'center' },
  introSub: { fontSize: 15, color: '#FFFFFF', textAlign: 'center', letterSpacing: 0.225, marginTop: 2 },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6F6F6F',
    borderRadius: 10,
    height: 54,
    paddingHorizontal: 14,
    marginBottom: 110,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 0.21,
  },
  sendBtn: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#444444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  sendArrow: { fontSize: 20, color: '#FFFFFF', marginTop: -2 },

  backBtn: {
    position: 'absolute',
    top: 60,
    left: 17,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Bottom Nav */
  navBar: {
    position: 'absolute',
    bottom: 24,
    left: 32,
    right: 32,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(176, 137, 137, 0.13)',
    borderWidth: 1,
    borderColor: '#F5F5F5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  navItem: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navItemActive: { backgroundColor: '#FFFFFF' },
});
