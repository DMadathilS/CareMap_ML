import streamlit as st
import pandas as pd
import folium
from streamlit_folium import st_folium

def run_dashboard():
    df = pd.read_csv("data/facilities.csv")

    st.sidebar.header("Filter Facilities")
    region = st.sidebar.selectbox("Region", df["city"].unique())
    facility_type = st.sidebar.selectbox("Facility Type", df["type"].unique())
    emergency = st.sidebar.radio("Emergency Level", ["Low", "Medium", "High"])

    filtered_df = df[
        (df["city"] == region) &
        (df["type"] == facility_type) &
        (df["emergency_level"] == emergency)
    ]

    m = folium.Map(location=[50, -95], zoom_start=4)
    for _, row in filtered_df.iterrows():
        folium.Marker([row["lat"], row["lon"]], tooltip=row["name"]).add_to(m)

    st_data = st_folium(m, width=700)
    st.write(filtered_df[["name", "type", "subtype", "emergency_level", "accepting_patients"]])
