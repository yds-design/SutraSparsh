import type { TithiItem } from "../components/ImportantTithisParv";

export interface HinduMonthInfo {
  monthIndex: number;
  nameEn: string;
  nameHi: string;
  gregorianSpan: string;
}

export const HINDU_MONTHS_MAP: Record<number, { nameEn: string; nameHi: string }> = {
  0: { nameEn: "Pausha – Magha", nameHi: "पौष - माघ" },
  1: { nameEn: "Magha – Phalguna", nameHi: "माघ - फाल्गुन" },
  2: { nameEn: "Phalguna – Chaitra", nameHi: "फाल्गुन - चैत्र" },
  3: { nameEn: "Chaitra – Vaishakha", nameHi: "चैत्र - वैशाख" },
  4: { nameEn: "Vaishakha – Jyeshtha", nameHi: "वैशाख - ज्येष्ठ" },
  5: { nameEn: "Jyeshtha – Ashadha", nameHi: "ज्येष्ठ - आषाढ़" },
  6: { nameEn: "Ashadha – Shravana", nameHi: "आषाढ़ - श्रावण" },
  7: { nameEn: "Shravana – Bhadrapada", nameHi: "श्रावण - भाद्रपद" },
  8: { nameEn: "Bhadrapada – Ashvina", nameHi: "भाद्रपद - आश्विन" },
  9: { nameEn: "Ashvina – Kartika", nameHi: "आश्विन - कार्तिक" },
  10: { nameEn: "Kartika – Margashirsha", nameHi: "कार्तिक - मार्गशीर्ष" },
  11: { nameEn: "Margashirsha – Pausha", nameHi: "मार्गशीर्ष - पौष" },
};

export const MONTH_NAMES_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const MONTH_NAMES_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export const DAY_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

/**
 * Master catalog of authentic Vedic Parvs and Tithis for 2025–2027.
 * Keyed by ISO date string (YYYY-MM-DD).
 */
export const VERIFIED_TITHIS_CATALOG: Record<string, Omit<TithiItem, "dateFormatted" | "dayOfWeek">> = {
  // ── September 2026 (Bhadrapada - Ashvina) ──
  "2026-09-04": {
    id: "janmashtami-2026",
    nameEn: "Krishna Janmashtami",
    nameHi: "श्रीकृष्ण जन्माष्टमी",
    tithi: "Ashtami (अष्टमी)",
    paksha: "Krishna",
    category: "festival",
    significance: "The supreme advent of Bhagavan Sri Krishna, speaker of the sacred Bhagavad Gita.",
    observance: "Nirjala/Phalahar fast, midnight Krishna Dhyana, recitation of Gita Chapter 12 & 15.",
    recommendedVerseId: "gita-2-47",
    recommendedVerseTitle: "Gita 2.47 · Karma Yoga",
  },
  "2026-09-08": {
    id: "aja-ekadashi-2026",
    nameEn: "Aja Ekadashi",
    nameHi: "अजा एकादशी",
    tithi: "Ekadashi (एकादशी)",
    paksha: "Krishna",
    category: "ekadashi",
    significance: "Sacred Krishna Paksha Ekadashi destroying past obstacles and cultivating deep dispassion.",
    observance: "Grain-free fasting, unbroken Om Namo Bhagavate Vasudevaya japa, evening reflection.",
    recommendedVerseId: "gita-2-47",
    recommendedVerseTitle: "Gita 2.47 · Duty & Detachment",
  },
  "2026-09-09": {
    id: "pradosh-krishna-2026-09",
    nameEn: "Bhadrapada Pradosh Vrat",
    nameHi: "प्रदोष व्रत (कृष्ण)",
    tithi: "Trayodashi (त्रयोदशी)",
    paksha: "Krishna",
    category: "pradosh",
    significance: "Sacred twilight hour dedicated to Mahadeva Shiva for emotional equilibrium and peaceful mind.",
    observance: "Twilight meditation during sandhya period, chanting Om Namah Shivaya.",
    recommendedVerseId: "mandukya-mantra-1",
    recommendedVerseTitle: "Mandukya 1 · Sound of OM",
  },
  "2026-09-11": {
    id: "bhadrapada-amavasya-2026",
    nameEn: "Bhadrapada Amavasya (Darsha)",
    nameHi: "भाद्रपद अमावस्या",
    tithi: "Amavasya (अमावस्या)",
    paksha: "Krishna",
    category: "purnima_amavasya",
    significance: "Stillness of the cosmic lunar cycle, deep inward contemplation and ancestral gratefulness.",
    observance: "Silent contemplation, breath awareness, Sattvic mindfulness.",
    recommendedVerseId: "yoga-sutra-1-2",
    recommendedVerseTitle: "Yoga Sutra 1.2 · Chitta Vritti",
  },
  "2026-09-14": {
    id: "ganesh-chaturthi-2026",
    nameEn: "Ganesh Chaturthi (Vinayaka)",
    nameHi: "गणेश चतुर्थी",
    tithi: "Shukla Chaturthi (चतुर्थी)",
    paksha: "Shukla",
    category: "festival",
    significance: "Advent of Sri Vighnaharta Ganesha, deity of auspicious intellect, discrimination, and wisdom.",
    observance: "Modak offerings, study of sacred mantras, contemplation on removal of inner doubts.",
    recommendedVerseId: "isha-upanishad-1",
    recommendedVerseTitle: "Isha Upanishad 1 · Divine Presence",
  },
  "2026-09-16": {
    id: "rishi-panchami-2026",
    nameEn: "Rishi Panchami",
    nameHi: "ऋषि पंचमी",
    tithi: "Shukla Panchami (पंचमी)",
    paksha: "Shukla",
    category: "festival",
    significance: "Reverence to the ancient Vedic Saptarishis whose realizations form the Upanishads and Shrutis.",
    observance: "Scripture study, meditation on Rishi lineage and eternal Dharma.",
    recommendedVerseId: "yoga-sutra-2-46",
    recommendedVerseTitle: "Yoga Sutra 2.46 · Sthira Sukham",
  },
  "2026-09-22": {
    id: "parivartini-ekadashi-2026",
    nameEn: "Parivartini / Parsva Ekadashi",
    nameHi: "परिवर्तिनी एकादशी",
    tithi: "Shukla Ekadashi (एकादशी)",
    paksha: "Shukla",
    category: "ekadashi",
    significance: "The cosmic turn of Mahavishnu in Yoga Nidra. Bestows spiritual elevation and mental clarity.",
    observance: "Complete/partial fast, continuous awareness of divine presence, Gita recitation.",
    recommendedVerseId: "gita-2-47",
    recommendedVerseTitle: "Gita 2.47 · Nishkama Karma",
  },
  "2026-09-25": {
    id: "anant-chaturdashi-2026",
    nameEn: "Anant Chaturdashi",
    nameHi: "अनंत चतुर्दशी",
    tithi: "Shukla Chaturdashi (चतुर्दशी)",
    paksha: "Shukla",
    category: "festival",
    significance: "Worship of the Boundless Infinite Reality (Ananta Brahman) and holy conclusion of Ganeshotsav.",
    observance: "Tying sacred protective cord, meditation on timeless consciousness.",
    recommendedVerseId: "mandukya-mantra-1",
    recommendedVerseTitle: "Mandukya 1 · Eternal Brahman",
  },
  "2026-09-26": {
    id: "bhadrapada-purnima-2026",
    nameEn: "Bhadrapada Purnima (Satyanarayan)",
    nameHi: "भाद्रपद पूर्णिमा (महालया प्रारंभ)",
    tithi: "Purnima (पूर्णिमा)",
    paksha: "Shukla",
    category: "purnima_amavasya",
    significance: "Radiant Full Moon illumination, Satyanarayan Vrat, and commencement of holy Pitru Paksha.",
    observance: "Moonlight Dhyana, offering of pure gratitude, Satyanarayan katha reflection.",
    recommendedVerseId: "isha-upanishad-1",
    recommendedVerseTitle: "Isha Upanishad 1 · All is Divine",
  },

  // ── October 2026 (Ashvina - Kartika) ──
  "2026-10-07": {
    id: "indira-ekadashi-2026",
    nameEn: "Indira Ekadashi (Pitru Paksha)",
    nameHi: "इन्दिरा एकादशी",
    tithi: "Krishna Ekadashi (एकादशी)",
    paksha: "Krishna",
    category: "ekadashi",
    significance: "Ekadashi occurring during Pitru Paksha. Dedicated to peace of all living and departed beings.",
    observance: "Strict fasting, selfless charity, prayers for universal liberation.",
    recommendedVerseId: "gita-2-47",
    recommendedVerseTitle: "Gita 2.47 · Selfless Surrender",
  },
  "2026-10-10": {
    id: "sarva-pitru-amavasya-2026",
    nameEn: "Mahalaya / Sarva Pitru Amavasya",
    nameHi: "सर्वपितृ अमावस्या (महालया)",
    tithi: "Amavasya (अमावस्या)",
    paksha: "Krishna",
    category: "purnima_amavasya",
    significance: "Culmination of sacred Pitru Paksha. Invocation of Divine Mother Adishakti.",
    observance: "Tarpana, annadanam to seekers, quiet inward meditation on continuum of life.",
    recommendedVerseId: "gita-2-47",
    recommendedVerseTitle: "Gita 2.47 · Selfless Offering",
  },
  "2026-10-11": {
    id: "sharad-navratri-2026",
    nameEn: "Sharad Navratri Ghatasthapana",
    nameHi: "शारदीय नवरात्रि घटस्थापना",
    tithi: "Shukla Pratipada (प्रतिपदा)",
    paksha: "Shukla",
    category: "festival",
    significance: "Commencement of 9 holy nights celebrating Divine Mother Bhavani and inner Kundalini awakening.",
    observance: "Kalash Sthapana, Devi Kavach recitation, sattvic fasting.",
    recommendedVerseId: "isha-upanishad-1",
    recommendedVerseTitle: "Isha 1 · Divine Cosmic Energy",
  },
  "2026-10-19": {
    id: "durga-ashtami-2026",
    nameEn: "Maha Durgashtami",
    nameHi: "महा दुर्गाष्टमी",
    tithi: "Shukla Ashtami (अष्टमी)",
    paksha: "Shukla",
    category: "festival",
    significance: "Day of triumph over ignorance and internal tamasic forces through supreme Shakti.",
    observance: "Kanya Pujan, Sandhi Puja, contemplation on spiritual fortitude.",
    recommendedVerseId: "yoga-sutra-1-2",
    recommendedVerseTitle: "Yoga Sutra 1.2 · Calming Mental Waves",
  },
  "2026-10-20": {
    id: "dussehra-2026",
    nameEn: "Vijayadashami / Dussehra",
    nameHi: "विजयादशमी / दशहरा",
    tithi: "Shukla Dashami (दशमी)",
    paksha: "Shukla",
    category: "festival",
    significance: "Victory of Truth, Righteousness, and Sri Rama over adharma and ego.",
    observance: "Aparajita Puja, Shami tree reverence, vows of righteous living.",
    recommendedVerseId: "gita-2-47",
    recommendedVerseTitle: "Gita 2.47 · Duty & Righteous Action",
  },
  "2026-10-21": {
    id: "papankusha-ekadashi-2026",
    nameEn: "Papankusha Ekadashi",
    nameHi: "पापांकुशा एकादशी",
    tithi: "Shukla Ekadashi (एकादशी)",
    paksha: "Shukla",
    category: "ekadashi",
    significance: "Acts as a spiritual goad (Ankusha) guiding wandering mind away from sense entrapments.",
    observance: "Fasting, Vishnu Sahasranama chanting, silent introspection.",
    recommendedVerseId: "yoga-sutra-2-46",
    recommendedVerseTitle: "Yoga Sutra 2.46 · Steadiness in Asana",
  },
  "2026-10-25": {
    id: "sharad-purnima-2026",
    nameEn: "Sharad Purnima (Kojagari)",
    nameHi: "शरद पूर्णिमा (कोजागरी / रास पूर्णिमा)",
    tithi: "Purnima (पूर्णिमा)",
    paksha: "Shukla",
    category: "purnima_amavasya",
    significance: "Nectarine Full Moon where moonlight is believed to shower Amrita. Maharaas of Krishna.",
    observance: "Moonlight meditation, kheer offering under moon, chanting Om Somaya Namaha.",
    recommendedVerseId: "mandukya-mantra-1",
    recommendedVerseTitle: "Mandukya 1 · Radiant Consciousness",
  },
  "2026-10-29": {
    id: "karwa-chauth-2026",
    nameEn: "Karwa Chauth (Sankashti)",
    nameHi: "करवा चौथ / संकष्टी चतुर्थी",
    tithi: "Krishna Chaturthi (चतुर्थी)",
    paksha: "Krishna",
    category: "festival",
    significance: "Sacred vow of loyalty, mutual spiritual harmony, and reverence to Shiva-Parvati.",
    observance: "Nirjala fast until moonrise, Arghya to Chandra Deva.",
    recommendedVerseId: "isha-upanishad-1",
    recommendedVerseTitle: "Isha 1 · Sacred Bond of Life",
  },

  // ── November 2026 (Kartika - Margashirsha) ──
  "2026-11-04": {
    id: "rama-ekadashi-2026",
    nameEn: "Rama Ekadashi (Kartika)",
    nameHi: "रमा एकादशी",
    tithi: "Krishna Ekadashi (एकादशी)",
    paksha: "Krishna",
    category: "ekadashi",
    significance: "Auspicious Ekadashi in holy month of Kartika invoking blessings of Mahalakshmi & Vishnu.",
    observance: "Deepdaan in temple, phalahar fast, Bhagavad Gita reading.",
    recommendedVerseId: "gita-2-47",
    recommendedVerseTitle: "Gita 2.47 · Dedication of Action",
  },
  "2026-11-06": {
    id: "dhanteras-2026",
    nameEn: "Dhanteras (Dhanvantari Jayanti)",
    nameHi: "धनतेरस / धन्वन्तरि जयन्ती",
    tithi: "Krishna Trayodashi (त्रयोदशी)",
    paksha: "Krishna",
    category: "festival",
    significance: "Advent of Bhagavan Dhanvantari, master of Ayurveda and holistic healing of body and soul.",
    observance: "Yama Deepam at entrance, lighting lamps for health and life protection.",
    recommendedVerseId: "yoga-sutra-1-2",
    recommendedVerseTitle: "Yoga Sutra 1.2 · Harmony of Mind & Body",
  },
  "2026-11-07": {
    id: "naraka-chaturdashi-2026",
    nameEn: "Naraka Chaturdashi (Choti Diwali)",
    nameHi: "नरक चतुर्दशी (रूप चौदस)",
    tithi: "Krishna Chaturdashi (चतुर्दशी)",
    paksha: "Krishna",
    category: "festival",
    significance: "Destruction of darkness, lethargy, and ego; awakening to inner radiance.",
    observance: "Abhyanga Snan at dawn, lighting 14 earthen lamps.",
    recommendedVerseId: "isha-upanishad-1",
    recommendedVerseTitle: "Isha 1 · Illumination of Spirit",
  },
  "2026-11-08": {
    id: "diwali-2026",
    nameEn: "Diwali / Deepawali (Lakshmi Pujan)",
    nameHi: "दीपावली • महालक्ष्मी पूजन",
    tithi: "Amavasya (अमावस्या)",
    paksha: "Krishna",
    category: "festival",
    significance: "The supreme Festival of Lights commemorating return of Sri Rama and adoration of Divine Grace.",
    observance: "Lighting earthen ghee lamps, Lakshmi-Ganesha pujan, sharing joy with all living beings.",
    recommendedVerseId: "isha-upanishad-1",
    recommendedVerseTitle: "Isha Upanishad 1 · All is Enveloped by Divine",
  },
  "2026-11-09": {
    id: "govardhan-puja-2026",
    nameEn: "Govardhan Puja (Annakut)",
    nameHi: "गोवर्धन पूजा / अन्नकूट",
    tithi: "Shukla Pratipada (प्रतिपदा)",
    paksha: "Shukla",
    category: "festival",
    significance: "Reverence to Nature, cows, sacred earth, and Sri Krishna lifting Mount Govardhan.",
    observance: "Offering 56 bhog items, circumambulation of sacred symbols, deep ecology gratitude.",
    recommendedVerseId: "gita-2-47",
    recommendedVerseTitle: "Gita 2.47 · Selfless Service to Nature",
  },
  "2026-11-10": {
    id: "bhai-dooj-2026",
    nameEn: "Bhai Dooj (Yama Dvitiya)",
    nameHi: "भाई दूज / यम द्वितीया",
    tithi: "Shukla Dvitiya (द्वितीया)",
    paksha: "Shukla",
    category: "festival",
    significance: "Sacred bond of protection and unconditional love between siblings, blessed by Yama & Yamuna.",
    observance: "Tilak ceremony, prayers for longevity, purity of relations.",
    recommendedVerseId: "mandukya-mantra-1",
    recommendedVerseTitle: "Mandukya 1 · Unity of Souls",
  },
  "2026-11-14": {
    id: "chhath-puja-2026",
    nameEn: "Chhath Puja (Surya Shashthi)",
    nameHi: "छठ पूजा (सूर्य षष्ठी)",
    tithi: "Shukla Shashthi (षष्ठी)",
    paksha: "Shukla",
    category: "festival",
    significance: "Ancient solar worship expressing boundless gratitude to Bhagavan Surya and Chhathi Maiya.",
    observance: "Standing in pure water, offering evening and dawn Arghya, austere purity.",
    recommendedVerseId: "isha-upanishad-1",
    recommendedVerseTitle: "Isha 1 · Radiance of the Solar Logos",
  },
  "2026-11-17": {
    id: "gopashtami-2026",
    nameEn: "Gopashtami",
    nameHi: "गोपाष्टमी",
    tithi: "Shukla Ashtami (अष्टमी)",
    paksha: "Shukla",
    category: "festival",
    significance: "The day young Krishna officially assumed duties of tending cows and calves in Vrindavan.",
    observance: "Feeding and caring for cows, meditation on non-violence (Ahimsa) and compassion.",
    recommendedVerseId: "gita-2-47",
    recommendedVerseTitle: "Gita 2.47 · Compassion in Action",
  },
  "2026-11-20": {
    id: "devuthani-ekadashi-2026",
    nameEn: "Devuthani / Prabodhini Ekadashi",
    nameHi: "देवउठनी एकादशी / प्रबोधिनी",
    tithi: "Shukla Ekadashi (एकादशी)",
    paksha: "Shukla",
    category: "ekadashi",
    significance: "Awakening of Mahavishnu from Chaturmas cosmic sleep. Auspicious period commences.",
    observance: "Sugarcane mandap, continuous Vishnu smarana, night vigil with sacred songs.",
    recommendedVerseId: "gita-2-47",
    recommendedVerseTitle: "Gita 2.47 · Awakening to Dharma",
  },
  "2026-11-21": {
    id: "tulsi-vivah-2026",
    nameEn: "Tulsi Vivah",
    nameHi: "तुलसी विवाह",
    tithi: "Shukla Dvadashi (द्वादशी)",
    paksha: "Shukla",
    category: "festival",
    significance: "Ceremonial divine union of holy Tulsi plant with Shaligram / Sri Vishnu.",
    observance: "Decorating Tulsi with bridal attire, recitation of Damodarashtakam.",
    recommendedVerseId: "mandukya-mantra-1",
    recommendedVerseTitle: "Mandukya 1 · Divine Love & Devotion",
  },
  "2026-11-22": {
    id: "vaikuntha-chaturdashi-2026",
    nameEn: "Vaikuntha Chaturdashi",
    nameHi: "वैकुण्ठ चतुर्दशी",
    tithi: "Shukla Chaturdashi (चतुर्दशी)",
    paksha: "Shukla",
    category: "festival",
    significance: "Sacred confluence where Hari and Hara (Vishnu & Shiva) adore each other with 1000 lotuses.",
    observance: "Midnight worship of Shiva with Tulsi leaves, and Vishnu with Bael leaves.",
    recommendedVerseId: "mandukya-mantra-1",
    recommendedVerseTitle: "Mandukya 1 · Non-Duality of Hari & Hara",
  },
  "2026-11-24": {
    id: "kartika-purnima-2026",
    nameEn: "Dev Deepawali / Kartika Purnima",
    nameHi: "देव दीपावली • कार्तिक पूर्णिमा",
    tithi: "Purnima (पूर्णिमा)",
    paksha: "Shukla",
    category: "purnima_amavasya",
    significance: "Celebrated in Varanasi where Devas descend to celebrate victory of Shiva over Tripurasura.",
    observance: "Lighting lamps along rivers/ponds, sacred snana, chanting Shiva Mahimna Stotram.",
    recommendedVerseId: "isha-upanishad-1",
    recommendedVerseTitle: "Isha Upanishad 1 · Cosmic Illumination",
  },

  // ── December 2026 (Margashirsha - Pausha) ──
  "2026-12-05": {
    id: "utpanna-ekadashi-2026",
    nameEn: "Utpanna Ekadashi",
    nameHi: "उत्पन्ना एकादशी",
    tithi: "Krishna Ekadashi (एकादशी)",
    paksha: "Krishna",
    category: "ekadashi",
    significance: "Day when the divine goddess Ekadashi originated from Sri Vishnu to conquer demon Mura.",
    observance: "Beginning of Ekadashi annual vows, complete grain fast, meditation on inner light.",
    recommendedVerseId: "gita-2-47",
    recommendedVerseTitle: "Gita 2.47 · Mastery Over Senses",
  },
  "2026-12-07": {
    id: "margashirsha-pradosh-2026",
    nameEn: "Margashirsha Pradosh Vrat",
    nameHi: "मार्गशीर्ष प्रदोष व्रत",
    tithi: "Krishna Trayodashi (त्रयोदशी)",
    paksha: "Krishna",
    category: "pradosh",
    significance: "Holy twilight meditation for mental purity, emotional tranquility, and spiritual poise.",
    observance: "Evening Bilva patra offering to Shiva Lingam, contemplation of OM vibration.",
    recommendedVerseId: "mandukya-mantra-1",
    recommendedVerseTitle: "Mandukya 1 · Silent Witness",
  },
  "2026-12-09": {
    id: "margashirsha-amavasya-2026",
    nameEn: "Margashirsha Amavasya",
    nameHi: "मार्गशीर्ष अमावस्या",
    tithi: "Amavasya (अमावस्या)",
    paksha: "Krishna",
    category: "purnima_amavasya",
    significance: "Silent stillness of winter lunar cycle. Period of inward contemplation and spiritual recharge.",
    observance: "Silent meditation, breath control (Pranayama), giving food to the needy.",
    recommendedVerseId: "yoga-sutra-1-2",
    recommendedVerseTitle: "Yoga Sutra 1.2 · Stillness of the Self",
  },
  "2026-12-20": {
    id: "gita-jayanti-2026",
    nameEn: "Gita Jayanti / Mokshada Ekadashi",
    nameHi: "गीता जयंती • मोक्षदा एकादशी",
    tithi: "Shukla Ekadashi (एकादशी)",
    paksha: "Shukla",
    category: "ekadashi",
    significance: "The supreme historical day when Sri Krishna bestowed the Bhagavad Gita to Arjuna at Kurukshetra.",
    observance: "Recitation of entire Bhagavad Gita, distribution of Gita copies, profound contemplation.",
    recommendedVerseId: "gita-2-47",
    recommendedVerseTitle: "Gita 2.47 · The Jewel of Karma Yoga",
  },
  "2026-12-23": {
    id: "dattatreya-jayanti-2026",
    nameEn: "Dattatreya Jayanti / Margashirsha Purnima",
    nameHi: "दत्तात्रेय जयन्ती • मार्गशीर्ष पूर्णिमा",
    tithi: "Purnima (पूर्णिमा)",
    paksha: "Shukla",
    category: "purnima_amavasya",
    significance: "Advent of Sri Dattatreya, personification of Brahma-Vishnu-Shiva and supreme Avadhuta Guru.",
    observance: "Guru worship, meditation on learning from Nature's 24 teachers, chanting Om Dram Dattatreyaya Namaha.",
    recommendedVerseId: "mandukya-mantra-1",
    recommendedVerseTitle: "Mandukya 1 · The Eternal Guru",
  },

  // ── January 2027 (Pausha - Magha) ──
  "2027-01-04": {
    id: "saphala-ekadashi-2027",
    nameEn: "Saphala Ekadashi",
    nameHi: "सफला एकादशी",
    tithi: "Krishna Ekadashi (एकादशी)",
    paksha: "Krishna",
    category: "ekadashi",
    significance: "Bestows fulfillment (Saphala) to spiritual endeavors and clears past negative tendencies.",
    observance: "Deep meditation, lamp offerings, contemplation on sacred duties.",
    recommendedVerseId: "gita-2-47",
    recommendedVerseTitle: "Gita 2.47 · True Fruits of Action",
  },
  "2027-01-14": {
    id: "makar-sankranti-2027",
    nameEn: "Makar Sankranti (Uttarayana)",
    nameHi: "मकर संक्रांति (उत्तरायण प्रारंभ)",
    tithi: "Solar Transition (संक्रांति)",
    paksha: "Shukla",
    category: "festival",
    significance: "Cosmic entry of the Sun into Makara (Capricorn), beginning the auspicious Uttarayana cycle.",
    observance: "Holy river bathing, Til-Gur charity, Surya Gayatri recitation.",
    recommendedVerseId: "isha-upanishad-1",
    recommendedVerseTitle: "Isha 1 · Sun as the Divine Eye",
  },
  "2027-01-18": {
    id: "pausha-putrada-ekadashi-2027",
    nameEn: "Pausha Putrada Ekadashi",
    nameHi: "पौष पुत्रदा एकादशी",
    tithi: "Shukla Ekadashi (एकादशी)",
    paksha: "Shukla",
    category: "ekadashi",
    significance: "Blesses seekers with righteous progeny, spiritual lineage, and inner prosperity.",
    observance: "Observing fast, prayers to Sri Narayana, virtuous conduct.",
    recommendedVerseId: "yoga-sutra-2-46",
    recommendedVerseTitle: "Yoga Sutra 2.46 · Balance & Composure",
  },
  "2027-01-22": {
    id: "pausha-purnima-2027",
    nameEn: "Pausha Purnima (Magha Snan Start)",
    nameHi: "पौष पूर्णिमा (माघ स्नान प्रारंभ)",
    tithi: "Purnima (पूर्णिमा)",
    paksha: "Shukla",
    category: "purnima_amavasya",
    significance: "Conclusion of Shakambhari Navratri and commencement of month-long sacred dawn bathing.",
    observance: "Dawn bathing in cold water, Satyanarayan Vrat, feeding the hungry.",
    recommendedVerseId: "mandukya-mantra-1",
    recommendedVerseTitle: "Mandukya 1 · Purified Consciousness",
  },
};

/**
 * Calculates approximate astronomical Tithi for any given Date.
 * Returns tithi index (0-29), paksha, tithi number (1-15), and tithi name.
 */
export function getAstronomicalTithi(date: Date): {
  phase: number;
  tithiIndex: number; // 0 to 29
  paksha: "Shukla" | "Krishna";
  tithiNumber: number; // 1 to 15
  tithiNameEn: string;
  tithiNameHi: string;
} {
  const time = date.getTime();
  const jd = time / 86400000 + 2440587.5;
  // Reference astronomical new moon: Jan 6, 2000 at 18:14 UTC = JD 2451550.26
  const synodicMonth = 29.530588853;
  const lunations = (jd - 2451550.26) / synodicMonth;
  const phase = lunations - Math.floor(lunations);
  const tithiIndex = Math.floor(phase * 30); // 0 to 29

  const isShukla = tithiIndex < 15;
  const paksha: "Shukla" | "Krishna" = isShukla ? "Shukla" : "Krishna";
  const tithiNumber = (tithiIndex % 15) + 1;

  const TITHI_NAMES: Record<number, { en: string; hi: string }> = {
    1: { en: "Pratipada", hi: "प्रतिपदा" },
    2: { en: "Dvitiya", hi: "द्वितीया" },
    3: { en: "Tritiya", hi: "तृतीया" },
    4: { en: "Chaturthi", hi: "चतुर्थी" },
    5: { en: "Panchami", hi: "पंचमी" },
    6: { en: "Shashthi", hi: "षष्ठी" },
    7: { en: "Saptami", hi: "सप्तमी" },
    8: { en: "Ashtami", hi: "अष्टमी" },
    9: { en: "Navami", hi: "नवमी" },
    10: { en: "Dashami", hi: "दशमी" },
    11: { en: "Ekadashi", hi: "एकादशी" },
    12: { en: "Dvadashi", hi: "द्वादशी" },
    13: { en: "Trayodashi", hi: "त्रयोदशी" },
    14: { en: "Chaturdashi", hi: "चतुर्दशी" },
    15: { en: isShukla ? "Purnima" : "Amavasya", hi: isShukla ? "पूर्णिमा" : "अमावस्या" },
  };

  const name = TITHI_NAMES[tithiNumber] || { en: `Tithi ${tithiNumber}`, hi: `तिथि ${tithiNumber}` };

  return {
    phase,
    tithiIndex,
    paksha,
    tithiNumber,
    tithiNameEn: name.en,
    tithiNameHi: name.hi,
  };
}

/**
 * Returns formatted date string like "Nov 20, 2026".
 */
export function formatDate(date: Date): string {
  const m = MONTH_NAMES_SHORT[date.getMonth()];
  const d = date.getDate();
  const y = date.getFullYear();
  return `${m} ${d}, ${y}`;
}

/**
 * Generates an algorithmic TithiItem for an uncataloged Tithi.
 */
function createAlgorithmicTithiItem(date: Date, tithiData: ReturnType<typeof getAstronomicalTithi>): TithiItem | null {
  const { paksha, tithiNumber, tithiNameEn, tithiNameHi } = tithiData;
  const iso = date.toISOString().slice(0, 10);
  const dayOfWeek = DAY_NAMES[date.getDay()];
  const dateFormatted = formatDate(date);

  const monthIdx = date.getMonth();
  const hinduMonth = HINDU_MONTHS_MAP[monthIdx]?.nameEn.split("–")[0].trim() || "Masa";
  const hinduMonthHi = HINDU_MONTHS_MAP[monthIdx]?.nameHi.split("-")[0].trim() || "मास";

  // Focus only on significant Tithis: Ekadashi (11), Trayodashi / Pradosh (13), Purnima (15 Shukla), Amavasya (15 Krishna), Chaturthi (4)
  if (tithiNumber === 11) {
    return {
      id: `ekadashi-${iso}`,
      nameEn: `${hinduMonth} ${paksha} Ekadashi`,
      nameHi: `${hinduMonthHi} ${paksha === "Shukla" ? "शुक्ल" : "कृष्ण"} एकादशी`,
      tithi: `Ekadashi (${tithiNameHi})`,
      paksha,
      dateFormatted,
      dayOfWeek,
      category: "ekadashi",
      significance: "Sacred Ekadashi dedicated to Mahavishnu for inward withdrawal, fasting, and mental clarity.",
      observance: "Phalahar fast, study of Bhagavad Gita, Om Namo Bhagavate Vasudevaya japa.",
      recommendedVerseId: "gita-2-47",
      recommendedVerseTitle: "Gita 2.47 · Duty & Detachment",
    };
  }

  if (tithiNumber === 13) {
    return {
      id: `pradosh-${iso}`,
      nameEn: `${hinduMonth} Pradosh Vrat (${paksha})`,
      nameHi: `प्रदोष व्रत (${paksha === "Shukla" ? "शुक्ल" : "कृष्ण"})`,
      tithi: `Trayodashi (${tithiNameHi})`,
      paksha,
      dateFormatted,
      dayOfWeek,
      category: "pradosh",
      significance: "Twilight sandhya hour dedicated to Mahadeva Shiva for overcoming obstacles and stilling the mind.",
      observance: "Twilight dhyana, Bilva patra offering, chanting Om Namah Shivaya.",
      recommendedVerseId: "mandukya-mantra-1",
      recommendedVerseTitle: "Mandukya 1 · Sacred Om",
    };
  }

  if (tithiNumber === 15) {
    if (paksha === "Shukla") {
      return {
        id: `purnima-${iso}`,
        nameEn: `${hinduMonth} Purnima (Satyanarayan)`,
        nameHi: `${hinduMonthHi} पूर्णिमा`,
        tithi: "Purnima (पूर्णिमा)",
        paksha: "Shukla",
        dateFormatted,
        dayOfWeek,
        category: "purnima_amavasya",
        significance: "Radiant Full Moon celebrating cosmic fullness, Satyanarayan vrat, and inner illumination.",
        observance: "Moonlight meditation, Satyanarayan katha reflection, prayers for universal peace.",
        recommendedVerseId: "isha-upanishad-1",
        recommendedVerseTitle: "Isha Upanishad 1 · Cosmic Wholeness",
      };
    } else {
      return {
        id: `amavasya-${iso}`,
        nameEn: `${hinduMonth} Amavasya`,
        nameHi: `${hinduMonthHi} अमावस्या`,
        tithi: "Amavasya (अमावस्या)",
        paksha: "Krishna",
        dateFormatted,
        dayOfWeek,
        category: "purnima_amavasya",
        significance: "New Moon of complete silence, ancestral gratitude (Pitru Smarana), and deep contemplation.",
        observance: "Silent meditation, breath awareness, offering food to all living beings.",
        recommendedVerseId: "yoga-sutra-1-2",
        recommendedVerseTitle: "Yoga Sutra 1.2 · Calming Mental Waves",
      };
    }
  }

  if (tithiNumber === 4 && paksha === "Krishna") {
    return {
      id: `sankashti-${iso}`,
      nameEn: "Sankashti Chaturthi",
      nameHi: "संकष्टी चतुर्थी",
      tithi: "Chaturthi (चतुर्थी)",
      paksha: "Krishna",
      dateFormatted,
      dayOfWeek,
      category: "festival",
      significance: "Dedicated to Sri Ganesha for dissolving impediments and sharpening spiritual intellect.",
      observance: "Fasting until moonrise, Ganesha Atharvashirsha chanting.",
      recommendedVerseId: "yoga-sutra-2-46",
      recommendedVerseTitle: "Yoga Sutra 2.46 · Steadiness & Ease",
    };
  }

  return null;
}

/**
 * Returns all important Tithis and Parv dates for:
 * 1) The entire current month (from day 1 to end of month)
 * 2) AND for the next 30 days from reference date!
 *
 * Guaranteed to be sorted chronologically and deduplicated.
 */
export function getTithisForCurrentMonthAndNext30Days(referenceDate: Date = new Date()): {
  tithis: TithiItem[];
  currentMonthEn: string;
  currentMonthHi: string;
  gregorianMonthYear: string;
  upcomingCount: number;
} {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();

  // Window start: Day 1 of current month, 00:00:00 local time
  const windowStart = new Date(year, month, 1, 0, 0, 0, 0);

  // Window end: max(end of current month, referenceDate + 30 days)
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);
  const next30Days = new Date(referenceDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  const windowEnd = endOfMonth.getTime() > next30Days.getTime() ? endOfMonth : next30Days;

  const resultItems: (TithiItem & { dateTimestamp: number })[] = [];
  const seenIds = new Set<string>();

  // 1. First, harvest all verified catalog items that fall within this window
  for (const [isoDate, item] of Object.entries(VERIFIED_TITHIS_CATALOG)) {
    const [y, m, d] = isoDate.split("-").map(Number);
    const itemDate = new Date(y, m - 1, d, 12, 0, 0);
    const time = itemDate.getTime();

    if (time >= windowStart.getTime() && time <= windowEnd.getTime()) {
      seenIds.add(isoDate);
      resultItems.push({
        ...item,
        dateFormatted: formatDate(itemDate),
        dayOfWeek: DAY_NAMES[itemDate.getDay()],
        dateTimestamp: time,
      });
    }
  }

  // 2. Iterate each day in the window to compute any missing Ekadashi, Pradosh, Purnima, Amavasya
  const currentCursor = new Date(windowStart);
  let lastTithiNumber = -1;

  while (currentCursor.getTime() <= windowEnd.getTime()) {
    const isoDate = currentCursor.toISOString().slice(0, 10);

    // If day is not already covered by catalog
    if (!seenIds.has(isoDate)) {
      const tithiData = getAstronomicalTithi(currentCursor);

      // Prevent duplicate adjacent days for same tithi (only take first day transition)
      if (tithiData.tithiNumber !== lastTithiNumber) {
        const algorithmicItem = createAlgorithmicTithiItem(new Date(currentCursor), tithiData);
        if (algorithmicItem) {
          // Check if an item of this category already exists within ±1.5 days in resultItems
          const hasNearby = resultItems.some(
            (existing) =>
              existing.category === algorithmicItem.category &&
              Math.abs(existing.dateTimestamp - currentCursor.getTime()) < 1.5 * 86400000
          );

          if (!hasNearby) {
            resultItems.push({
              ...algorithmicItem,
              dateTimestamp: currentCursor.getTime(),
            });
            seenIds.add(isoDate);
          }
        }
      }
      lastTithiNumber = tithiData.tithiNumber;
    }

    // Step forward 1 day
    currentCursor.setDate(currentCursor.getDate() + 1);
  }

  // Sort strictly chronologically
  resultItems.sort((a, b) => a.dateTimestamp - b.dateTimestamp);

  const todayStart = new Date(year, month, referenceDate.getDate(), 0, 0, 0).getTime();

  // Attach isUpcoming and dateIso, then clean up internal dateTimestamp
  const cleanTithis: TithiItem[] = resultItems.map(({ dateTimestamp, ...rest }) => ({
    ...rest,
    dateIso: new Date(dateTimestamp).toISOString().slice(0, 10),
    isUpcoming: dateTimestamp >= todayStart,
  }));

  const monthInfo = HINDU_MONTHS_MAP[month] || { nameEn: "Masa", nameHi: "मास" };
  const gregorianMonthYear = `${MONTH_NAMES_EN[month]} ${year}`;
  const upcomingCount = cleanTithis.filter((i) => i.isUpcoming).length;

  return {
    tithis: cleanTithis,
    currentMonthEn: monthInfo.nameEn,
    currentMonthHi: monthInfo.nameHi,
    gregorianMonthYear,
    upcomingCount,
  };
}
