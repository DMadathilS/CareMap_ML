import json
from chatbot.models import AssistantOutput
from chatbot.config import EMBEDDER, REALTIME_PATH, tool_llm
from chatbot.prompts import router_prompt, suggest_prompt, summary_prompt,greeting_prompt
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
suggest_chain = LLMChain(llm=tool_llm, prompt=suggest_prompt)
summary_chain = LLMChain(llm=tool_llm, prompt=summary_prompt)
greeting_chain = LLMChain(llm=tool_llm, prompt=greeting_prompt)

tools = {
    "clinics": {
        "description": "General hospitals, urgent-care centers, and walk-in clinics.",
        "func": fetch_hospital_clinic
    },
    "providers": {
        "description": "Individual healthcare providers: doctors, dentists, physiotherapists, etc.",
        "func": fetch_providers
    },
    "labs": {
        "description": "Laboratories for diagnostic testing and sample collection.",
        "func": fetch_labs
    },
    "real_time_wait": {
        "description": "Live emergency and urgent-care wait times.",
        "func": lambda _: json.load(open(REALTIME_PATH)) if os.path.exists(REALTIME_PATH) else []
    },
    "greeting": {
        "description": "General greetings like 'hello', 'hi', 'good afternoon', etc.",
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

    def retrieve(self, domain: str, query: str):
        if domain == "real_time_wait":
            return tools[domain]["func"](query)
        emb = EMBEDDER.encode(query).tolist()
        return tools[domain]["func"](emb)

    def run(self, query: str) -> dict:
        domain = self.route(query)
        if domain == "greeting":
                    greeting = self.greeter.predict(query=query).strip()
                    return AssistantOutput(
                        domain="greeting",
                        data=[],
                        answer=greeting
                    ).model_dump()
        
        if domain == "irrelevant":
            return AssistantOutput(domain=None, data=[], answer="Your query appears unrelated to healthcare.").model_dump()

        

        data = self.retrieve(domain, query)

        if domain == "real_time_wait":
            return json.dumps({
                "domain": domain,
                "data": data,
                "answer": "Here is the current real-time emergency wait time information."
            })

        enriched = []
        for item in data:
            try:
                item_for_llm = {
                    k: v for k, v in item.items()
                    if k not in ("opening_hours", "llm_notes")
                }
                for k, v in item_for_llm.items():
                    print(f"{k}: {v} (type: {type(v)})")

                item_for_llm["distance_km"] = item.get("distance_km")
                print("Calling LLM for suggestion on:", item["name"])
                item_json = json.dumps(clean_decimals(item_for_llm))


                suggest_response = self.suggester.predict(
                    query=query,
                    item_json=item_json
                )

                print("LLM raw:", suggest_response)  # for debug

                parsed = extract_json_from_text(suggest_response)
                item["suggested"] = parsed.get("suggested", False)
                item["llm_notes"] = parsed.get("notes", "")

            except Exception as e:
                item["suggested"] = False
                item["llm_notes"] = f"LLM suggestion failed: {str(e)}"

            item["relevance_score"] = round(1 - item.get("distance", 1), 3) if "distance" in item and item.get("distance") is not None else 0.0
            item["distance_km"] = item.get("distance_km")
            item["distance_text"] = item.get("distance_text")
            enriched.append(item)
            print(enriched)
        
        # Sort top 3 suggestions by relevance_score
        top_suggestions = sorted(
            [i for i in enriched if i["suggested"]],
            key=lambda x: x.get("relevance_score", 0),
            reverse=True
        )[:3]


        # Prepare input for summarizer
        summary_input = [
            {
                "name": i["name"],
                "address": i["address"],
                "distance_text": i.get("distance_text", ""),
                "relevance_score": i.get("relevance_score", 0),
                "contact_info": i.get("contact_info", ""),
                "languages": i.get("languages", [])

            }
            for i in top_suggestions
        ]
        print("summary_input--->",summary_input)
        # Predict final answer summary
        summary_json = self.summarizer.predict(query=query, results_json=json.dumps(summary_input))
        try:
            summary = json.loads(summary_json).get("answer", summary_json.strip())
        except json.JSONDecodeError:
            summary = summary_json.strip()

        return AssistantOutput(domain=domain, data=enriched, answer=summary).model_dump()

