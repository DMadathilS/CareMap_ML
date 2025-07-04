import json
from chatbot.models import AssistantOutput
from chatbot.config import EMBEDDER, tool_llm
from chatbot.prompts import router_prompt, suggest_prompt, summary_prompt,greeting_prompt,realtime_summary_prompt
from langchain.chains import LLMChain
from chatbot.tools.clinics import fetch_hospital_clinic
from chatbot.tools.providers import fetch_providers
from chatbot.tools.labs import fetch_labs
import os
from chatbot.utils.location import haversine_distance
from chatbot.utils.text_json import extract_json_from_text
import traceback
from decimal import Decimal

REALTIME_PATH = r"H:\Ai-ml\sem-2\Projects in Machine Learning\Project\CareMap_ML\data-collection\Real-time\latest.json"


router_chain = LLMChain(llm=tool_llm, prompt=router_prompt)
suggest_chain = LLMChain(llm=tool_llm, prompt=suggest_prompt,    output_key="text")
summary_chain = LLMChain(llm=tool_llm, prompt=summary_prompt)
greeting_chain = LLMChain(llm=tool_llm, prompt=greeting_prompt)
RT_Data_chain=LLMChain(llm=tool_llm, prompt=realtime_summary_prompt)
tools = {
    "clinics": {
        "description": "Use this tool when the user asks for general hospitals, emergency rooms, or walk-in/urgent-care centers. It provides facility-level data, not individual doctors or specialists.",
        "func": fetch_hospital_clinic
    },
    "providers": {
        "description": "Use this tool when the user asks for a specific type of healthcare provider, such as dentists, physiotherapists, or family doctors. It returns provider-specific clinic data.",
        "func": fetch_providers
    },
    "labs": {
        "description": "Use this tool when the user is looking for lab testing locations, such as blood test centers or diagnostic labs.",
        "func": fetch_labs
    },
    "real_time_wait": {
        "description": "Use this tool if the user asks about current wait times at hospitals or urgent-care facilities. It returns real-time emergency wait info.",
        "func": lambda _: json.load(open(REALTIME_PATH)) if os.path.exists(REALTIME_PATH) else []
    },
    "greeting": {
        "description": "Use this tool for non-medical queries like greetings ('hi', 'hello', etc.) or friendly small talk that doesn't require any healthcare data.",
        "func": lambda _: []
    }
}
def combined_score(item, alpha=0.7):
    """
    Compute a weighted score:
    - alpha: relevance weight (0–1)
    - (1 - alpha): proximity weight
    """
    relevance = item.get("relevance_score")
    if relevance is None:
        relevance = 0.0

    distance = item.get("distance_km")
    if distance is None or distance < 0:
        distance = float("inf")  # Treat missing/invalid as far away

    # Normalize distance: closer = higher score
    distance_score = 1 / (1 + distance)  # e.g. 0km → 1.0, 10km → 0.09

    return alpha * relevance + (1 - alpha) * distance_score
def clean_decimals(obj):
    if isinstance(obj, dict):
        return {k: clean_decimals(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_decimals(i) for i in obj]
    elif isinstance(obj, Decimal):
        return float(obj)
    return obj
class QueryBasedRouter:
    def __init__(self):
        self.router = router_chain
        self.suggester = suggest_chain
        self.summarizer = summary_chain
        self.greeter = greeting_chain
        self.RT_data_summarizer = RT_Data_chain

    def route(self, query: str) -> str:
        descs = {k: tools[k]["description"] for k in tools}
        params = {
            "query": query,
            "clinics_desc": descs["clinics"],
            "providers_desc": descs["providers"],
            "labs_desc": descs["labs"],
            "rt_desc": descs["real_time_wait"]
        }
        raw = self.router.predict(**params).strip().lower()
        print(raw)
        return raw if raw in tools else "irrelevant"

    def retrieve(self, domain: str, query: str, user_lat=None, user_lon=None):
        if domain == "real_time_wait":
            return tools[domain]["func"](query)

        # Get embedding from query
        emb = EMBEDDER.encode(query).tolist()

        # Fetch from correct domain function
        fetch_fn = tools.get(domain, {}).get("func")
        if not fetch_fn:
            return []

        results = fetch_fn(emb)

        # Optional: Add distance calculations if coordinates are available
        if user_lat is not None and user_lon is not None:
            for r in results:
                lat = r.get("latitude")
                lon = r.get("longitude")
                if lat is not None and lon is not None:
                    dist = haversine_distance(user_lat, user_lon, lat, lon)
                    r["distance_km"] = round(dist, 2)
                    r["distance_text"] = f"{round(dist, 2)} km"
                else:
                    r["distance_km"] = None
                    r["distance_text"] = None

            # Sort by distance if available
            results.sort(key=lambda x: x.get("distance_km") or float('inf'))

        return results

       
    # def run(self, query: str,user_lat=None, user_lon=None) -> dict:
    #     domain = self.route(query)
    #     if domain == "greeting":
    #                 greeting = self.greeter.predict(query=query).strip()
    #                 return AssistantOutput(
    #                     domain="greeting",
    #                     data=[],
    #                     answer=greeting
    #                 ).model_dump()
        
    #     if domain == "irrelevant":
    #         return AssistantOutput(domain=None, data=[], answer="Your query appears unrelated to healthcare.").model_dump()

        

    #     data = self.retrieve(domain, query, user_lat=user_lat, user_lon=user_lon)


    #     # if domain == "real_time_wait":
    #     #     try:
    #     #         query_with_data = f"{query} | data: {json.dumps(data)}"

    #     #         summary_json = self.summarizer.predict(
    #     #             query=query_with_data,
    #     #             results_json=json.dumps(data)
    #     #         )
    #     #         summary = json.loads(summary_json).get("answer", summary_json.strip())
    #     #     except Exception as e:
    #     #         summary = f"Unable to summarize real-time data: {e}"
    #     #     return json.dumps({
    #     #         "domain": domain,
    #     #         "data": data,
    #     #         "answer": summary_json
    #     #     })

    #     if domain == "real_time_wait":
    #         try:
    #             summary_json = self.RT_data_summarizer.predict(
    #                 query=query,
    #                 results_json=json.dumps(data)
    #             )
    #             print(summary_json)
    #             summary = json.loads(summary_json).get("answer", summary_json.strip())
    #         except Exception as e:
    #             summary = f"Unable to summarize real-time data: {e}"

    #         # return json.dumps({
    #         #     "domain": domain,
    #         #     "data": [],
    #         #     "answer": summary_json
    #         # })
    #         return AssistantOutput(domain=domain, data=[], answer=summary_json).model_dump()


    #     enriched = []
    #     for item in data:
    #         try:
    #             item_for_llm = {k: v for k, v in item.items() if k != "opening_hours"}
    #             suggested_raw = self.suggester.predict(
    #                 query=query,
    #                 item_json=json.dumps(item_for_llm)
    #             ).strip().lower()
    #             suggested = "true" in suggested_raw
    #             item["suggested"] = suggested
    #             item["llm_notes"] = f"{suggested_raw}"
    #             item["distance_km"] = item.get("distance_km")
    #             item["distance_text"] = item.get("distance_text")

    #         except Exception as e:
    #             item["suggested"] = False
    #             item["llm_notes"] = f"LLM suggestion failed: {str(e)}"

    #         item["relevance_score"] = round(1 - item.get("distance", 1), 3) if "distance" in item else None
    #         enriched.append(item)

    #     top_suggestions = sorted(
    #         [i for i in enriched if i["suggested"]],
    #         key=lambda x: x.get("relevance_score", 0),
    #         reverse=True
    #     )[:3]

    #     summary_json = self.summarizer.predict(query=query, results_json=json.dumps(top_suggestions))
    #     try:
    #         summary = json.loads(summary_json).get("answer", summary_json.strip())
    #     except json.JSONDecodeError:
    #         summary = summary_json.strip()

    #     return AssistantOutput(domain=domain, data=enriched, answer=summary).model_dump()
    def run(self, query: str, user_lat=None, user_lon=None) -> dict:
        domain = self.route(query)

        if domain == "greeting":
            greeting = self.greeter.predict(query=query).strip()
            return AssistantOutput(domain="greeting", data=[], answer=greeting).model_dump()

        if domain == "irrelevant":
            return AssistantOutput(domain=None, data=[], answer="Your query appears unrelated to healthcare.").model_dump()

        # ── Handle real_time_wait separately ──────────────────────────────
        if domain == "real_time_wait":
            try:
                data = tools[domain]["func"](query)
                flat_data = [{"source": k, **v} for k, v in data.items()] if isinstance(data, dict) else []

                summary_json = self.RT_data_summarizer.predict(
                    query=query,
                    results_json=json.dumps(flat_data)
                )

                try:
                    summary = json.loads(summary_json).get("answer", summary_json.strip())
                except json.JSONDecodeError:
                    summary = summary_json.strip()

                return AssistantOutput(domain=domain, data=[], answer=summary).model_dump()

            except Exception as e:
                import traceback
                traceback.print_exc()
                return {
                    "domain": domain,
                    "data": [],
                    "answer": f"Unable to summarize real-time data: {e}"
                }

        # ── Retrieve vector-based results ─────────────────────────────────
        try:
            data = self.retrieve(domain, query, user_lat=user_lat, user_lon=user_lon)
            print(data)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return {"error": f"Failed to retrieve data: {str(e)}"}

        enriched = []

        for item in data:
            try:
                item_for_llm = {
                    k: v for k, v in item.items()
                    if k not in ("llm_notes", "opening_hours", "hours_of_operation")
                }
                item_for_llm["distance_km"] = item.get("distance_km")
                item_json = json.dumps(clean_decimals(item_for_llm))

                suggest_response = self.suggester.predict(query=query, item_json=item_json)
                parsed = extract_json_from_text(suggest_response)
                item["suggested"] = parsed.get("suggested", False)
                item["llm_notes"] = parsed.get("notes", "")
            except Exception as e:
                import traceback
                traceback.print_exc()
                item["suggested"] = False
                item["llm_notes"] = f"LLM suggestion failed: {str(e)}"

            item["relevance_score"] = round(1 - item.get("distance", 1), 3)
            enriched.append(item)

        # ── Top 3 suggestions ──────────────────────────────────────────────
        top_suggestions = sorted(
            [i for i in enriched if i["suggested"]],
            key=lambda x: combined_score(x, alpha=0.7),
            reverse=True
        )[:3]

        # ── Build summary input by domain ─────────────────────────────────
        if domain == "labs":
            summary_input = [
                {
                    "name": i["name"],
                    "address": i["address"],
                    "distance_text": i.get("distance_text", ""),
                    "relevance_score": i.get("relevance_score", 0),
                    "contact_info": i.get("contact_info", ""),
                    "wait_time_minutes": i.get("wait_time_minutes"),
                    "next_available_appointment": i.get("next_available_appointment"),
                    "desc": i.get("desc", "")
                }
                for i in top_suggestions
            ]

        elif domain == "providers":
            summary_input = [
                {
                    "name": i["name"],
                    "address": i["address"],
                    "distance_text": i.get("distance_text", ""),
                    "relevance_score": i.get("relevance_score", 0),
                    "contact_info": i.get("contact_info", ""),
                    "desc": i.get("desc", "")
                }
                for i in top_suggestions
            ]

        else:  # clinics
            summary_input = [
                {
                    "name": i["name"],
                    "address": i["address"],
                    "distance_text": i.get("distance_text", ""),
                    "relevance_score": i.get("relevance_score", 0),
                    "contact_info": i.get("contact_info", "")
                }
                for i in top_suggestions
            ]

# summary_input = [
#                  {
#                     "name": i.get("service_name") or i.get("name", ""),
#                     "category": ", ".join(i.get("category", [])) if isinstance(i.get("category"), list) else i.get("category", ""),
#                     "address": i.get("address", ""),
#                     "city": i.get("city", ""),
#                     "postal_code": i.get("postal_code", ""),
#                     "distance_text": i.get("distance_text", ""),
#                     "relevance_score": i.get("relevance_score", 0),
#                     "contact_info": i.get("contact_info", ""),
#                     "phone": i.get("phone", ""),
#                     "languages": i.get("languages", ""),
#                     "referral_method": i.get("referral_method", ""),
#                     "accessibility": i.get("accessibility", ""),
#                     "description": i.get("description", "")
#                 }   
#                 for i in top_suggestions
#             ]
        # ── Predict Summary ────────────────────────────────────────────────
        try:
            summary_json = self.summarizer.predict(query=query, results_json=json.dumps(summary_input))
            summary = json.loads(summary_json).get("answer", summary_json.strip())
        except json.JSONDecodeError:
            summary = summary_json.strip()

        return AssistantOutput(domain=domain, data=enriched, answer=summary).model_dump()
