import { HospitalStats, Clinic } from '../types';

export const hospitalStats: HospitalStats = {
  emergencyWaitTime: 45,
  patientCount: 127,
  bedsAvailable: 23,
  lastUpdated: new Date().toLocaleTimeString(),
};

export const mockClinics: Clinic[] = [
  {
    "location_ID": 23,
    "name": "University of Waterloo - Student Medical Clinic",
    "location": {
      "latitude": 43.470566,
      "longitude": -80.54617
    },
    "address": "Health Services Building, 200 University Ave W, Waterloo, ON, N2L 3G1",
    "contact_information": {
      "phone": ["519-888-4096", "519-888-4911 or ext 84911"],
      "phone_toll_free": [1-866-925-5454],
      "email": ["hsforms@uwaterloo.ca"],
      "url": "https://uwaterloo.ca/campus-wellness/health-services/student-medical-clinic"
    },
    "wheelchair_accessible": true,
    "languages": ["English"],
    "suggested": true,
    "bot": "Recommending a student-friendly clinic near Waterloo University."
  },
  {
    "location_ID": 249,
    "name": "Extendicare - Stirling Heights Long Term Care",
    "location": {
      "latitude": 43.338849,
      "longitude": -80.332435
    },
    "address": "200 Stirling MacGregor Dr, Cambridge, ON, N1S 5B7",
    "contact_information": {
      "phone": ["519-622-3434"],
      "fax": ["519-622-0403"],
      "email": ["cnh_stirlingheights@extendicare.com"],
      "url": "https://www.extendicarestirlingheights.com/"
    },
    "wheelchair_accessible": true,
    "languages": ["English"],
    "suggested": false,
    "bot": ""
  },
  {
    "location_ID": 415,
    "name": "Waterloo (City of) - Community Services",
    "location": {
      "latitude": 43.4634,
      "longitude": -80.5203
    },
    "address": "100 Regina St S, PO Box 337, Stn Waterloo, Waterloo, ON, N2J 4A8",
    "contact_information": {
      "phone": ["519-579-6930", "1-866-786-3941"],
      "url": "https://www.waterloo.ca/en/living/senior-services.aspx#Rides"
    },
    "wheelchair_accessible": true,
    "languages": ["English"],
    "suggested": false,
    "bot": ""
  },
  {
    "location_ID": 9,
    "name": "Golden Years Long Term Care",
    "location": {
      "latitude": 43.403768,
      "longitude": -80.35356
    },
    "address": "704 Eagle St N, Cambridge, ON, N3H 4T3",
    "contact_information": {
      "phone": ["519-653-5493"],
      "fax": ["519-219-5494"],
      "email": ["info-goldenyears@peoplecare.ca"],
      "url": "https://www.peoplecare.ca/long-term-care/golden-years/"
    },
    "wheelchair_accessible": true,
    "languages": ["English", "Portuguese"],
    "suggested": false,
    "bot": ""
  },
  {
    "location_ID": 1,
    "name": "St Joseph's Health Centre Guelph",
    "location": {
      "latitude": 43.55146,
      "longitude": -80.271685
    },
    "address": "100 Westmount Rd, Guelph, ON, N1H 5H8",
    "contact_information": {
      "phone": ["519-824-6000"],
      "fax": ["519-763-0264"],
      "email": ["info@sjhcg.ca"],
      "url": "https://www.sjhcg.ca/"
    },
    "wheelchair_accessible": true,
    "languages": ["English"],
    "suggested": false,
    "bot": ""
  }
];