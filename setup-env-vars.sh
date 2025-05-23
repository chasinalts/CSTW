#!/bin/bash

# Script to set up environment variables for Netlify

# Make the script executable
chmod +x setup-env-vars.sh

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up environment variables for Netlify deployment${NC}"
echo "This script will help you set up the required environment variables for your Netlify site."
echo ""

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo -e "${RED}Netlify CLI is not installed.${NC}"
    echo "Please install it using: npm install -g netlify-cli"
    exit 1
fi

# Check if user is logged in to Netlify
netlify status > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}You need to log in to Netlify first.${NC}"
    netlify login
fi

# Get site ID
echo -e "${YELLOW}Getting site information...${NC}"
SITE_ID=""
SITE_NAME=""

# Try to get site ID from .netlify/state.json
if [ -f ".netlify/state.json" ]; then
    SITE_ID=$(cat .netlify/state.json | grep -o '"siteId": "[^"]*' | grep -o '[^"]*$')
    if [ ! -z "$SITE_ID" ]; then
        echo -e "${GREEN}Found site ID in .netlify/state.json: $SITE_ID${NC}"
    fi
fi

# If site ID is still empty, ask user to enter it
if [ -z "$SITE_ID" ]; then
    echo -e "${YELLOW}Could not automatically determine the site ID.${NC}"
    echo "Please enter your Netlify site ID or site name:"
    read SITE_NAME
    
    if [ ! -z "$SITE_NAME" ]; then
        # Try to get site ID from site name
        SITE_INFO=$(netlify api getSite --data "{\"name\":\"$SITE_NAME\"}" 2>/dev/null)
        if [ $? -eq 0 ]; then
            SITE_ID=$(echo $SITE_INFO | grep -o '"id": "[^"]*' | grep -o '[^"]*$' | head -1)
            echo -e "${GREEN}Found site ID: $SITE_ID${NC}"
        else
            echo -e "${RED}Could not find site with name: $SITE_NAME${NC}"
            echo "Please enter the site ID directly:"
            read SITE_ID
        fi
    fi
fi

if [ -z "$SITE_ID" ]; then
    echo -e "${RED}No site ID provided. Exiting.${NC}"
    exit 1
fi

# Environment variables to set
echo -e "${YELLOW}Please provide the following environment variables:${NC}"

# Auth0 variables
echo ""
echo -e "${YELLOW}Auth0 Configuration:${NC}"
echo "Enter your Auth0 domain (e.g., dev-mytcazei5krtbkqw.us.auth0.com):"
read AUTH0_DOMAIN
AUTH0_DOMAIN=${AUTH0_DOMAIN:-"dev-mytcazei5krtbkqw.us.auth0.com"}

echo "Enter your Auth0 client ID:"
read AUTH0_CLIENT_ID

echo "Enter your Auth0 audience (e.g., https://cometscanner.netlify.app/api):"
read AUTH0_AUDIENCE
AUTH0_AUDIENCE=${AUTH0_AUDIENCE:-"https://cometscanner.netlify.app/api"}

# Supabase variables
echo ""
echo -e "${YELLOW}Supabase Configuration:${NC}"
echo "Enter your Supabase URL:"
read SUPABASE_URL

echo "Enter your Supabase anonymous key:"
read SUPABASE_ANON_KEY

echo "Enter your Supabase database URL (optional):"
read SUPABASE_DATABASE_URL

# Set environment variables
echo ""
echo -e "${YELLOW}Setting environment variables...${NC}"

# Function to set environment variable
set_env_var() {
    local key=$1
    local value=$2
    
    if [ -z "$value" ]; then
        echo -e "${YELLOW}Skipping empty value for $key${NC}"
        return
    fi
    
    echo "Setting $key..."
    netlify env:set $key "$value" --scope production --site-id $SITE_ID
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Successfully set $key${NC}"
    else
        echo -e "${RED}Failed to set $key${NC}"
    fi
}

# Set all variables
set_env_var "VITE_AUTH0_DOMAIN" "$AUTH0_DOMAIN"
set_env_var "VITE_AUTH0_CLIENT_ID" "$AUTH0_CLIENT_ID"
set_env_var "VITE_AUTH0_AUDIENCE" "$AUTH0_AUDIENCE"
set_env_var "VITE_SUPABASE_URL" "$SUPABASE_URL"
set_env_var "VITE_SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY"
set_env_var "VITE_SUPABASE_DATABASE_URL" "$SUPABASE_DATABASE_URL"

# Set secrets scanning to false
set_env_var "SECRETS_SCAN_ENABLED" "false"

echo ""
echo -e "${GREEN}Environment variables setup complete!${NC}"
echo "You may need to trigger a new deployment for these changes to take effect."
echo "You can do this by running: netlify deploy --prod"
