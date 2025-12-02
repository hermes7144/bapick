// src/types/NearbyDiscountedStoreInfo.ts
export interface NearbyDiscountedStoreInfo {
  store_id: string; // UUID
  store_name: string;
  franchise_name: string | null;
  discount_rate: number | null; // 이벤트 테이블에서 가져옴
  event_title: string; // 이벤트 테이블에서 가져옴
  latitude: number;
  longitude: number;
  distance_meters: number;
}