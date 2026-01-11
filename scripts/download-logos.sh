#!/bin/bash

LOGOS_DIR="/Users/mandelapatrick/Documents/claude projects/AI Interview Coach/public/logos"
mkdir -p "$LOGOS_DIR"

echo "Downloading PM company logos..."
echo ""

# Function to download a logo
download_logo() {
    local name=$1
    local url=$2
    local filename=$3
    local filepath="$LOGOS_DIR/$filename"

    if [ -f "$filepath" ]; then
        echo "✓ $name - already exists"
        return 0
    fi

    if curl -s -f -L -o "$filepath" "$url"; then
        # Check if file is valid (not empty and is an image)
        if [ -s "$filepath" ]; then
            echo "✓ $name - downloaded"
            return 0
        fi
    fi

    rm -f "$filepath"
    echo "✗ $name - failed"
    return 1
}

# Download from Google's favicon service (high quality)
# Format: https://www.google.com/s2/favicons?domain=DOMAIN&sz=128

download_logo "Meta" "https://www.google.com/s2/favicons?domain=meta.com&sz=128" "Meta.png"
download_logo "Google" "https://www.google.com/s2/favicons?domain=google.com&sz=128" "Google.png"
download_logo "Amazon" "https://www.google.com/s2/favicons?domain=amazon.com&sz=128" "Amazon.png"
download_logo "Microsoft" "https://www.google.com/s2/favicons?domain=microsoft.com&sz=128" "Microsoft.png"
download_logo "Apple" "https://www.google.com/s2/favicons?domain=apple.com&sz=128" "Apple.png"
download_logo "Uber" "https://www.google.com/s2/favicons?domain=uber.com&sz=128" "Uber.png"
download_logo "Lyft" "https://www.google.com/s2/favicons?domain=lyft.com&sz=128" "Lyft.png"
download_logo "Airbnb" "https://www.google.com/s2/favicons?domain=airbnb.com&sz=128" "Airbnb.png"
download_logo "TikTok" "https://www.google.com/s2/favicons?domain=tiktok.com&sz=128" "TikTok.png"
download_logo "Netflix" "https://www.google.com/s2/favicons?domain=netflix.com&sz=128" "Netflix.png"
download_logo "Dropbox" "https://www.google.com/s2/favicons?domain=dropbox.com&sz=128" "Dropbox.png"
download_logo "LinkedIn" "https://www.google.com/s2/favicons?domain=linkedin.com&sz=128" "LinkedIn.png"
download_logo "DoorDash" "https://www.google.com/s2/favicons?domain=doordash.com&sz=128" "DoorDash.png"
download_logo "Salesforce" "https://www.google.com/s2/favicons?domain=salesforce.com&sz=128" "Salesforce.png"
download_logo "Coinbase" "https://www.google.com/s2/favicons?domain=coinbase.com&sz=128" "Coinbase.png"
download_logo "Pinterest" "https://www.google.com/s2/favicons?domain=pinterest.com&sz=128" "Pinterest.png"
download_logo "Twitter" "https://www.google.com/s2/favicons?domain=twitter.com&sz=128" "Twitter.png"
download_logo "Yelp" "https://www.google.com/s2/favicons?domain=yelp.com&sz=128" "Yelp.png"
download_logo "Adobe" "https://www.google.com/s2/favicons?domain=adobe.com&sz=128" "Adobe.png"
download_logo "Intuit" "https://www.google.com/s2/favicons?domain=intuit.com&sz=128" "Intuit.png"
download_logo "CapitalOne" "https://www.google.com/s2/favicons?domain=capitalone.com&sz=128" "CapitalOne.png"
download_logo "Zoom" "https://www.google.com/s2/favicons?domain=zoom.us&sz=128" "Zoom.png"
download_logo "Etsy" "https://www.google.com/s2/favicons?domain=etsy.com&sz=128" "Etsy.png"
download_logo "eBay" "https://www.google.com/s2/favicons?domain=ebay.com&sz=128" "eBay.png"
download_logo "Affirm" "https://www.google.com/s2/favicons?domain=affirm.com&sz=128" "Affirm.png"
download_logo "Brex" "https://www.google.com/s2/favicons?domain=brex.com&sz=128" "Brex.png"
download_logo "Roblox" "https://www.google.com/s2/favicons?domain=roblox.com&sz=128" "Roblox.png"
download_logo "Glassdoor" "https://www.google.com/s2/favicons?domain=glassdoor.com&sz=128" "Glassdoor.png"
download_logo "Quora" "https://www.google.com/s2/favicons?domain=quora.com&sz=128" "Quora.png"
download_logo "Redfin" "https://www.google.com/s2/favicons?domain=redfin.com&sz=128" "Redfin.png"

echo ""
echo "Done! Check $LOGOS_DIR for downloaded logos."
ls -la "$LOGOS_DIR"/*.png 2>/dev/null | wc -l | xargs -I {} echo "Total logo files: {}"
