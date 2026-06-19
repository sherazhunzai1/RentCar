// Fallback city list. The app now loads locations from GET /api/locations
// (see useLocations); this static list is only used if that request fails so
// the route dropdowns are never empty.
export const CITIES = [
  // Gilgit-Baltistan
  'Gilgit',
  'Hunza',
  'Skardu',
  'Ghizer',
  'Nagar',
  'Astore',
  'Chilas',
  'Khaplu',
  'Gahkuch',
  // Major cities & transit points
  'Islamabad',
  'Rawalpindi',
  'Lahore',
  'Abbottabad',
  'Mansehra',
  'Besham',
  'Naran',
]
