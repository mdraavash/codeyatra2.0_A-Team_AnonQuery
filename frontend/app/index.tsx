import { StyleSheet, Image } from 'react-native';
import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/auth-context';

const Index = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return; // wait for auth to load

    if (user) {
      switch (user.role) {
        case 'admin':
          router.replace('/(admin)' as never);
          return;
        case 'teacher':
          router.replace('/(teacher)' as never);
          return;
        case 'student':
          router.replace('/(student)' as never);
          return;
      }
    }

    // No session — go to login after a brief splash
    const timeout = setTimeout(() => {
      router.replace('/login');
    }, 1500);

    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('@/assets/images/EduLytics.png')}
        style={styles.logo}
      />
    </SafeAreaView>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },

  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
})