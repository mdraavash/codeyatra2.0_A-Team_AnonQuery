import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/auth-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API } from '@/constants/api';

interface Query {
  id: string;
  question: string;
  answer: string | null;
  answered: boolean;
}

export default function CourseDetail() {
  const { user, token } = useAuth();
  const router = useRouter();
  const { courseId, courseName, teacherName } = useLocalSearchParams<{
    courseId: string;
    courseName: string;
    teacherName: string;
  }>();

  const [faqs, setFaqs] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(API.QUERIES_COURSE_FAQ(courseId), { headers });
        if (res.ok) setFaqs(await res.json());
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, token]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Intro Card */}
        <View style={styles.introCard}>
          <Text style={styles.introName}>{user?.name ?? 'Student'}</Text>
          <Text style={styles.introId}>{user?.roll ?? ''}</Text>
        </View>

        {/* Course Title */}
        <Text style={styles.sectionTitle}>Courses – {courseName}</Text>

        {/* Ask your Queries */}
        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.7}
          onPress={() =>
            router.push({
              pathname: '/(student)/ask-question',
              params: { courseId, courseName, teacherName },
            })
          }
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Ask your Queries</Text>
            <Text style={styles.actionSub}>Ask Your Queries to your corresponding teacher</Text>
          </View>
          <View style={styles.arrowCircle}>
            <Text style={styles.arrowText}>{'>'}</Text>
          </View>
        </TouchableOpacity>

        {/* Queries Answered */}
        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.7}
          onPress={() =>
            router.push({
              pathname: '/(student)/queries-answered',
              params: { courseId, courseName, teacherName },
            })
          }
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Queries Answered</Text>
            <Text style={styles.actionSub}>Check all your replied queries</Text>
          </View>
          <View style={styles.arrowCircle}>
            <Text style={styles.arrowText}>{'>'}</Text>
          </View>
        </TouchableOpacity>

        {/* FAQ */}
        <Text style={styles.sectionTitle}>FAQ</Text>
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : faqs.length === 0 ? (
          <Text style={styles.emptyText}>No FAQs yet</Text>
        ) : (
          faqs.slice(0, 5).map((faq) => (
            <View key={faq.id} style={styles.faqCard}>
              <Text style={styles.faqQuestion} numberOfLines={2}>
                {faq.question}
              </Text>
              <Text style={styles.faqAnswer} numberOfLines={1}>
                {faq.answer ?? ''}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* Back button */}
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
  container: { flex: 1, backgroundColor: '#2F2F2F' },
  scrollContent: { paddingHorizontal: 17, paddingTop: 12, paddingBottom: 120 },

  introCard: {
    width: '100%',
    height: 120,
    backgroundColor: '#444444',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  introName: { fontSize: 22, fontWeight: '600', textAlign: 'center', color: '#FFFFFF', lineHeight: 33 },
  introId: { fontSize: 12, textAlign: 'center', color: '#FFFFFF', marginTop: 2, letterSpacing: 0.18 },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.21,
    marginTop: 24,
    marginBottom: 14,
  },
  emptyText: { fontSize: 13, color: '#888', marginBottom: 8 },

  /* Action Card (Ask Queries / Queries Answered) */
  actionCard: {
    width: '100%',
    height: 76,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 17,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  actionTitle: { fontSize: 15, fontWeight: '600', color: '#000000', letterSpacing: 0.225 },
  actionSub: { fontSize: 11, color: '#A7A7A7', letterSpacing: 0.165, marginTop: 4 },
  arrowCircle: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#444444',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  arrowText: { fontSize: 20, color: '#FFFFFF', marginTop: -2 },

  /* FAQ Card */
  faqCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  faqQuestion: { fontSize: 14, fontWeight: '600', color: '#000000', letterSpacing: 0.21 },
  faqAnswer: { fontSize: 14, color: '#B7B7B7', letterSpacing: 0.21, marginTop: 6 },

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
