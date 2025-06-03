# Welcome to CareMap_ML
This project aims to identify, analyze, and reduce disparities in healthcare access across rural regions of Canada by building an interactive, intelligent dashboard integrated with a smart chatbot. The tool will serve both the public and health policy stakeholders by helping visualize service gaps and enabling query-based exploration.

## Features

- Interactive Dashboard to explore healthcare service availability by location near Kitchener-Waterloo-Cambridge
- Chatbot Assistant for guided navigation and query handling
- ML/AI Models for demand forecasting and gap identification
- Geo-based insights using CSV datasets on health facilities

## Usage Example
 
 - View Dashboard: Explore facility availability by city or region.

 - Ask Chatbot: "Show me areas with low facility density."

Interpret Results: Use heatmaps, charts, and chatbot suggestions to make informed decisions

## 🛠️ Tech Stack

- **Language:** Python 13.11.3
- **Libraries:** Streamlit, Pandas, Plotly, Scikit-learn
- **Data Sources:** Open datasets on Ontario health facilities

---

## Installation

```bash
# Clone the repo
git clone https://github.com/DMadathilS/CareMap_ML.git
cd caremap

# Set up a virtual environment (optional)
python -m venv venv
source venv/bin/activate  # or .\venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Run the application
python main.py

