import streamlit as st
import pandas as pd
import ezdxf
import math
import os
import tempfile
from io import BytesIO
from math import atan2, degrees, sqrt, cos, sin, tan, radians, pi

# Set page config
st.set_page_config(
    page_title="Bridge Design Generator",
    page_icon="🌉",
    layout="wide"
)

# Title and description
st.title("🌉 Bridge Design Generator")
st.markdown("""
Upload your bridge parameters in an Excel file to generate a DXF drawing.
The app will process the input and generate a bridge design based on the provided specifications.
""")

# File upload section
st.header("1. Upload Parameters")
uploaded_file = st.file_uploader("Upload Excel file with bridge parameters", type=["xlsx"])

# Default values for testing
DEFAULT_EXCEL_PATH = r"F:\LISP 2005\P1\input.xlsx"
use_default = st.checkbox("Use default example file")

# Initialize variables
variable_values = {}

# Process file if uploaded or using default
if uploaded_file is not None or use_default:
    try:
        if uploaded_file is not None:
            df = pd.read_excel(uploaded_file, header=None, sheet_name=None)
        else:
            if os.path.exists(DEFAULT_EXCEL_PATH):
                df = pd.read_excel(DEFAULT_EXCEL_PATH, header=None, sheet_name=None)
            else:
                st.error("Default file not found. Please upload a file.")
                st.stop()
        
        # Process Sheet1 for main parameters
        if 'Sheet1' in df:
            df_sheet1 = df['Sheet1'].copy()
            df_sheet1.columns = ['Value', 'Variable', 'Description']
            
            # Display parameters in an expandable section
            with st.expander("View/Edit Parameters"):
                edited_df = st.data_editor(
                    df_sheet1,
                    column_config={
                        "Value": st.column_config.NumberColumn("Value"),
                        "Variable": st.column_config.TextColumn("Variable"),
                        "Description": st.column_config.TextColumn("Description")
                    },
                    num_rows="dynamic",
                    use_container_width=True
                )
                
                if st.button("Update Parameters"):
                    df_sheet1 = edited_df
                    st.success("Parameters updated!")
            
            # Convert to variable dictionary
            variable_values = dict(zip(df_sheet1['Variable'], df_sheet1['Value']))
            
            # Display key parameters
            col1, col2, col3 = st.columns(3)
            with col1:
                st.metric("Number of Spans", variable_values.get('NSPAN', 'N/A'))
                st.metric("Span Length", f"{variable_values.get('SPAN1', 'N/A')} m")
            with col2:
                st.metric("Bridge Length", f"{variable_values.get('LBRIDGE', 'N/A')} m")
                st.metric("Skew Angle", f"{variable_values.get('SKEW', 'N/A')}°")
            with col3:
                st.metric("Road Top Level", f"{variable_values.get('RTL', 'N/A')} m")
                st.metric("Soffit Level", f"{variable_values.get('SOFL', 'N/A')} m")
            
            # Generate DXF button
            if st.button("🛠️ Generate DXF Drawing", type="primary"):
                with st.spinner("Generating DXF drawing..."):
                    try:
                        # Create a new DXF document
                        doc = ezdxf.new("R2010", setup=True)
                        msp = doc.modelspace()
                        
                        # Add drawing elements here (simplified example)
                        # This is where you would integrate the drawing logic from the original script
                        
                        # For now, just add a simple rectangle as a placeholder
                        msp.add_line((0, 0), (1000, 0))
                        msp.add_line((1000, 0), (1000, 500))
                        msp.add_line((1000, 500), (0, 500))
                        msp.add_line((0, 500), (0, 0))
                        
                        # Save DXF to a temporary file
                        with tempfile.NamedTemporaryFile(delete=False, suffix=".dxf") as tmp:
                            doc.saveas(tmp.name)
                            tmp_path = tmp.name
                        
                        # Create download button
                        with open(tmp_path, 'rb') as f:
                            st.download_button(
                                label="⬇️ Download DXF",
                                data=f,
                                file_name="bridge_design.dxf",
                                mime="application/dxf"
                            )
                        
                        # Clean up
                        os.unlink(tmp_path)
                        
                    except Exception as e:
                        st.error(f"Error generating DXF: {str(e)}")
        
        # Display cross-section data if available
        if 'Sheet2' in df and not df['Sheet2'].empty:
            with st.expander("View Cross-Section Data"):
                st.dataframe(df['Sheet2'], use_container_width=True)
    
    except Exception as e:
        st.error(f"Error processing file: {str(e)}")

# Add some instructions
with st.expander("ℹ️ How to use"):
    st.markdown("""
    1. **Prepare an Excel file** with two sheets:
       - **Sheet1**: Parameters with columns: Value, Variable, Description
       - **Sheet2**: Cross-section data with Chainage and RL values
    
    2. **Upload the file** using the uploader above
    
    3. **Review and edit** parameters if needed
    
    4. **Click 'Generate DXF'** to create and download the bridge drawing
    
    ### Required Parameters
    - Number of spans (NSPAN)
    - Span length (SPAN1)
    - Bridge length (LBRIDGE)
    - Skew angle (SKEW)
    - Road levels and dimensions
    """)

# Add footer
st.markdown("---")
st.caption("Bridge Design Generator | Created with Streamlit and ezdxf")

# Note: The actual DXF generation logic from the original script
# would be integrated as functions here and called when generating the DXF.
