export interface HospitalStats {
  emergencyWaitTime: number;
  patientCount: number;
  bedsAvailable: number;
  lastUpdated: string;
}

export interface Clinic {
  location_ID: number;
  name: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  contact_information: {
    phone: string[];
    email?: string[];
    url?: string;
    fax?: string[];
  };
  wheelchair_accessible: boolean;
  languages: string[];
  suggested: boolean;
  bot: string;
  distance: number;
  relevance_score: number;
  wait_time_minutes?: number;
  next_available_appointment?: string;
  hours_of_operation?: {
    day_of_week: number;
    open_time: string | null;
    close_time: string | null;
    closed: boolean;
  }[];
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