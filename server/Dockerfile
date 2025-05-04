# Development Stage
FROM rocker/r-ver:4.2.0 AS development

# Install system dependencies in a single layer
RUN apt-get update && apt-get install -y \
    libssl-dev \
    libcurl4-openssl-dev \
    libxml2-dev \
    curl \
    gnupg \
    git \
    build-essential \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get update \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy R requirements file and install R packages
COPY r-requirements.R .
RUN Rscript r-requirements.R

# Install Node.js dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Command to run the app
CMD ["npm", "run", "start:dev"]

##########################################################Production Stage
FROM rocker/r-ver:4.2.0 AS production

# Install system dependencies in a single layer
RUN apt-get update && apt-get install -y \
    libssl-dev \
    libcurl4-openssl-dev \
    libxml2-dev \
    curl \
    gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get update \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy R requirements file and install R packages
COPY r-requirements.R .
RUN Rscript r-requirements.R

# Install Node.js dependencies (production only)
COPY package*.json ./
RUN npm ci --only=production

# Copy application files
COPY . .



# Command to run the app in production
CMD ["npm", "start"]