import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, MessageCircle, X, ArrowUpRight } from "lucide-react";
import { ChatMessage as ChatMessageType } from "../types";
import { ChatMessage } from "./ChatMessage";
import { TextAnimate } from "./magicui/text-animate";
import { Marquee } from "./magicui/marquee";
import { cn } from "../lib/utils";

interface ChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
  setClinicData: (clinics: Clinic[]) => void;
  setUserLocationForResult: (loc: { lat: number; lng: number }) => void;

}

interface ApiClinic {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  contact_info: string;
  languages: string[];
  distance: number;
  suggested: boolean;
  desc: string | null;
  llm_notes: string;
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

interface Clinic {
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

const fetchIPLocation = async () => {
  try {
    const res = await fetch("https://geolocation-db.com/json/");
    const data = await res.json();
    return {
      city: data.city,
      country: data.country_name,
      lat: parseFloat(data.latitude),
      lng: parseFloat(data.longitude),
    };
  } catch (err) {
    console.error("❌ IP location fetch failed:", err);
    return null;
  }
};

const convertApiClinicToClinic = (apiClinic: ApiClinic): Clinic => {
  const contactParts = apiClinic.contact_info.split(", ");
  const phones: string[] = [];
  const emails: string[] = [];
  const faxes: string[] = [];
  let url = "";

  for (const part of contactParts) {
    if (part.startsWith("phone: "))
      phones.push(part.replace("phone: ", "").trim());
    else if (part.startsWith("email: "))
      emails.push(part.replace("email: ", "").trim());
    else if (part.startsWith("fax: "))
      faxes.push(part.replace("fax: ", "").trim());
    else if (part.startsWith("url: ")) {
      url = part.replace("url: ", "").trim();
      if (!url.startsWith("http")) url = "https://" + url;
    }
  }

  return {
    location_ID: apiClinic.id,
    name: apiClinic.name,
    location: {
      latitude: apiClinic.latitude,
      longitude: apiClinic.longitude,
    },
    address: apiClinic.address,
    contact_information: {
      phone: phones,
      email: emails.length > 0 ? emails : undefined,
      url: url || undefined,
      fax: faxes.length > 0 ? faxes : undefined,
    },
    wheelchair_accessible: true,
    languages: apiClinic.languages,
    suggested: apiClinic.suggested,
    bot: apiClinic.llm_notes || "",
    distance: apiClinic.distance,
    relevance_score: apiClinic.relevance_score,
    wait_time_minutes: apiClinic.wait_time_minutes,
    next_available_appointment: apiClinic.next_available_appointment,
    hours_of_operation: apiClinic.hours_of_operation,
  };
};


export const Chatbot: React.FC<ChatbotProps> = ({
  isOpen,
  onToggle,
  setClinicData,
  setUserLocationForResult, // ✅ ADD THIS

}) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [minimized, setMinimized] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const animatedPrompts = [
    "Find me a walk-in clinic near me",
    "Current emergency wait time at Grand River Hospital",
    "Find me a dentist close to my home",
    "Show labs open on Saturday near Waterloo",
    "Search clinics that speak Punjabi in Kitchener",
    "What clinics are open now in Cambridge?",
    "Where can I get a blood test today?",
    "Book the next available lab appointment near me",
    "Find urgent care centers with short wait times",
    "What clinics are wheelchair accessible nearby?",
    "Show physiotherapists open this week",
    "Locate optometrists accepting new patients in Waterloo",
    "When is the next available appointment for bloodwork?",
    "Which clinics support mental health consultations?",
    "Find COVID-19 testing labs in Kitchener",
  ];
  const animatedQuestions = [
    "Find me a walk-in clinic near me",
    "Current emergency wait time at Grand River Hospital",
    "Find me a dentist close to my home",
    "Show labs open on Saturday near Waterloo",
    "Search clinics that speak Punjabi in Kitchener",
    "What clinics are open now in Cambridge?",
    "Where can I get a blood test today?",
    "Book the next available lab appointment near me",
    "Find urgent care centers with short wait times",
    "What clinics are wheelchair accessible nearby?",
    "Show physiotherapists open this week",
    "Locate optometrists accepting new patients in Waterloo",
    "When is the next available appointment for bloodwork?",
    "Which clinics support mental health consultations?",
    "Find COVID-19 testing labs in Kitchener",
  ];

 
  const [animatedIndex, setAnimatedIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedIndex((prev) => (prev + 1) % animatedPrompts.length);
    }, 4000); // change question every 4s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const getLocation = async () => {
      const location = await fetchIPLocation();
      if (location) {
        setUserLocation({ lat: location.lat, lng: location.lng });
        setUserLocationForResult(location)
        console.log("🌍 User city:", location.city);
      }
    };
    getLocation();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8000/CareMap/api/llm/query",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: currentInput,
            ...(userLocation && {
              user_lat: userLocation.lat,
              user_lon: userLocation.lng,
            }),
          }),
        }
      );

      if (!userLocation) {
        alert("Location access is disabled. Results may be less accurate.");
      }

      if (!response.ok) throw new Error(`❌ Server error: ${response.status}`);

      const apiResponse = await response.json();
      console.log("✅ Raw API response:", apiResponse);

      let answerText = "";
      try {
        if (
          typeof apiResponse.answer === "string" &&
          apiResponse.answer.trim().startsWith("{")
        ) {
          const parsed = JSON.parse(apiResponse.answer);
          answerText = parsed.note || JSON.stringify(parsed);
        } else {
          answerText = apiResponse.answer;
        }
      } catch {
        answerText = apiResponse.answer;
      }

      const botMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        content: answerText,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);

      if (Array.isArray(apiResponse.data) && apiResponse.data.length > 0) {
        const converted = apiResponse.data.map((item: ApiClinic) =>
          convertApiClinicToClinic(item)
        );
        setClinicData(converted);
      } else {
        setClinicData([]);
      }
    } catch (error) {
      console.error("❌ Fetch or conversion error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          content: "Sorry, there was an error fetching clinic info.",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, userLocation, setClinicData]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !isLoading) {
        handleSend();
      }
    },
    [isLoading, handleSend]
  );

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-xl z-[100]"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[360px] max-w-[90%] bg-white border border-gray-300 shadow-xl rounded-lg flex flex-col z-[100]">
      <div className="bg-blue-500 text-white px-4 py-3 flex rounded-t-lg justify-between items-center">
        <div className="flex items-center gap-3">
          <img
            src="https://i.ibb.co/wZyLX837/Chat-GPT-Image-Jun-20-2025-12-45-52-PM.png"
            alt="Bot"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h4 className="font-semibold">Healthcare Assistant</h4>
            <p className="text-xs text-blue-100">Online now</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setMinimized(!minimized)}>
            {minimized ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowUpRight className="w-4 h-4 rotate-45" />
            )}
          </button>
          <button onClick={onToggle}>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          <div className="flex-1 px-3 py-2 overflow-y-auto space-y-2 max-h-[370px] scrollbar-thin scrollbar-thumb-gray-300">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && <p className="text-sm text-gray-500">Searching...</p>}
            <div ref={messagesEndRef} />
          </div>
          

          <div className="border-t p-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-transparent text-black z-10 relative"
                  placeholder=""
                  disabled={isLoading}
                />

                {input === "" && (
                  <div
                    className="absolute top-2 left-3 text-sm text-gray-400 pointer-events-none"
                    onClick={() => setInput(animatedPrompts[animatedIndex])}
                  >
                    <TextAnimate
                      animation="blurInUp"
                      by="character"
                      once
                      key={animatedIndex}
                    >
                      {animatedPrompts[animatedIndex]}
                    </TextAnimate>
                  </div>
                )}
              </div>

              <button
                onClick={handleSend}
                disabled={isLoading}
                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
         
        </>
      )}
    </div>
  );
};
