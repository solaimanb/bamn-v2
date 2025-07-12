import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { MentorResponse } from "@/types/api";
import { Mentor } from "@/types/mentor";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertToMentor(response: MentorResponse): Mentor {
  return {
    ...response,
    linkedin_url: response.linkedin_url || null,
    profile_picture_url: response.profile_picture_url || null,
  };
}

interface LocationDetails {
  continent: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
}

export async function getLocationDetails(lat: number, lng: number): Promise<LocationDetails> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    const data = await response.json();

    let continent = 'Unknown';
    if (data.address?.country_code) {
      const continentMap: { [key: string]: string } = {
        'AF': 'Africa',
        'AS': 'Asia',
        'EU': 'Europe',
        'NA': 'North America',
        'SA': 'South America',
        'OC': 'Oceania',
        'AN': 'Antarctica'
      };

      const countryToContinent: { [key: string]: string } = {
        // Africa (54 countries + territories)
        'dz': 'AF', 'ao': 'AF', 'bj': 'AF', 'bw': 'AF', 'bf': 'AF', 'bi': 'AF', 'cm': 'AF', 'cv': 'AF',
        'cf': 'AF', 'td': 'AF', 'km': 'AF', 'cd': 'AF', 'cg': 'AF', 'ci': 'AF', 'dj': 'AF', 'eg': 'AF',
        'gq': 'AF', 'er': 'AF', 'et': 'AF', 'ga': 'AF', 'gm': 'AF', 'gh': 'AF', 'gn': 'AF', 'gw': 'AF',
        'ke': 'AF', 'ls': 'AF', 'lr': 'AF', 'ly': 'AF', 'mg': 'AF', 'mw': 'AF', 'ml': 'AF', 'mr': 'AF',
        'mu': 'AF', 'ma': 'AF', 'mz': 'AF', 'na': 'AF', 'ne': 'AF', 'ng': 'AF', 'rw': 'AF', 'st': 'AF',
        'sn': 'AF', 'sc': 'AF', 'sl': 'AF', 'so': 'AF', 'za': 'AF', 'ss': 'AF', 'sd': 'AF', 'sz': 'AF',
        'tz': 'AF', 'tg': 'AF', 'tn': 'AF', 'ug': 'AF', 'zm': 'AF', 'zw': 'AF',
        // African territories
        'io': 'AF', 're': 'AF', 'sh': 'AF', 'yt': 'AF',

        // Asia (48 countries + territories and regions)
        'af': 'AS', 'am': 'AS', 'az': 'AS', 'bh': 'AS', 'bd': 'AS', 'bt': 'AS', 'bn': 'AS', 'kh': 'AS',
        'cn': 'AS', 'cy': 'AS', 'ge': 'AS', 'hk': 'AS', 'in': 'AS', 'id': 'AS', 'ir': 'AS', 'iq': 'AS',
        'il': 'AS', 'jp': 'AS', 'jo': 'AS', 'kz': 'AS', 'kw': 'AS', 'kg': 'AS', 'la': 'AS', 'lb': 'AS',
        'mo': 'AS', 'my': 'AS', 'mv': 'AS', 'mn': 'AS', 'mm': 'AS', 'np': 'AS', 'kp': 'AS', 'om': 'AS',
        'pk': 'AS', 'ps': 'AS', 'ph': 'AS', 'qa': 'AS', 'sa': 'AS', 'sg': 'AS', 'kr': 'AS', 'lk': 'AS',
        'sy': 'AS', 'tw': 'AS', 'tj': 'AS', 'th': 'AS', 'tl': 'AS', 'tr': 'AS', 'tm': 'AS', 'ae': 'AS',
        'uz': 'AS', 'vn': 'AS', 'ye': 'AS',
        // Asian territories
        'cc': 'AS', 'cx': 'AS', 'gu': 'AS', 'mp': 'AS',

        // Europe (44 countries + territories and dependencies)
        'al': 'EU', 'ad': 'EU', 'at': 'EU', 'by': 'EU', 'be': 'EU', 'ba': 'EU', 'bg': 'EU', 'hr': 'EU',
        'cz': 'EU', 'dk': 'EU', 'ee': 'EU', 'fi': 'EU', 'fr': 'EU', 'de': 'EU', 'gr': 'EU', 'hu': 'EU',
        'is': 'EU', 'ie': 'EU', 'it': 'EU', 'xk': 'EU', 'lv': 'EU', 'li': 'EU', 'lt': 'EU', 'lu': 'EU',
        'mt': 'EU', 'md': 'EU', 'mc': 'EU', 'me': 'EU', 'nl': 'EU', 'mk': 'EU', 'no': 'EU', 'pl': 'EU',
        'pt': 'EU', 'ro': 'EU', 'ru': 'EU', 'sm': 'EU', 'rs': 'EU', 'sk': 'EU', 'si': 'EU', 'es': 'EU',
        'se': 'EU', 'ch': 'EU', 'ua': 'EU', 'gb': 'EU', 'va': 'EU',
        // European territories and dependencies
        'ax': 'EU', 'fo': 'EU', 'gi': 'EU', 'gg': 'EU', 'je': 'EU', 'im': 'EU', 'sj': 'EU',

        // North America (23 countries + territories and dependencies)
        'ag': 'NA', 'bs': 'NA', 'bb': 'NA', 'bz': 'NA', 'ca': 'NA', 'cr': 'NA', 'cu': 'NA', 'dm': 'NA',
        'do': 'NA', 'sv': 'NA', 'gd': 'NA', 'gt': 'NA', 'ht': 'NA', 'hn': 'NA', 'jm': 'NA', 'mx': 'NA',
        'ni': 'NA', 'pa': 'NA', 'kn': 'NA', 'lc': 'NA', 'vc': 'NA', 'tt': 'NA', 'us': 'NA',
        // North American territories and dependencies
        'ai': 'NA', 'aw': 'NA', 'bm': 'NA', 'bq': 'NA', 'vg': 'NA', 'ky': 'NA', 'cw': 'NA',
        'gl': 'NA', 'gp': 'NA', 'mq': 'NA', 'ms': 'NA', 'pr': 'NA', 'bl': 'NA', 'mf': 'NA',
        'pm': 'NA', 'sx': 'NA', 'tc': 'NA', 'vi': 'NA',

        // South America (12 countries + territories)
        'ar': 'SA', 'bo': 'SA', 'br': 'SA', 'cl': 'SA', 'co': 'SA', 'ec': 'SA', 'gy': 'SA', 'py': 'SA',
        'pe': 'SA', 'sr': 'SA', 'uy': 'SA', 've': 'SA',
        // South American territories
        'fk': 'SA', 'gf': 'SA', 'gs': 'SA',

        // Oceania (14 independent countries + territories and dependencies)
        'au': 'OC', 'fj': 'OC', 'ki': 'OC', 'mh': 'OC', 'fm': 'OC', 'nr': 'OC', 'nz': 'OC', 'pw': 'OC',
        'pg': 'OC', 'ws': 'OC', 'sb': 'OC', 'to': 'OC', 'tv': 'OC', 'vu': 'OC',
        // Oceanian territories and dependencies
        'as': 'OC', 'ck': 'OC', 'pf': 'OC', 'nc': 'OC', 'nu': 'OC', 'nf': 'OC', 'pn': 'OC', 'tk': 'OC',
        'wf': 'OC',

        // Antarctica (territory)
        'aq': 'AN', 'bv': 'AN', 'hm': 'AN', 'tf': 'AN'
      };

      const continentCode = countryToContinent[data.address.country_code.toLowerCase()];
      continent = continentMap[continentCode] || 'Unknown';
    }

    return {
      continent: continent,
      country: data.address?.country || '',
      city: data.address?.city || data.address?.town || data.address?.village || '',
      latitude: lat,
      longitude: lng
    };
  } catch (error) {
    console.error('Error fetching location details:', error);
    return {
      continent: '',
      country: '',
      city: '',
      latitude: lat,
      longitude: lng
    };
  }
}
