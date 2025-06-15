import json
from chatbot.models import AssistantOutput
from chatbot.config import EMBEDDER, REALTIME_PATH, tool_llm
from chatbot.prompts import router_prompt, suggest_prompt, summary_prompt
from langchain.chains import LLMChain
from chatbot.tools.clinics import fetch_hospital_clinic
from chatbot.tools.providers import fetch_providers
from chatbot.tools.labs import fetch_labs
import os


router_chain = LLMChain(llm=tool_llm, prompt=router_prompt)
suggest_chain = LLMChain(llm=tool_llm, prompt=suggest_prompt)
summary_chain = LLMChain(llm=tool_llm, prompt=summary_prompt)

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
    }
}

class QueryBasedRouter:
    def __init__(self):
        self.router = router_chain
        self.suggester = suggest_chain
        self.summarizer = summary_chain

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
        return raw if raw in tools else "irrelevant"

    def retrieve(self, domain: str, query: str):
        if domain == "real_time_wait":
            return tools[domain]["func"](query)
        emb = EMBEDDER.encode(query).tolist()
        return tools[domain]["func"](emb)

    def run(self, query: str) -> dict:
        domain = self.route(query)

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
                item_for_llm = {k: v for k, v in item.items() if k != "opening_hours"}
                suggested_raw = self.suggester.predict(
                    query=query,
                    item_json=json.dumps(item_for_llm)
                ).strip().lower()
                suggested = "true" in suggested_raw
                item["suggested"] = suggested
                item["llm_notes"] = f"Suggested = {suggested_raw}"
            except Exception as e:
                item["suggested"] = False
                item["llm_notes"] = f"LLM suggestion failed: {str(e)}"

            item["relevance_score"] = round(1 - item.get("distance", 1), 3) if "distance" in item else None
            enriched.append(item)

        top_suggestions = sorted(
            [i for i in enriched if i["suggested"]],
            key=lambda x: x.get("relevance_score", 0),
            reverse=True
        )[:3]

        summary_json = self.summarizer.predict(query=query, results_json=json.dumps(top_suggestions))
        try:
            summary = json.loads(summary_json).get("answer", summary_json.strip())
        except json.JSONDecodeError:
            summary = summary_json.strip()

        return AssistantOutput(domain=domain, data=enriched, answer=summary).model_dump()

