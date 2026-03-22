import streamlit as st

# Read your HTML file
with open("index.html", "r") as f:
    html_data = f.read()

# Display it
st.components.v1.html(html_data, height=800, scrolling=True)
