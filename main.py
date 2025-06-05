import streamlit as st
from app.chatbot import launch_chatbot
from app.dashboard import launch_dashboard

st.set_page_config(page_title="CareMap", layout="wide")
st.title("CareMap: Healthcare Access Disparity Dashboard")

tabs = st.tabs(["📊 Dashboard", "🤖 Chatbot"])

with tabs[0]:
    launch_dashboard()

with tabs[1]:
    launch_chatbot()
