from langchain.prompts import PromptTemplate

router_prompt = PromptTemplate(
    input_variables=["query", "clinics_desc", "providers_desc", "labs_desc", "rt_desc"],
    template=(
        "You are a domain router for a healthcare assistant chatbot.\n"
        "Your task is to decide which domain the user's message belongs to.\n\n"
        "Valid domains:\n"
        "- clinics: {clinics_desc}\n"
        "- providers: {providers_desc}\n"
        "- labs: {labs_desc}\n"
        "- real_time_wait: {rt_desc}\n"
        "- greeting: For messages like 'hi', 'hello', 'good morning', 'hey there', etc.\n\n"
        "Instructions:\n"
        "1. If the query is just a greeting, respond exactly: 'greeting'\n"
        "2. If the query is unrelated to healthcare and not a greeting, respond exactly: 'irrelevant'\n"
        "3. Otherwise, respond with one key: clinics, providers, labs, real_time_wait\n"
        "No extra words.\n\n"
        "Query: {query}\n"
        "Answer:"
    )
)

suggest_prompt = PromptTemplate(
    input_variables=["query", "item_json"],
    template=(
        "You are deciding whether the following healthcare facility should be suggested based on the request and its proximity.\n\n"
        "User Request:\n{query}\n\n"
        "Facility Information (JSON):\n{item_json}\n\n"
        "Instructions:\n"
        "- If the facility clearly matches the request (e.g., a walk-in clinic when asked for one), it may be suggested.\n"
        "- If 'distance_km' is provided and under 20, that strengthens the recommendation.\n"
        "- If 'distance_km' is missing or null, do NOT mention distance — instead, highlight other useful aspects such as languages spoken, specialty, or type of care.\n"
        "- If the facility is not a good match (wrong type, too far, or no relevant features), mark 'suggested' as false and leave 'notes' blank.\n\n"
        "**IMPORTANT**: Your response MUST be valid JSON only. No extra text.\n"
        "Respond only in this format:\n"
        "{{\n"
        "  \"suggested\": true or false,\n"
        "  \"notes\": \"Short explanation if suggested, otherwise leave empty.\"\n"
        "}}"
    )
)

# summary_prompt = PromptTemplate(
#     input_variables=["query", "results_json"],
#     template=(
#         "You are a helpful healthcare assistant.\n"
#         "User question: {query}\n\n"
#         "Here are JSON search results for nearby clinics or providers:\n"
#         "{results_json}\n\n"
#         "Instructions:\n"
#         "- Provide a concise, 1–2 sentence answer.\n"
#         "- Mention facility names, their relevance, and how far they are from the user (use the 'distance_text' field).\n"
#         "- Focus on top suggestions (usually 1–3 items).\n"
#         "- Use natural, user-friendly wording.\n"
#         "- Do NOT output any raw JSON or keys like 'distance_text'.\n\n"
#         "Answer:"
#     )
# )

summary_prompt = PromptTemplate(
    input_variables=["query", "results_json"],
    template=(
        "You are a helpful healthcare assistant.\n"
        "Your task is to summarize results that match the user's request.\n\n"
        "User query: {query}\n\n"
        "Here are search results in JSON format (including names, descriptions, distances, languages, and relevance):\n"
        "{results_json}\n\n"
        "Instructions:\n"
        "- Provide a concise 1–2 sentence response.\n"
        "- Mention clinic or hospital names that clearly match the query (e.g. walk-in, pediatric, emergency).\n"
        "- If a location is under 20 km, include the distance to emphasize proximity.\n"
        "- If the user asked about hospitals or emergencies, prioritize hospitals.\n"
        "- Do NOT mention distance if it’s missing or irrelevant.\n"
        "- Do NOT output any field names like 'distance_text' or 'llm_notes'.\n"
        "- Respond in a friendly, helpful tone without repeating the original query.\n\n"
        "Answer:"
    )
)


greeting_prompt = PromptTemplate(
    input_variables=["query"],
    template=(
        "The user said: '{query}'.\n"
        "Respond with a short, friendly, healthcare-related greeting.\n"
        "Do NOT ask questions, suggest actions, or mention what they might be looking for.\n"
        "Keep it concise, welcoming, and aligned with a medical or care assistant tone."
    )
)

