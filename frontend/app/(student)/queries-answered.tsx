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
  course_name: string;
}

export default function QueriesAnswered() {
  const { token } = useAuth();
  const router = useRouter();
  const { courseId, courseName, teacherName } = useLocalSearchParams<{ courseId: string; courseName: string; teacherName: string }>();

  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(API.QUERIES_COURSE_ANSWERED(courseId), { headers });
        if (res.ok) setQueries(await res.json());
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, token]);

  const displayName = courseName || (queries[0]?.course_name ?? '');
  const visibleQueries = showAll ? queries : queries.slice(0, 3);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Intro Card */}
        <View style={styles.introCard}>
          <Text style={styles.introName}>{displayName}</Text>
          <Text style={styles.introSub}> {teacherName ?? ''}</Text>
        </View>

        <Text style={styles.sectionTitle}>
          Courses – {displayName} – Queries Answered
        </Text>

        {loading ? (
          <ActivityIndicator color="#FFF" style={{ marginTop: 20 }} />
        ) : queries.length === 0 ? (
          <Text style={styles.emptyText}>No answered queries yet</Text>
        ) : (
          <>
            {visibleQueries.map((q) => (
              <View key={q.id} style={styles.queryCard}>
                <Text style={styles.queryQuestion} numberOfLines={2}>
                  {q.question}
                </Text>
                <Text style={styles.queryAnswer} numberOfLines={2}>
                  {q.answer ?? ''}
                </Text>
              </View>
            ))}

            {!showAll && queries.length > 3 && (
              <TouchableOpacity
                style={styles.viewMoreBtn}
                activeOpacity={0.7}
                onPress={() => setShowAll(true)}
              >
                <Text style={styles.viewMoreText}>View More</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>

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
  introSub: { fontSize: 15, color: '#FFFFFF', textAlign: 'center', letterSpacing: 0.225, marginTop: 2 },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.21,
    marginTop: 24,
    marginBottom: 14,
  },
  emptyText: { fontSize: 13, color: '#888', marginBottom: 8 },

  queryCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#444444',
    paddingHorizontal: 14,
    paddingVertical: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  queryQuestion: { fontSize: 14, fontWeight: '600', color: '#000000', letterSpacing: 0.21 },
  queryAnswer: { fontSize: 14, color: '#B7B7B7', letterSpacing: 0.21, marginTop: 8 },

  viewMoreBtn: {
    width: 242,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  viewMoreText: { fontSize: 16, color: '#2F2F2F', textAlign: 'center' },

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
