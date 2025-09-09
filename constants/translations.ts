export const translations = {
  // Navigation & Tabs
  tabs: {
    home: '🏠 Ana Sayfa',
    reportPet: '🚨 Kayıp Bildir',
    heroes: '🏆 Kahramanlar',
    map: '🗺️ Harita',
    profile: '👤 Profil',
  },

  // Common
  common: {
    loading: 'Yükleniyor...',
    error: 'Hata',
    success: 'Başarılı',
    cancel: 'İptal',
    ok: 'Tamam',
    yes: 'Evet',
    no: 'Hayır',
    save: 'Kaydet',
    delete: 'Sil',
    edit: 'Düzenle',
    back: 'Geri',
    next: 'İleri',
    continue: 'Devam Et',
    submit: 'Gönder',
    search: 'Ara',
    filter: 'Filtrele',
    share: 'Paylaş',
    close: 'Kapat',
    required: 'Gerekli',
    optional: 'İsteğe Bağlı',
  },

  // Home Screen
  home: {
    title: 'Ana Sayfa',
    searchPlaceholder: '🔍 Kayıp hayvan ara...',
    loginRequired: 'Giriş gerekiyor',
    
    // Stats
    activeSearches: 'Aktif Arama',
    successRate: 'Bulunma Oranı',
    volunteers: 'Gönüllü',
    
    // Live Updates
    liveUpdates: 'Canlı Güncellemeler',
    live: 'Canlı',
    newSighting: 'Yeni Görülme: ',
    found: 'Bulundu: ',
    newAlert: 'Yeni Kayıp: ',
    
    // Nearby
    nearbyLostPets: 'Yakındaki Kayıplar',
    active: 'Aktif',
    showOnMap: 'Haritada Gör',
    contact: '💬',
    reward: 'Ödül',
    urgent: 'ACİL',
    
    // Success Stats
    thisWeek: 'Bu Hafta',
    happyEndings: 'Mutlu Son',
    
    // Heat Map
    heatMap: 'Yoğunluk Haritası',
    
    // Emergency
    emergencyReport: 'Acil Kayıp Bildirimi',
    emergencySubtitle: '60 saniyede yayına alınacak',
    takePhoto: 'Fotoğraf Çek / Yükle',
    estimatedReach: 'Tahmini Ulaşım',
    people: 'kişi',
    radius: 'yarıçapta',
    publishNow: 'Hemen Yayınla',
    
    // Pet Types
    dog: 'Köpek',
    cat: 'Kedi',
    other: 'Diğer',
    
    // Time
    minutesAgo: 'dk önce',
    hoursAgo: 'saat önce',
    daysAgo: 'gün önce',
    
    // Distance
    kmAway: 'km uzakta',
    locationUnknown: 'Konum bilinmiyor',
    
    // Alerts
    emergencyBroadcastSent: 'Acil Bildirim Gönderildi! 🚨',
    emergencyBroadcastMessage: 'için acil kayıp bildirimi yaklaşık 847 kişiye gönderildi.',
    successRateAlert: 'Bulunma Oranı 📊',
    successRateMessage: 'Son 30 günde %{rate} başarı oranıyla {total} hayvan sahibine kavuştu!\n\n• Ortalama bulunma süresi: 4.2 saat\n• En hızlı bulunan: 12 dakika\n• Toplam gönüllü: {volunteers}',
  },

  // Report Pet Screen
  reportPet: {
    title: 'Kayıp Pet Bildirimi',
    subtitle: 'Her dakika önemli - hızlı hareket edelim',
    
    // Steps
    step1Title: 'Hayvan Bilgileri',
    step1Subtitle: 'Temel bilgileri girin',
    step2Title: 'Son Görülme Bilgileri',
    step2Subtitle: 'Konum ve zaman bilgilerini girin',
    step3Title: 'İletişim ve Ödül',
    step3Subtitle: 'Son adım - iletişim bilgileri',
    
    // Photos
    photos: 'Fotoğraflar (Kritik Önem!)',
    photosHint: 'Net fotoğraflar bulunma şansını %73 artırır. Farklı açılardan çekin.',
    addPhoto: 'Fotoğraf Ekle',
    takeFromCamera: 'Kameradan Çek',
    selectFromGallery: 'Galeriden Seç',
    aiGenerateDescription: 'AI ile Açıklama Oluştur',
    aiGenerating: 'AI Açıklama Oluşturuluyor...',
    aiSuggestion: '🤖 AI Önerisi:',
    useThisDescription: 'Bu Açıklamayı Kullan',
    
    // Pet Info
    petName: 'Hayvan İsmi',
    petNamePlaceholder: 'örn: Luna, Max, Pamuk',
    petType: 'Hayvan Türü',
    breed: 'Cins/Tür',
    breedPlaceholder: 'örn: Golden Retriever, Tekir, Muhabbet Kuşu',
    age: 'Yaş',
    agePlaceholder: 'örn: 2 yaş',
    color: 'Renk',
    colorPlaceholder: 'örn: Kahverengi',
    
    // Pet Types
    dogType: 'Köpek 🐕',
    catType: 'Kedi 🐱',
    birdType: 'Kuş 🐦',
    otherType: 'Diğer 🐾',
    
    // Location
    lastSeenLocation: 'Son Görülme Yeri',
    locationPlaceholder: 'Adres veya semti girin',
    currentLocation: 'Mevcut Konum',
    gettingLocation: 'Alınıyor...',
    map: 'Harita',
    date: 'Tarih',
    time: 'Saat',
    
    // Urgency
    urgencyLevel: 'Aciliyet Durumu',
    normal: 'Normal',
    normalDesc: 'Standart arama',
    urgent: 'Acil',
    urgentDesc: 'Hızlı müdahale gerekli',
    critical: 'Kritik',
    criticalDesc: 'Yaşamsal tehlike',
    
    // Description
    detailedDescription: 'Detaylı Açıklama',
    descriptionPlaceholder: 'Özel işaretler, davranış özellikleri, sağlık durumu, son görüldüğü andaki durumu...',
    
    // Reward
    rewardAmount: 'Ödül Miktarı (İsteğe Bağlı)',
    rewardDescription: '💡 Ödül belirlemek bulunma şansını %67 artırır ve daha hızlı yanıt alırsınız',
    escrowInfo: 'Ödül güvenli emanet sistemimizde saklanır. Pet bulunduğunda otomatik olarak ödenir.',
    
    // Contact
    contactInfo: 'İletişim Bilgisi',
    contactPlaceholder: 'Telefon numarası veya e-posta',
    
    // Summary
    summary: 'Özet',
    animal: 'Hayvan:',
    location: 'Konum:',
    urgency: 'Aciliyet:',
    notSpecified: 'Belirtilmedi',
    
    // Impact
    estimatedImpact: 'Tahmini Etki',
    volunteer: 'Gönüllü',
    radius: 'Yarıçap',
    success: 'Başarı',
    
    // Social Media
    socialMediaSharing: 'Sosyal Medya Paylaşımı',
    share: 'Paylaş',
    story: 'Story',
    
    // Actions
    publishReport: 'Bildirimi Yayınla',
    
    // Alerts
    permissionRequired: 'İzin Gerekli',
    cameraPermission: 'Kamera kullanımı için izin gerekli',
    galleryPermission: 'Galeri erişimi için izin gerekli',
    locationPermission: 'Konum erişimi için izin gerekli',
    photoError: 'Fotoğraf çekilirken bir hata oluştu',
    imagePickError: 'Fotoğraf seçilirken bir hata oluştu',
    locationError: 'Konum alınırken bir hata oluştu',
    aiError: 'AI açıklama oluşturulurken bir hata oluştu',
    missingInfo: 'Eksik Bilgi',
    aiRequirement: 'AI açıklama için en az isim, tür ve bir fotoğraf gerekli',
    nameRequired: 'Lütfen hayvanın ismini girin',
    locationRequired: 'Lütfen son görülme yerini girin',
    contactRequired: 'Lütfen iletişim bilgisi girin',
    photoRequired: 'En az bir fotoğraf eklemelisiniz',
    instagramNotFound: 'Instagram Bulunamadı',
    instagramNotInstalled: 'Instagram uygulaması yüklü değil',
    submitError: 'Bildirimi oluştururken bir hata oluştu. Lütfen tekrar deneyin.',
    
    // Success
    reportCreated: 'Kayıp Bildirimi Oluşturuldu! 🚨',
    reportSuccess: 'için kayıp bildirimi başarıyla oluşturuldu.\n\n• Yaklaşık 1,247 gönüllüye bildirim gönderildi\n• {radius} yarıçapında arama başlatıldı\n• Ortalama yanıt süresi: {responseTime} dakika\n• Bulunma oranı: %89\n\nSosyal medyada paylaşarak daha fazla kişiye ulaşabilirsiniz.',
    shareOnSocialMedia: 'Sosyal Medyada Paylaş',
    goToHomePage: 'Ana Sayfa\'ya Dön',
    
    // Map
    mapFeatureComingSoon: 'Harita özelliği yakında eklenecek!',
  },

  // Map Screen
  map: {
    title: 'Harita',
    searchRadius: 'Arama Yarıçapı',
    lostPetsNearby: 'yakındaki kayıp pet',
    yourLocation: 'Konumunuz',
    currentPosition: 'Mevcut konum',
    mixedBreed: 'Karışık',
    reward: 'Ödül',
    viewDetails: 'Detayları Gör',
    petsInThisArea: 'bu bölgedeki pet',
    
    // Filters
    mapFilters: 'Harita Filtreleri',
    petType: 'Pet Türü',
    all: 'Tümü',
    dog: 'Köpek',
    cat: 'Kedi',
    bird: 'Kuş',
    other: 'Diğer',
    
    // Time filters
    timePosted: 'Yayınlanma Zamanı',
    allTime: 'Tüm zamanlar',
    last24Hours: 'Son 24 saat',
    last7Days: 'Son 7 gün',
    last30Days: 'Son 30 gün',
    
    // Urgency filters
    urgencyLevel: 'Aciliyet Seviyesi',
    critical: 'Kritik',
    high: 'Yüksek',
    medium: 'Orta',
    low: 'Düşük',
    
    // Other filters
    showFoundPets: 'Bulunan petleri göster',
    
    // Urgency levels (uppercase for badges)
    CRITICAL: 'KRİTİK',
    HIGH: 'YÜKSEK',
    MEDIUM: 'ORTA',
    LOW: 'DÜŞÜK',
  },

  // Hero Board Screen
  heroBoard: {
    title: 'Kahramanlar Panosu',
    subtitle: 'Toplumumuzun gerçek kahramanları',
    
    // Hero Levels
    streetGuardian: 'Sokak Koruyucu',
    animalFriend: 'Hayvan Dostu',
    communityHero: 'Toplum Kahramanı',
    lifeSaver: 'Hayat Kurtaran',
    legendaryGuardian: 'Legendar Koruyucu',
    
    // Stats
    petsHelped: 'Yardım Edilen Pet',
    level: 'Seviye',
    xpPoints: 'XP Puanı',
    badges: 'Rozet',
    
    // Challenges
    dailyChallenges: 'Günlük Görevler',
    weeklyChallenges: 'Haftalık Görevler',
    reportOneLostPet: 'Bir kayıp pet bildir',
    helpFiveStreetAnimals: '5 sokak hayvanına yardım et',
    
    // Leaderboard
    topHeroes: 'En İyi Kahramanlar',
    thisMonth: 'Bu Ay',
    allTime: 'Tüm Zamanlar',
    neighborhood: 'Mahalle',
    city: 'Şehir',
    
    // Achievements
    achievements: 'Başarımlar',
    newBadgeUnlocked: 'Yeni Rozet Kazanıldı!',
    
    // Emergency Response
    emergencyResponder: 'Acil Durum Müdahale',
    emergencyPoints: '500 puan',
    helpButtonPressed: 'Yardım Edeceğim',
  },

  // Profile Screen
  profile: {
    title: 'Profil',
    myProfile: 'Profilim',
    editProfile: 'Profili Düzenle',
    
    // User Info
    name: 'İsim',
    email: 'E-posta',
    phone: 'Telefon',
    location: 'Konum',
    joinDate: 'Katılım Tarihi',
    
    // Stats
    myStats: 'İstatistiklerim',
    petsReported: 'Bildirilen Pet',
    petsFound: 'Bulunan Pet',
    helpedOthers: 'Yardım Edilen',
    totalPoints: 'Toplam Puan',
    currentLevel: 'Mevcut Seviye',
    
    // My Pets
    myPets: 'Petlerim',
    addPet: 'Pet Ekle',
    noPets: 'Henüz pet eklenmemiş',
    
    // Settings
    settings: 'Ayarlar',
    notifications: 'Bildirimler',
    privacy: 'Gizlilik',
    language: 'Dil',
    currency: 'Para Birimi',
    about: 'Hakkında',
    logout: 'Çıkış Yap',
    
    // Notifications Settings
    pushNotifications: 'Push Bildirimleri',
    nearbyAlerts: 'Yakındaki Uyarılar',
    emergencyBroadcasts: 'Acil Yayınlar',
    achievementNotifications: 'Başarım Bildirimleri',
    dailyReminders: 'Günlük Hatırlatmalar',
    
    // Privacy Settings
    shareLocation: 'Konumu Paylaş',
    showProfile: 'Profili Göster',
    allowMessages: 'Mesajlara İzin Ver',
  },

  // Pet Details
  petDetails: {
    title: 'Pet Detayları',
    lastSeen: 'Son Görülme',
    reward: 'Ödül',
    status: 'Durum',
    description: 'Açıklama',
    contactOwner: 'Sahibiyle İletişim',
    reportSighting: 'Görüldüğünü Bildir',
    shareAlert: 'Uyarıyı Paylaş',
    
    // Status
    lost: 'Kayıp',
    found: 'Bulundu',
    searching: 'Aranıyor',
    
    // Actions
    iSawThisPet: 'Bu Peti Gördüm',
    callOwner: 'Sahibini Ara',
    sendMessage: 'Mesaj Gönder',
  },

  // Messaging
  messaging: {
    title: 'Mesajlar',
    conversations: 'Konuşmalar',
    newMessage: 'Yeni Mesaj',
    noConversations: 'Henüz konuşma yok',
    typeMessage: 'Mesaj yazın...',
    send: 'Gönder',
    
    // Conversation Types
    petOwner: 'Pet Sahibi',
    volunteer: 'Gönüllü',
    helper: 'Yardımcı',
    
    // Quick Messages
    quickMessages: 'Hızlı Mesajlar',
    iSawYourPet: 'Petinizi gördüm',
    needMoreInfo: 'Daha fazla bilgiye ihtiyacım var',
    onMyWay: 'Yoldayım',
    foundSafe: 'Güvenli bir şekilde buldum',
  },

  // Notifications
  notifications: {
    title: 'Bildirimler',
    markAllRead: 'Tümünü Okundu İşaretle',
    noNotifications: 'Bildirim yok',
    
    // Types
    nearbyAlert: 'Yakındaki Uyarı',
    emergencyBroadcast: 'Acil Yayın',
    petFound: 'Pet Bulundu',
    newMessage: 'Yeni Mesaj',
    achievement: 'Başarım',
    reminder: 'Hatırlatma',
    
    // Actions
    view: 'Görüntüle',
    dismiss: 'Kapat',
    snooze: 'Ertele',
  },

  // Errors
  errors: {
    networkError: 'Ağ bağlantısı hatası',
    serverError: 'Sunucu hatası',
    unknownError: 'Bilinmeyen hata',
    tryAgain: 'Tekrar deneyin',
    contactSupport: 'Destek ile iletişime geçin',
  },

  // Success Messages
  success: {
    profileUpdated: 'Profil güncellendi',
    petAdded: 'Pet eklendi',
    messageSent: 'Mesaj gönderildi',
    reportSubmitted: 'Rapor gönderildi',
    settingsSaved: 'Ayarlar kaydedildi',
  },

  // Time Formats
  time: {
    now: 'Şimdi',
    minuteAgo: '1 dakika önce',
    minutesAgo: '{count} dakika önce',
    hourAgo: '1 saat önce',
    hoursAgo: '{count} saat önce',
    dayAgo: '1 gün önce',
    daysAgo: '{count} gün önce',
    weekAgo: '1 hafta önce',
    weeksAgo: '{count} hafta önce',
    monthAgo: '1 ay önce',
    monthsAgo: '{count} ay önce',
  },

  // Units
  units: {
    km: 'km',
    meter: 'm',
    minute: 'dakika',
    hour: 'saat',
    day: 'gün',
    week: 'hafta',
    month: 'ay',
    year: 'yıl',
    currency: '₺',
    percent: '%',
  },

  // Currency
  currency: {
    title: 'Para Birimi',
    selectCurrency: 'Para Birimi Seç',
    turkishLira: 'Türk Lirası (₺)',
    usDollar: 'Amerikan Doları ($)',
    euro: 'Euro (€)',
    currencySelection: 'Para Birimi Seçimi',
    selectCurrencyDescription: 'Tercih ettiğiniz para birimini seçin',
  },

  // Districts (for neighborhood leaderboards)
  districts: {
    kadikoy: 'Kadıköy',
    besiktas: 'Beşiktaş',
    sisli: 'Şişli',
    uskudar: 'Üsküdar',
    fatih: 'Fatih',
    beyoglu: 'Beyoğlu',
    kartal: 'Kartal',
    maltepe: 'Maltepe',
    pendik: 'Pendik',
    tuzla: 'Tuzla',
    sancaktepe: 'Sancaktepe',
    umraniye: 'Ümraniye',
    atasehir: 'Ataşehir',
    karşıyaka: 'Karşıyaka',
    bornova: 'Bornova',
    konak: 'Konak',
    bayrakli: 'Bayraklı',
  },

  // Success Stories
  successStories: {
    title: 'Başarı Hikayeleri',
    subtitle: 'Mutlu sonlarla dolu hikayeler',
    heroOfTheMonth: 'Ayın Kahramanı',
    monthlyStats: 'Bu Ay İstatistikleri',
    recentStories: 'Son Hikayeler',
    featuredStories: 'Öne Çıkanlar',
    fastestReunions: 'En Hızlı',
    
    // Story details
    owner: 'Sahip',
    finder: 'Bulan',
    foundIn: 'bulundu',
    reward: 'Ödül',
    testimonials: 'Teşekkürler',
    achievements: 'Başarımlar',
    
    // Time formats
    minutes: 'dakika',
    hours: 'saat',
    days: 'gün',
    
    // Stats
    happyEndings: 'Mutlu Son',
    averageTime: 'Ort. Süre',
    fastestTime: 'En Hızlı',
    totalRewards: 'Toplam Ödül',
    petsHelped: 'pet yardım',
    
    // Actions
    like: 'Beğen',
    share: 'Paylaş',
    shareSuccess: 'Hikaye panoya kopyalandı!',
    
    // Labels
    lost: 'Kayıp',
    found: 'Bulundu',
    featured: 'Öne Çıkan',
    
    // Share message template
    shareTemplate: '{petName} bulundu!\n\n{story}\n\n📍 {location}\n⏰ {time}\n\n#KayıpHayvanBulundu #MutluSon'
  },
};

// Helper function to get nested translation
export const t = (key: string, params?: Record<string, string | number>): string => {
  const keys = key.split('.');
  let value: any = translations;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }
  
  if (typeof value !== 'string') {
    console.warn(`Translation value is not a string: ${key}`);
    return key;
  }
  
  // Replace parameters in the string
  if (params) {
    return value.replace(/\{(\w+)\}/g, (match: string, paramKey: string) => {
      return params[paramKey]?.toString() || match;
    });
  }
  
  return value;
};

// Success Stories specific translations
export const successStoriesTranslations = {
  celebration: {
    liked: '❤️',
    sparkles: '✨',
    trophy: '🏆',
    success: '🎉'
  },
  
  badges: {
    fastResponse: 'Hızlı Müdahale',
    communityHero: 'Toplum Kahramanı',
    trustedVolunteer: 'Güvenilir Gönüllü',
    lifeSaver: 'Hayat Kurtaran',
    petFriend: 'Hayvan Dostu'
  },
  
  tags: {
    quickReunion: 'hızlı-buluş',
    park: 'park',
    volunteerHelp: 'gönüllü-yardımı',
    dog: 'köpek',
    cat: 'kedi',
    familyPet: 'aile-peti',
    happyEnding: 'mutlu-son',
    record: 'rekord'
  }
};

// Helper function for success stories
export const formatSuccessStoryTime = (hours: number): string => {
  if (hours < 1) {
    return `${Math.round(hours * 60)} ${translations.successStories.minutes}`;
  } else if (hours < 24) {
    return `${Math.round(hours)} ${translations.successStories.hours}`;
  } else {
    return `${Math.round(hours / 24)} ${translations.successStories.days}`;
  }
};

// Helper function for currency formatting
export const formatSuccessStoryCurrency = (amount: number, currency: string): string => {
  return `${amount.toLocaleString('tr-TR')} ${currency}`;
};

// Export default for easier imports
export default translations;