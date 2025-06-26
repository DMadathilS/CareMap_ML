export interface HospitalStats {
  emergencyWaitTime: number;
  patientCount: number;
  bedsAvailable: number;
  lastUpdated: string;
}

export interface Clinic {
  location_ID: number;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  address: string;
  contact_information: {
    phone: string[];
    phone_toll_free?: string[];  // ✅ Fix: expect string[]
    email?: string[];
    url?: string;
    fax?: string[];
  };
  wheelchair_accessible: boolean;
  languages: string[];
  suggested: boolean;
  bot: string;
  distance?: number;
  relevance_score?: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  clinics?: Clinic[];
}

export interface CategoryStat {
  category: string;
  count: number;
}