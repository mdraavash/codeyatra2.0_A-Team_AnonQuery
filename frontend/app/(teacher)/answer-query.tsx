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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/auth-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API } from '@/constants/api';

export default function AnswerQuery() {
  const { token } = useAuth();
  const router = useRouter();
  const { queryId, question, studentName, courseName } = useLocalSearchParams<{
    queryId: string;
    question: string;
    studentName: string;
    courseName: string;
  }>();

  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = answer.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      const res = await fetch(API.QUERY_ANSWER(queryId), {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answer: trimmed }),
      });
      if (res.ok) {
        Alert.alert('Success', 'Query replied successfully!', [
          { text: 'OK', onPress: () => router.replace('/(teacher)/' as never) },
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
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.introCard}>
            <Text style={styles.introTitle}>Answer Query</Text>
            <Text style={styles.introSub}>{courseName} – from {studentName}</Text>
          </View>

          {/* Question */}
          <Text style={styles.sectionTitle}>Student&apos;s Question</Text>
          <View style={styles.questionCard}>
            <Text style={styles.questionText}>{question}</Text>
          </View>

          {/* Answer input */}
          <Text style={styles.sectionTitle}>Your Answer</Text>
          <TextInput
            style={styles.answerInput}
            placeholder="Type your answer here..."
            placeholderTextColor="#999"
            value={answer}
            onChangeText={setAnswer}
            multiline
            textAlignVertical="top"
          />

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, (!answer.trim() || submitting) && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting || !answer.trim()}
            activeOpacity={0.7}
          >
            <Text style={styles.submitText}>{submitting ? 'Submitting...' : 'Submit Answer'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Back */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2F2F2F' },
  scrollContent: { paddingHorizontal: 17, paddingTop: 12, paddingBottom: 40 },

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
  introTitle: { fontSize: 22, fontWeight: '600', color: '#FFFFFF', lineHeight: 33, textAlign: 'center' },
  introSub: { fontSize: 14, color: '#FFFFFF', textAlign: 'center', letterSpacing: 0.21, marginTop: 2 },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.21,
    marginTop: 24,
    marginBottom: 12,
  },

  questionCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  questionText: { fontSize: 15, fontWeight: '500', color: '#000', lineHeight: 22 },

  answerInput: {
    width: '100%',
    minHeight: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#000',
    lineHeight: 22,
  },

  submitBtn: {
    width: '100%',
    height: 54,
    backgroundColor: '#0A3B87',
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },

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
});
