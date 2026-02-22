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

interface StudentItem {
  student_id: string;
  student_roll: string;
  student_name: string;
  has_pending: boolean;
}

export default function CourseStudents() {
  const { user, token } = useAuth();
  const router = useRouter();
  const { courseId, courseName } = useLocalSearchParams<{ courseId: string; courseName: string }>();

  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(API.TEACHER_COURSE_STUDENTS(courseId), { headers });
        if (res.ok) setStudents(await res.json());
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
          <Text style={styles.introName}>{user?.name ?? 'Teacher'}</Text>
          <Text style={styles.introSub}>Professor – {user?.roll ?? ''}</Text>
        </View>

        <Text style={styles.sectionTitle}>{courseName} – Taught Classes</Text>

        {loading ? (
          <ActivityIndicator color="#FFF" style={{ marginTop: 20 }} />
        ) : students.length === 0 ? (
          <Text style={styles.emptyText}>No students have asked questions yet</Text>
        ) : (
          students.map((s) => (
            <TouchableOpacity
              key={s.student_id}
              style={styles.studentCard}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: '/(teacher)/student-queries',
                  params: {
                    courseId,
                    courseName,
                    studentId: s.student_id,
                    studentRoll: s.student_roll,
                    studentName: s.student_name,
                  },
                })
              }
            >
              {s.has_pending ? <View style={styles.redDot} /> : <View style={styles.greenDot} />}
              <Text style={styles.studentRoll}>{s.student_roll}</Text>
              <View style={styles.arrowCircle}>
                <Text style={styles.arrowText}>{'>'}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Back button */}
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

  /* Student Card */
  studentCard: {
    width: '100%',
    height: 60,
    backgroundColor: '#6F6F6F',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  redDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF4444',
    marginRight: 14,
  },
  greenDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    marginRight: 14,
  },
  studentRoll: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.24,
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
