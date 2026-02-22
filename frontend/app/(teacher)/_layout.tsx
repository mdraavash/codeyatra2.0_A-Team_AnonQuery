import { Stack } from 'expo-router';
import React from 'react';

export default function TeacherLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#2F2F2F' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="course-students" />
      <Stack.Screen name="student-queries" />
      <Stack.Screen name="answer-query" />
    </Stack>
  );
}
