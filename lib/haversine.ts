/**
 * Menghitung jarak antara dua titik koordinat GPS menggunakan rumus Haversine.
 *
 * @param lat1 - Latitude titik pertama (derajat)
 * @param lon1 - Longitude titik pertama (derajat)
 * @param lat2 - Latitude titik kedua (derajat)
 * @param lon2 - Longitude titik kedua (derajat)
 * @returns Jarak dalam meter
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  // Radius bumi dalam meter
  const R = 6371000;

  const toRad = (deg: number): number => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
