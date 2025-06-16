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
    template="Should the following item be suggested for: {query}?\n{item_json}\nRespond with true or false."
)
summary_prompt = PromptTemplate(
    input_variables=["query", "results_json"],
    template=(
        "You are a helpful healthcare assistant.\n"
        "User question: {query}\n"
        "Here are JSON search results: {results_json}\n"
        "Provide a clean, 1-2 sentence natural-language answer.\n"
        "Do NOT wrap it in JSON or add field names."
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

