FROM python:3.12-slim AS builder 

WORKDIR /app

# Basic setup
RUN apt-get update && \
    apt-get install -y build-essential git --no-install-recommends

# Copy source code and install dependencies
COPY app/ ./app/
COPY app/requirements.txt /app/requirements.txt

RUN pip install -r requirements.txt
RUN python app/core/lib/build.py


FROM python:3.12-slim AS final

WORKDIR /app

COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages   
COPY --from=builder /usr/local/bin /usr/local/bin                                                     
                                                         
COPY --from=builder ./app .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
