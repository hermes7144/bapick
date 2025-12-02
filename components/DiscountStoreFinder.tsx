// components/DiscountStoreFinder.tsx

import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
// supabase import 제거 (더 이상 여기서 호출하지 않음)
import { NearbyDiscountedStoreInfo } from '@/types/NearbyDiscountedStoreInfo'; 

// Props 타입 정의
interface DiscountStoreFinderProps {
    discountStores: NearbyDiscountedStoreInfo[];
    loading: boolean;
    maxRadius: number;
}

const DiscountStoreFinder: React.FC<DiscountStoreFinderProps> = ({ discountStores, loading, maxRadius }) => {
  
  const renderItem = ({ item }: { item: NearbyDiscountedStoreInfo }) => (
    <View style={styles.listItem}>
      <Text style={styles.storeName}>
        {item.store_name} 
        <Text style={styles.franchiseName}> ({item.franchise_name || '개인 매장'})</Text>
      </Text>
      <Text style={styles.eventInfo}>
        {item.event_title} - {item.discount_rate}% 할인!
      </Text>
      <Text style={styles.distance}>
        거리: {(item.distance_meters / 1000).toFixed(1)} km
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>💰 내 주변 할인 중인 가게 ({maxRadius / 1000}km 반경)</Text>
      
      {/* 로딩 인디케이터는 부모에서 처리했으나, 혹시 모를 경우를 대비해 유지 */}
      {/* {loading && <ActivityIndicator size="small" color="#0000ff" />} */}
      
      {!loading && discountStores.length === 0 && (
        <Text style={styles.noData}>현재 주변에 할인 중인 가게가 없습니다.</Text>
      )}

      {!loading && (
        <FlatList
          data={discountStores}
          renderItem={renderItem}
          keyExtractor={(item) => item.store_id}
        />
      )}
    </View>
  );
};

// ... (styles 정의는 그대로 유지)
const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    listItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
    storeName: { fontSize: 16, fontWeight: 'bold' },
    franchiseName: { fontWeight: 'normal', color: '#666' },
    eventInfo: { fontSize: 14, color: 'red', fontWeight: '700', marginTop: 2 },
    distance: { fontSize: 12, color: '#999', marginTop: 2 },
    noData: { textAlign: 'center', marginTop: 20, fontSize: 14, color: '#888' }
});


export default DiscountStoreFinder;