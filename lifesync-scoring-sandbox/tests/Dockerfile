FROM node:18-slim

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip

WORKDIR /app

# Copy package.json
COPY package.json .
RUN npm install

# Install Python deps
COPY requirements.txt .
RUN pip3 install -r requirements.txt --break-system-packages

COPY . .

CMD ["tail", "-f", "/dev/null"]
