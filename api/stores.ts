import { supabase } from './supabase';

export const fetchNearbyStoresWithEvents = async (userLat: number, userLng: number) => {
  const { data, error } = await supabase.rpc('get_nearby_discounted_stores', {
    user_lat: userLat,
    user_lng: userLng,
    max_radius_meters: 5000, // 5km 반경
  });

  if (error) {
    console.error(`할인 매장 조회 오류:`, error);
    return [];
  }

  return data;
};
