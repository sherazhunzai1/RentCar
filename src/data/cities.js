// Fallback city list. The app loads destinations from GET /api/locations
// (see useLocations); this static list is only used if that request fails so
// the route dropdowns are never empty. Keep in sync with backend CITIES.
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
  'Karachi',
  'Abbottabad',
  'Mansehra',
  'Besham',
  'Naran',
  'Murree',
  'Swat',
  'Peshawar',
  'Faisalabad',
  'Multan',
  'Quetta',
  'Hyderabad',
  'Sialkot',
  'Gujranwala',
  'Bahawalpur',
  'Sargodha',
  'Sukkur',
]
