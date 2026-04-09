import os
import openai
import google.generativeai as genai

# Standard OpenAI API
standard_key = os.environ.get("OPENAI_API_KEY")

# Gemini API
genai.configure(api_key=os.environ.get("GEMINI_KEY"))

# Iterative count bound
iterative_count_bound = 3
