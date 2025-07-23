import streamlit as st
import pandas as pd
import json
import altair as alt

# Set log file path
LOG_PATH = "./caremap_logs/scraper.log"  # adjust if needed

# Read log file
with open(LOG_PATH, 'r', encoding='utf-8') as f:
    logs = [json.loads(line.strip()) for line in f if line.strip()]

# Convert to DataFrame
df = pd.DataFrame(logs)
df['timestamp'] = pd.to_datetime(df['timestamp'])

# Streamlit Title
st.title("📊 CareMap Log Dashboard")

# ─────────────────────────────────────────────
# Graph 1: Total Logs per Hospital
st.subheader("🔹 Log Counts per Hospital & lab")
entity_counts = df['entity'].value_counts().reset_index()
entity_counts.columns = ['Hospital', 'Log Count']

bar = alt.Chart(entity_counts).mark_bar().encode(
    x=alt.X("Hospital", sort='-y'),
    y="Log Count",
    tooltip=["Hospital", "Log Count"]
)
st.altair_chart(bar, use_container_width=True)

# ─────────────────────────────────────────────
# Graph 2: Time Series Activity per Hospital
st.subheader("🔹 Activity Over Time (30-minute bins)")
df['time_bin'] = df['timestamp'].dt.floor('30min')
time_counts = df.groupby(['time_bin', 'entity']).size().reset_index(name='count')

line = alt.Chart(time_counts).mark_line(point=True).encode(
    x='time_bin:T',
    y='count:Q',
    color='entity:N',
    tooltip=['time_bin:T', 'entity:N', 'count:Q']
).interactive()

st.altair_chart(line, use_container_width=True)

# ─────────────────────────────────────────────
# Graph 3: Category Distribution
st.subheader("🔹 Event Type Breakdown")
category_counts = df['category'].value_counts().reset_index()
category_counts.columns = ['Category', 'Count']

pie = alt.Chart(category_counts).mark_arc(innerRadius=30).encode(
    theta="Count:Q",
    color="Category:N",
    tooltip=["Category", "Count"]
)
st.altair_chart(pie, use_container_width=True)

# ─────────────────────────────────────────────
# Show recent log table
st.subheader("📝 Recent Log Entries")
st.dataframe(df[['timestamp', 'entity', 'category', 'message']].sort_values(by='timestamp', ascending=False).head(20))
