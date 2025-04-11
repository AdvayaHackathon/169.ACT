/**
 * Interactive Map Explorer
 * Map initialization and functionality for custom markers
 */

// Custom marker pin SVG templates
const pinSVGs = {
    park: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="30" height="45">
        <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z" fill="#5cb85c"/>
        <text x="192" y="192" text-anchor="middle" fill="white" font-size="100">🌲</text>
    </svg>`,
    
    historical: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="30" height="45">
        <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z" fill="#4a89dc"/>
        <text x="192" y="192" text-anchor="middle" fill="white" font-size="100">🏛️</text>
    </svg>`,
    
    shopping: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="30" height="45">
        <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z" fill="#d9534f"/>
        <text x="192" y="192" text-anchor="middle" fill="white" font-size="100">🛍️</text>
    </svg>`,
    
    dining: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="30" height="45">
        <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z" fill="#f0ad4e"/>
        <text x="192" y="192" text-anchor="middle" fill="white" font-size="100">🍽️</text>
    </svg>`,
    
    accommodation: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="30" height="45">
        <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z" fill="#5bc0de"/>
        <text x="192" y="192" text-anchor="middle" fill="white" font-size="100">🏨</text>
    </svg>`
};

// Location data with categories
const locations = [
    // Bengaluru
    {
        name: "Cubbon Park",
        position: { lat: 12.9763, lng: 77.5929 },
        url: "https://en.wikipedia.org/wiki/Cubbon_Park",
        category: "park",
        description: "A historic park with diverse flora and fauna"
    },
    {
        name: "Lalbagh Botanical Garden",
        position: { lat: 12.9507, lng: 77.5848 },
        url: "https://en.wikipedia.org/wiki/Lal_Bagh",
        category: "park",
        description: "Famous botanical garden with a glass house"
    },
    {
        name: "Bangalore Palace",
        position: { lat: 13.0055, lng: 77.5916 },
        url: "https://en.wikipedia.org/wiki/Bangalore_Palace",
        category: "historical",
        description: "Tudor-style palace built in 1887"
    },
    {
        name: "UB City",
        position: { lat: 12.9715, lng: 77.5945 },
        url: "https://en.wikipedia.org/wiki/UB_City",
        category: "shopping",
        description: "Luxury shopping mall and business center"
    },
    {
        name: "ISKCON Temple",
        position: { lat: 13.0098, lng: 77.5511 },
        url: "https://en.wikipedia.org/wiki/ISKCON_Temple_Bangalore",
        category: "historical",
        description: "Modern Hindu temple complex"
    },
    {
        name: "Vidhana Soudha",
        position: { lat: 12.9796, lng: 77.5907 },
        url: "https://en.wikipedia.org/wiki/Vidhana_Soudha",
        category: "historical",
        description: "Impressive Neo-Dravidian style government building"
    },
    {
        name: "Leela Palace Hotel",
        position: { lat: 12.9602, lng: 77.6487 },
        url: "https://en.wikipedia.org/wiki/The_Leela_Palace_Bangalore",
        category: "accommodation",
        description: "Luxury 5-star hotel with royal architecture"
    },
    {
        name: "Phoenix Marketcity",
        position: { lat: 12.9983, lng: 77.6964 },
        url: "https://en.wikipedia.org/wiki/Phoenix_Marketcity",
        category: "shopping",
        description: "Large shopping mall with entertainment options"
    },
    {
        name: "MTR Restaurant",
        position: { lat: 12.9551, lng: 77.5854 },
        url: "https://en.wikipedia.org/wiki/Mavalli_Tiffin_Room",
        category: "dining",
        description: "Historic restaurant famous for South Indian cuisine"
    },
    {
        name: "Bannerghatta National Park",
        position: { lat: 12.8002, lng: 77.5775 },
        url: "https://en.wikipedia.org/wiki/Bannerghatta_National_Park",
        category: "park",
        description: "Biological reserve with safari park and butterfly enclosure"
    }
];

/**
 * Initialize the Google Map
 */
function initMap() {
    // Default center (Bengaluru)
    const mapCenter = { lat: 12.9716, lng: 77.5946 };

    // Map styling options for a cleaner look
    const mapStyles = [
        {
            featureType: "all",
            elementType: "labels.text.fill",
            stylers: [{ color: "#494949" }]
        },
        {
            featureType: "all",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#ffffff" }, { weight: 2 }]
        },
        {
            featureType: "administrative.land_parcel",
            elementType: "all",
            stylers: [{ visibility: "off" }]
        },
        {
            featureType: "landscape",
            elementType: "all",
            stylers: [{ color: "#f2f2f2" }]
        },
        {
            featureType: "poi.park",
            elementType: "geometry.fill",
            stylers: [{ color: "#e6f3d6" }]
        },
        {
            featureType: "water",
            elementType: "geometry.fill",
            stylers: [{ color: "#cce4ff" }]
        }
    ];

    // Create the map
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: mapCenter,
        styles: mapStyles,
        mapTypeControl: false,
        fullscreenControl: true,
        streetViewControl: false,
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM
        }
    });

    // Info window for displaying location details
    const infoWindow = new google.maps.InfoWindow();
    
    // For each location, create a custom marker
    locations.forEach((loc) => {
        // Create marker icon with the appropriate pin SVG based on category
        const markerIcon = {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(pinSVGs[loc.category]),
            scaledSize: new google.maps.Size(30, 45),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(15, 45)
        };
        
        // Create the marker
        const marker = new google.maps.Marker({
            position: loc.position,
            map: map,
            title: loc.name,
            icon: markerIcon,
            animation: google.maps.Animation.DROP
        });
        
        // Create content for info window
        const contentString = `
            <div class="info-window">
                <h3>${loc.name}</h3>
                <p>${loc.description}</p>
                <a href="${loc.url}" target="_blank" class="wiki-btn">
                    Learn more
                </a>
            </div>
        `;
        
        // Add click listener to show info window
        marker.addListener("click", () => {
            infoWindow.setContent(contentString);
            infoWindow.open(map, marker);
            
            // Bounce animation when clicked
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(() => {
                marker.setAnimation(null);
            }, 750);
        });
    });

    // Add responsive behavior for map
    google.maps.event.addDomListener(window, 'resize', function() {
        const center = map.getCenter();
        google.maps.event.trigger(map, 'resize');
        map.setCenter(center);
    });
}

// Handle errors with Google Maps loading
function handleMapError() {
    const mapElement = document.getElementById('map');
    if (mapElement) {
        mapElement.innerHTML = `
            <div class="alert alert-danger m-3">
                <h4>Error Loading Map</h4>
                <p>There was a problem loading Google Maps. Please try again later.</p>
            </div>
        `;
    }
}

// Set error handler for Google Maps
window.gm_authFailure = handleMapError;
