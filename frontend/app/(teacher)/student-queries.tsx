import React, { useCallback, useState } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';

interface Query {
  id: string;
  question: string;
  answer: string | null;
  answered: boolean;
  course_name: string;
  student_name: string;
}

export default function StudentQueries() {
  const { token } = useAuth();
  const router = useRouter();
  const { courseId, courseName, studentId, studentRoll } =
    useLocalSearchParams<{
      courseId: string;
      courseName: string;
      studentId: string;
      studentRoll: string;
    }>();

  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const headers = { Authorization: `Bearer ${token}` };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(API.TEACHER_STUDENT_QUERIES(courseId, studentId), { headers });
      if (res.ok) setQueries(await res.json());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useFocusEffect(useCallback(() => { load(); }, [courseId, studentId, token]));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Intro Card */}
        <View style={styles.introCard}>
          <Text style={styles.introName}>{studentRoll} – {courseName}</Text>
          <Text style={styles.introSub}>Questions Raised</Text>
        </View>

        <Text style={styles.sectionTitle}>Question</Text>

        {loading ? (
          <ActivityIndicator color="#FFF" style={{ marginTop: 20 }} />
        ) : queries.length === 0 ? (
          <Text style={styles.emptyText}>No questions from this student</Text>
        ) : (
          queries.map((q) => (
            <TouchableOpacity
              key={q.id}
              style={styles.questionCard}
              activeOpacity={0.7}
              onPress={() => {
                if (!q.answered) {
                  router.push({
                    pathname: '/(teacher)/answer-query',
                    params: {
                      queryId: q.id,
                      question: q.question,
                      studentName: studentRoll,
                      courseName: courseName,
                    },
                  });
                }
              }}
            >
              <Text style={styles.questionText} numberOfLines={2}>
                {q.question}
              </Text>
              {q.answered ? (
                <View style={styles.answeredBadge}>
                  <Text style={styles.answeredBadgeText}>Answered</Text>
                </View>
              ) : (
                <View style={styles.arrowCircle}>
                  <Text style={styles.arrowText}>{'>'}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Back */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color="#FFF" />
      </TouchableOpacity>

      {/* Bottom Nav Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]} onPress={() => router.replace('/(teacher)/' as never)}>
          <Ionicons name="home-outline" size={22} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="chatbox-outline" size={22} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="heart-outline" size={22} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="time-outline" size={22} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-outline" size={22} color="#FFF" />
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

  /* Question Card */
  questionCard: {
    width: '100%',
    minHeight: 60,
    backgroundColor: '#6F6F6F',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  questionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#F2F2F2',
    letterSpacing: 0.21,
  },
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
  answeredBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: 10,
  },
  answeredBadgeText: { fontSize: 11, fontWeight: '600', color: '#FFF' },

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
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navItemActive: { backgroundColor: '#FFFFFF' },
});
