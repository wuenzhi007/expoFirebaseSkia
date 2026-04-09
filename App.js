import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Button, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Canvas, Circle, useLoop, useComputedValue } from '@shopify/react-native-skia';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import analytics from '@react-native-firebase/analytics';
import messaging from '@react-native-firebase/messaging';
import remoteConfig from '@react-native-firebase/remote-config';

export default function App() {
  const [token, setToken] = useState('正在获取...');
  const [permission, setPermission] = useState('未请求');
  const [configValue, setConfigValue] = useState('正在加载...');
  const progress = useSharedValue(0);

  // Skia 动画：脉冲圆
  const loop = useLoop({ duration: 2000 });
  const radius = useComputedValue(() => 50 + 30 * Math.sin(loop.current * 2 * Math.PI), [loop]);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    analytics().logAppOpen();
    initMessaging();
    loadRemoteConfig();

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('收到推送消息', remoteMessage.notification?.title || '新消息到达');
    });

    return unsubscribe;
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: progress.value * 150 - 75 }
    ]
  }));

  const initMessaging = async () => {
    try {
      await messaging().registerDeviceForRemoteMessages();
      const authStatus = await messaging().requestPermission();
      const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      setPermission(enabled ? '允许' : '拒绝');
      if (enabled) {
        const fcmToken = await messaging().getToken();
        setToken(fcmToken || '未获取到 token');
      } else {
        setToken('请允许通知权限后重新加载');
      }
    } catch (error) {
      setToken(`获取 token 失败: ${error.message}`);
    }
  };

  const loadRemoteConfig = async () => {
    try {
      await remoteConfig().setConfigSettings({ minimumFetchIntervalMillis: 3600000 });
      await remoteConfig().setDefaults({ app_title: '默认应用标题' });
      await remoteConfig().fetchAndActivate();
      const value = remoteConfig().getValue('app_title').asString();
      setConfigValue(value || '远程配置内容为空');
    } catch (error) {
      setConfigValue(`获取远程配置失败: ${error.message}`);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{configValue}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>最简单的 Skia 动画</Text>
        <Canvas style={styles.canvas}>
          <Circle cx={110} cy={110} r={radius} color="#4f46e5" />
        </Canvas>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Reanimated 动画</Text>
        <View style={styles.animationTrack}>
          <Animated.View style={[styles.box, animatedStyle]} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Firebase Analytics</Text>
        <Button title="发送 Analytics 事件" onPress={() => analytics().logEvent('demo_button_press')} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Firebase Messaging</Text>
        <Text style={styles.info}>通知权限：{permission}</Text>
        <Text style={styles.info} numberOfLines={1}>{token}</Text>
        <Button title="刷新 FCM Token" onPress={initMessaging} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Firebase Remote Config</Text>
        <Text style={styles.info}>参数 app_title: {configValue}</Text>
        <Button title="刷新 Remote Config" onPress={loadRemoteConfig} />
      </View>

      <StatusBar style="auto" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
    alignItems: 'center'
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 18,
    textAlign: 'center'
  },
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12
  },
  canvas: {
    width: 220,
    height: 220,
    alignSelf: 'center'
  },
  animationTrack: {
    height: 120,
    justifyContent: 'center',
    backgroundColor: '#eef2ff',
    borderRadius: 12,
    overflow: 'hidden'
  },
  box: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#2563eb'
  },
  info: {
    marginBottom: 10,
    color: '#334155'
  }
});
