import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { supabase } from '@/api/supabase';
import { NearbyDiscountedStoreInfo } from '@/types/NearbyDiscountedStoreInfo';
import DiscountStoreFinder from '@/components/DiscountStoreFinder'; // 목록 컴포넌트
import * as Location from 'expo-location';
import { fetchNearbyStoresWithEvents } from '@/api/stores';
import * as SplashScreen from 'expo-splash-screen';
import * as Updates from 'expo-updates';


// 가정된 위치 (GPS 실패 또는 초기 로딩 시 중심점)
const INITIAL_LAT = 35.156177;
const INITIAL_LNG = 129.059142;
const MAX_RADIUS = 3000; // 3km 반경

SplashScreen.preventAutoHideAsync();


export default function Screen() {
  const [discountStores, setDiscountStores] = useState<NearbyDiscountedStoreInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    null
  );

  useEffect(() => {
      async function prepare() {
        try {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
          }
        } catch (e) {
          console.log(e);
        } finally {
          await SplashScreen.hideAsync();
        }
      }

      prepare();
    }, []);


  // 맵 초기 영역 설정
  const initialRegion: Region = {
    latitude: userLocation?.latitude || INITIAL_LAT,
    longitude: userLocation?.longitude || INITIAL_LNG,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // 위치 권한 요청 함수 (재사용 가능)
  const requestLocationPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Permission to access location was denied');
      return false;
    }
    return true;
  };

  const getCurrentLocation = async () => {
    // 🚩 __DEV__ 플래그로 자동 감지
    const IS_DEV_MODE = __DEV__;

    // 1. 개발 모드일 때 (MOCK)
    if (IS_DEV_MODE) {
      console.log('🚧 DEV MODE: Using predefined initial location.');
      const defaultLoc = { latitude: INITIAL_LAT, longitude: INITIAL_LNG };
      setUserLocation(defaultLoc);
      return defaultLoc;
    }

    // 2. 프로덕션 모드일 때 (REAL GPS)
    const permissionGranted = await requestLocationPermission();

    if (permissionGranted) {
      try {
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });
        const currentLoc = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setUserLocation(currentLoc);
        return currentLoc;
      } catch (error) {
        console.error('Error getting real location:', error);

        // 실제 GPS 실패 시: 가정 위치로 대체 (최악의 경우)
        const defaultLoc = { latitude: INITIAL_LAT, longitude: INITIAL_LNG };
        setUserLocation(defaultLoc);
        return defaultLoc;
      }
    } else {
      console.warn('Location permission denied. Using initial default location.');
      // 권한 거부 시: 가정 위치로 대체
      const defaultLoc = { latitude: INITIAL_LAT, longitude: INITIAL_LNG };
      setUserLocation(defaultLoc);
      return defaultLoc;
    }
  };

  // 데이터 조회 로직
  useEffect(() => {
    if (!userLocation) return;

    const fetchDiscountStores = async () => {
      setLoading(true);

      const data = await fetchNearbyStoresWithEvents(userLocation.latitude, userLocation.longitude);

      setDiscountStores(data as NearbyDiscountedStoreInfo[]);

      setLoading(false);
    };

    fetchDiscountStores();
  }, [userLocation]);

  // 컴포넌트 마운트 시 위치 권한 요청 및 위치 가져오기
  useEffect(() => {
    getCurrentLocation();
  }, []);

  if (loading && !userLocation) {
    return <ActivityIndicator size="large" style={styles.loading} color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      {/* 2. MapView 렌더링 */}
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        // userLocation이 잡혔을 때만 region을 설정하여 지도 중심점 이동
        region={userLocation ? initialRegion : undefined}
        showsUserLocation={true}>
        {!loading &&
          discountStores.map((store) => (
            <Marker
              key={store.store_id}
              coordinate={{
                latitude: store.latitude,
                longitude: store.longitude,
              }}
              title={store.store_name}
              description={`이벤트 ${store.events_list.length}개 | 거리: ${(store.distance_meters / 1000).toFixed(2)} km`}
              pinColor={store.events_list.length > 0 ? 'red' : 'blue'}
            />
          ))}
      </MapView>

      {/* 3. 할인 매장 목록 (DiscountStoreFinder) 렌더링 추가 */}
      <View style={styles.listContainer}>
        {loading ? (
          <ActivityIndicator size="small" color="#0000ff" />
        ) : (
          <>
          <DiscountStoreFinder
            discountStores={discountStores}
            loading={loading} // 사실상 이 시점에는 false
            maxRadius={MAX_RADIUS}
          />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { height: '50%', width: '100%' },
  listContainer: { flex: 1, padding: 10 },
  loading: { flex: 1, justifyContent: 'center' },
});
