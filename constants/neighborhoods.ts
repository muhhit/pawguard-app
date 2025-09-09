export interface Neighborhood {
  id: string;
  name: string;
  city: string;
  region: string;
}

export const TURKISH_NEIGHBORHOODS: Neighborhood[] = [
  // İstanbul - Avrupa Yakası
  { id: 'besiktas', name: 'Beşiktaş', city: 'İstanbul', region: 'Avrupa Yakası' },
  { id: 'sisli', name: 'Şişli', city: 'İstanbul', region: 'Avrupa Yakası' },
  { id: 'beyoglu', name: 'Beyoğlu', city: 'İstanbul', region: 'Avrupa Yakası' },
  { id: 'fatih', name: 'Fatih', city: 'İstanbul', region: 'Avrupa Yakası' },
  { id: 'bakirkoy', name: 'Bakırköy', city: 'İstanbul', region: 'Avrupa Yakası' },
  { id: 'zeytinburnu', name: 'Zeytinburnu', city: 'İstanbul', region: 'Avrupa Yakası' },
  { id: 'avcilar', name: 'Avcılar', city: 'İstanbul', region: 'Avrupa Yakası' },
  { id: 'kucukcekmece', name: 'Küçükçekmece', city: 'İstanbul', region: 'Avrupa Yakası' },
  { id: 'buyukcekmece', name: 'Büyükçekmece', city: 'İstanbul', region: 'Avrupa Yakası' },
  { id: 'esenyurt', name: 'Esenyurt', city: 'İstanbul', region: 'Avrupa Yakası' },
  { id: 'bahcelievler', name: 'Bahçelievler', city: 'İstanbul', region: 'Avrupa Yakası' },
  { id: 'gaziosmanpasa', name: 'Gaziosmanpaşa', city: 'İstanbul', region: 'Avrupa Yakası' },
  { id: 'eyup', name: 'Eyüp', city: 'İstanbul', region: 'Avrupa Yakası' },
  { id: 'sultangazi', name: 'Sultangazi', city: 'İstanbul', region: 'Avrupa Yakası' },
  { id: 'basaksehir', name: 'Başakşehir', city: 'İstanbul', region: 'Avrupa Yakası' },
  { id: 'arnavutkoy', name: 'Arnavutköy', city: 'İstanbul', region: 'Avrupa Yakası' },
  { id: 'catalca', name: 'Çatalca', city: 'İstanbul', region: 'Avrupa Yakası' },
  { id: 'silivri', name: 'Silivri', city: 'İstanbul', region: 'Avrupa Yakası' },

  // İstanbul - Asya Yakası
  { id: 'kadikoy', name: 'Kadıköy', city: 'İstanbul', region: 'Asya Yakası' },
  { id: 'uskudar', name: 'Üsküdar', city: 'İstanbul', region: 'Asya Yakası' },
  { id: 'maltepe', name: 'Maltepe', city: 'İstanbul', region: 'Asya Yakası' },
  { id: 'kartal', name: 'Kartal', city: 'İstanbul', region: 'Asya Yakası' },
  { id: 'pendik', name: 'Pendik', city: 'İstanbul', region: 'Asya Yakası' },
  { id: 'tuzla', name: 'Tuzla', city: 'İstanbul', region: 'Asya Yakası' },
  { id: 'atasehir', name: 'Ataşehir', city: 'İstanbul', region: 'Asya Yakası' },
  { id: 'umraniye', name: 'Ümraniye', city: 'İstanbul', region: 'Asya Yakası' },
  { id: 'sancaktepe', name: 'Sancaktepe', city: 'İstanbul', region: 'Asya Yakası' },
  { id: 'sultanbeyli', name: 'Sultanbeyli', city: 'İstanbul', region: 'Asya Yakası' },
  { id: 'cekmekoy', name: 'Çekmeköy', city: 'İstanbul', region: 'Asya Yakası' },
  { id: 'beykoz', name: 'Beykoz', city: 'İstanbul', region: 'Asya Yakası' },
  { id: 'sile', name: 'Şile', city: 'İstanbul', region: 'Asya Yakası' },

  // Ankara
  { id: 'cankaya', name: 'Çankaya', city: 'Ankara', region: 'Merkez' },
  { id: 'kecioren', name: 'Keçiören', city: 'Ankara', region: 'Merkez' },
  { id: 'yenimahalle', name: 'Yenimahalle', city: 'Ankara', region: 'Merkez' },
  { id: 'mamak', name: 'Mamak', city: 'Ankara', region: 'Merkez' },
  { id: 'sincan', name: 'Sincan', city: 'Ankara', region: 'Merkez' },
  { id: 'etimesgut', name: 'Etimesgut', city: 'Ankara', region: 'Merkez' },
  { id: 'golbasi', name: 'Gölbaşı', city: 'Ankara', region: 'Merkez' },
  { id: 'pursaklar', name: 'Pursaklar', city: 'Ankara', region: 'Merkez' },
  { id: 'altindag', name: 'Altındağ', city: 'Ankara', region: 'Merkez' },

  // İzmir
  { id: 'konak', name: 'Konak', city: 'İzmir', region: 'Merkez' },
  { id: 'bornova', name: 'Bornova', city: 'İzmir', region: 'Merkez' },
  { id: 'karsiyaka', name: 'Karşıyaka', city: 'İzmir', region: 'Merkez' },
  { id: 'bayrakli', name: 'Bayraklı', city: 'İzmir', region: 'Merkez' },
  { id: 'gaziemir', name: 'Gaziemir', city: 'İzmir', region: 'Merkez' },
  { id: 'balcova', name: 'Balçova', city: 'İzmir', region: 'Merkez' },
  { id: 'narlidere', name: 'Narlıdere', city: 'İzmir', region: 'Merkez' },
  { id: 'buca', name: 'Buca', city: 'İzmir', region: 'Merkez' },
  { id: 'cigli', name: 'Çiğli', city: 'İzmir', region: 'Merkez' },
  { id: 'aliaga', name: 'Aliağa', city: 'İzmir', region: 'Kuzey' },
  { id: 'menemen', name: 'Menemen', city: 'İzmir', region: 'Kuzey' },
  { id: 'foca', name: 'Foça', city: 'İzmir', region: 'Kuzey' },

  // Bursa
  { id: 'osmangazi', name: 'Osmangazi', city: 'Bursa', region: 'Merkez' },
  { id: 'nilufer', name: 'Nilüfer', city: 'Bursa', region: 'Merkez' },
  { id: 'yildirim', name: 'Yıldırım', city: 'Bursa', region: 'Merkez' },
  { id: 'gursu', name: 'Gürsu', city: 'Bursa', region: 'Merkez' },
  { id: 'kestel', name: 'Kestel', city: 'Bursa', region: 'Merkez' },

  // Antalya
  { id: 'muratpasa', name: 'Muratpaşa', city: 'Antalya', region: 'Merkez' },
  { id: 'kepez', name: 'Kepez', city: 'Antalya', region: 'Merkez' },
  { id: 'konyaalti', name: 'Konyaaltı', city: 'Antalya', region: 'Merkez' },
  { id: 'aksu', name: 'Aksu', city: 'Antalya', region: 'Merkez' },
  { id: 'dosemealti', name: 'Döşemealtı', city: 'Antalya', region: 'Merkez' },

  // Adana
  { id: 'seyhan', name: 'Seyhan', city: 'Adana', region: 'Merkez' },
  { id: 'yuregir', name: 'Yüreğir', city: 'Adana', region: 'Merkez' },
  { id: 'cukurova', name: 'Çukurova', city: 'Adana', region: 'Merkez' },
  { id: 'saricam', name: 'Sarıçam', city: 'Adana', region: 'Merkez' },

  // Konya
  { id: 'meram', name: 'Meram', city: 'Konya', region: 'Merkez' },
  { id: 'selcuklu', name: 'Selçuklu', city: 'Konya', region: 'Merkez' },
  { id: 'karatay', name: 'Karatay', city: 'Konya', region: 'Merkez' },

  // Gaziantep
  { id: 'sahinbey', name: 'Şahinbey', city: 'Gaziantep', region: 'Merkez' },
  { id: 'sehitkamil', name: 'Şehitkamil', city: 'Gaziantep', region: 'Merkez' },

  // Kayseri
  { id: 'melikgazi', name: 'Melikgazi', city: 'Kayseri', region: 'Merkez' },
  { id: 'kocasinan', name: 'Kocasinan', city: 'Kayseri', region: 'Merkez' },
  { id: 'talas', name: 'Talas', city: 'Kayseri', region: 'Merkez' },
];

export const getNeighborhoodsByCity = (city: string): Neighborhood[] => {
  return TURKISH_NEIGHBORHOODS.filter(n => n.city === city);
};

export const getNeighborhoodById = (id: string): Neighborhood | undefined => {
  return TURKISH_NEIGHBORHOODS.find(n => n.id === id);
};

export const getCities = (): string[] => {
  return [...new Set(TURKISH_NEIGHBORHOODS.map(n => n.city))];
};

export const getRegionsByCity = (city: string): string[] => {
  const neighborhoods = getNeighborhoodsByCity(city);
  return [...new Set(neighborhoods.map(n => n.region))];
};