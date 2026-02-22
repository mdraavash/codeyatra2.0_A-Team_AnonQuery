import React, { useState, useCallback } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/auth-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { API } from '@/constants/api';
import { useFocusEffect } from '@react-navigation/native';

type TabName = 'home' | 'faq' | 'myqueries' | 'notifications';

interface Subject {
  id: string;
  name: string;
  teacher_id: string;
  teacher_name: string;
}

interface Notification {
  id: string;
  message: string;
  query_id: string;
  course_id: string;
  read: boolean;
  created_at: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string | null;
  course_name: string;
  student_name: string;
}

interface MyQuery {
  id: string;
  question: string;
  answer: string | null;
  answered: boolean;
  course_name: string;
  created_at: string;
}

export default function StudentHome() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<TabName>('home');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [myQueries, setMyQueries] = useState<MyQuery[]>([]);
  const [loading, setLoading] = useState(true);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    try {
      const [coursesRes, notifsRes, faqsRes, myQRes] = await Promise.all([
        fetch(API.SUBJECTS, { headers }),
        fetch(API.NOTIFICATIONS, { headers }),
        fetch(API.FAQ_ALL, { headers }),
        fetch(API.MY_QUERIES, { headers }),
      ]);
      if (coursesRes.ok) setSubjects(await coursesRes.json());
      if (notifsRes.ok) setNotifications(await notifsRes.json());
      if (faqsRes.ok) setFaqs(await faqsRes.json());
      if (myQRes.ok) setMyQueries(await myQRes.json());
    } catch {

    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, [token]));

  const handleNotifPress = (notif: Notification) => {
    fetch(API.NOTIFICATION_READ(notif.id), { method: 'PATCH', headers }).catch(() => {});
    router.push({
      pathname: '/(student)/queries-answered',
      params: { courseId: notif.course_id, courseName: '' },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#FFF" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  
  const renderHome = () => (
    <>
      {/* Intro Card */}
      <View style={styles.introCard}>
        <Text style={styles.userName}>{user?.name ?? 'Student'}</Text>
        <Text style={styles.userId}>{user?.roll ?? ''}</Text>
      </View>

      {/* Notifications preview */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionRowTitle}>Notification</Text>
        <TouchableOpacity onPress={() => setTab('notifications')}>
          <Text style={styles.viewMoreLink}>View more...</Text>
        </TouchableOpacity>
      </View>
      {notifications.length === 0 ? (
        <Text style={styles.emptyText}>No notifications yet</Text>
      ) : (
        notifications.slice(0, 3).map((notif) => (
          <TouchableOpacity
            key={notif.id}
            style={styles.notifCard}
            activeOpacity={0.7}
            onPress={() => handleNotifPress(notif)}
          >
            <Text style={styles.notifText} numberOfLines={1}>
              {notif.message}
            </Text>
            <View style={styles.notifArrowWrap}>
              <Text style={styles.notifArrow}>{'>'}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}

      {/* All Subjects */}
      <Text style={styles.sectionTitle}>Enrolled Courses</Text>
      {subjects.length === 0 ? (
        <Text style={styles.emptyText}>No subjects available yet</Text>
      ) : (
        <View style={styles.coursesGrid}>
          {subjects.map((subj) => (
            <TouchableOpacity
              key={subj.id}
              style={styles.courseCard}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: '/(student)/course-detail',
                  params: {
                    courseId: subj.id,
                    courseName: subj.name,
                    teacherName: subj.teacher_name,
                  },
                })
              }
            >
              <MaterialCommunityIcons name="database" size={33} color="#2F2F2F" style={styles.courseIcon} />
              <Text style={styles.courseName}>{subj.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </>
  );

  const renderFAQ = () => (
    <>
      <View style={styles.introCard}>
        <Text style={styles.userName}>FAQ</Text>
        <Text style={styles.userId}>Frequently Asked Questions</Text>
      </View>

      <Text style={styles.sectionTitle}>All Answered Queries</Text>
      {faqs.length === 0 ? (
        <Text style={styles.emptyText}>No FAQs available yet</Text>
      ) : (
        faqs.map((faq) => (
          <View key={faq.id} style={styles.faqCard}>
            <View style={styles.faqHeader}>
              <Text style={styles.faqBadge}>{faq.course_name}</Text>
            </View>
            <Text style={styles.faqQuestion} numberOfLines={2}>
              {faq.question}
            </Text>
            <Text style={styles.faqAnswer} numberOfLines={3}>
              {faq.answer ?? ''}
            </Text>
          </View>
        ))
      )}
    </>
  );


  const renderMyQueries = () => (
    <>
      <View style={styles.introCard}>
        <Text style={styles.userName}>My Queries</Text>
        <Text style={styles.userId}>All questions you&apos;ve asked</Text>
      </View>

      <Text style={styles.sectionTitle}>Your Questions</Text>
      {myQueries.length === 0 ? (
        <Text style={styles.emptyText}>You haven&apos;t asked any questions yet</Text>
      ) : (
        myQueries.map((q) => (
          <View key={q.id} style={styles.faqCard}>
            <View style={styles.faqHeader}>
              <Text style={styles.faqBadge}>{q.course_name}</Text>
              <View style={[styles.queryStatusBadge, q.answered ? styles.queryAnswered : styles.queryPending]}>
                <Text style={styles.queryStatusText}>{q.answered ? 'Answered' : 'Pending'}</Text>
              </View>
            </View>
            <Text style={styles.faqQuestion} numberOfLines={2}>{q.question}</Text>
            {q.answered && q.answer ? (
              <Text style={styles.faqAnswer} numberOfLines={3}>{q.answer}</Text>
            ) : (
              <Text style={[styles.faqAnswer, { fontStyle: 'italic' }]}>Awaiting response...</Text>
            )}
          </View>
        ))
      )}
    </>
  );

  const renderNotifications = () => (
    <>
      <View style={styles.introCard}>
        <Text style={styles.userName}>Notifications</Text>
        <Text style={styles.userId}>All your updates</Text>
      </View>

      <Text style={styles.sectionTitle}>All Notifications</Text>
      {notifications.length === 0 ? (
        <Text style={styles.emptyText}>No notifications yet</Text>
      ) : (
        notifications.map((notif) => (
          <TouchableOpacity
            key={notif.id}
            style={[styles.notifCard, !notif.read && styles.notifCardUnread]}
            activeOpacity={0.7}
            onPress={() => handleNotifPress(notif)}
          >
            <Text style={styles.notifText} numberOfLines={2}>
              {notif.message}
            </Text>
            <View style={styles.notifArrowWrap}>
              <Text style={styles.notifArrow}>{'>'}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.7} onPress={logout}>
        <Ionicons name="log-out-outline" size={20} color="#FFF" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {tab === 'home' && renderHome()}
        {tab === 'faq' && renderFAQ()}
        {tab === 'myqueries' && renderMyQueries()}
        {tab === 'notifications' && renderNotifications()}
      </ScrollView>

      {/* Bottom Nav Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={[styles.navItem, tab === 'home' && styles.navItemActive]}
          onPress={() => setTab('home')}
        >
          <Ionicons name="home-outline" size={22} color={tab === 'home' ? '#000' : '#FFF'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navItem, tab === 'faq' && styles.navItemActive]}
          onPress={() => setTab('faq')}
        >
          <Ionicons name="chatbox-outline" size={22} color={tab === 'faq' ? '#000' : '#FFF'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navItem, tab === 'myqueries' && styles.navItemActive]}
          onPress={() => setTab('myqueries')}
        >
          <Ionicons name="time-outline" size={22} color={tab === 'myqueries' ? '#000' : '#FFF'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navItem, tab === 'notifications' && styles.navItemActive]}
          onPress={() => setTab('notifications')}
        >
          <Ionicons name="notifications-outline" size={22} color={tab === 'notifications' ? '#000' : '#FFF'} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');
const COL_GAP = 32;
const ROW_GAP = 35;
const GRID_PADDING = 17;
const CARD_WIDTH = (width - GRID_PADDING * 2 - COL_GAP) / 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2F2F2F' },
  scrollContent: { paddingHorizontal: 17, paddingTop: 12, paddingBottom: 120 },

  /* Intro */
  introCard: {
    width: '100%',
    height: 120,
    backgroundColor: '#444444',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F5F5F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  userName: { fontSize: 22, fontWeight: '600', textAlign: 'center', color: '#FFFFFF', lineHeight: 33 },
  userId: { fontSize: 12, textAlign: 'center', color: '#FFFFFF', marginTop: 2, letterSpacing: 0.18 },

  /* Section Title */
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.21,
    marginTop: 24,
    marginBottom: 14,
  },
  emptyText: { fontSize: 13, color: '#888', marginBottom: 8 },

  /* Section Row (Notification header with View more) */
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 14,
  },
  sectionRowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.21,
  },
  viewMoreLink: {
    fontSize: 11,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: 0.165,
    textDecorationLine: 'underline',
  },

  /* Notification Card */
  notifCard: {
    width: '100%',
    minHeight: 51,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  notifCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  notifText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#2F2F2F', letterSpacing: 0.21 },
  notifArrowWrap: {
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
  notifArrow: { fontSize: 20, color: '#FFFFFF', marginTop: -2 },

  /* Course Grid */
  coursesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: COL_GAP,
    rowGap: ROW_GAP,
  },
  courseCard: {
    width: CARD_WIDTH,
    height: 95,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#C4C4C4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  courseIcon: { marginBottom: 4 },
  courseName: { fontSize: 20, textAlign: 'center', color: '#2F2F2F' },

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
  faqHeader: { flexDirection: 'row', marginBottom: 8 },
  faqBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFF',
    backgroundColor: '#0A3B87',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
  },
  faqQuestion: { fontSize: 14, fontWeight: '600', color: '#000000', letterSpacing: 0.21 },
  faqAnswer: { fontSize: 14, color: '#B7B7B7', letterSpacing: 0.21, marginTop: 6 },

  /* Logout */
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e74c3c',
    height: 50,
    borderRadius: 25,
    marginTop: 30,
    gap: 8,
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#FFF' },

  /* Query Status Badge */
  queryStatusBadge: {
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
  },
  queryAnswered: { backgroundColor: '#2ecc71' },
  queryPending: { backgroundColor: '#e67e22' },
  queryStatusText: { fontSize: 11, fontWeight: '600', color: '#FFF' },

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
