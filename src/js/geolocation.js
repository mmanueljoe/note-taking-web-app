export const requestLocationPermission = () => {
    return new Promise((resolve, reject) => {
        if(!navigator.geolocation) {
            reject(new Error('Geolocation is not suppported by your browser.'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                const location = {
                    coordinates: {
                        lat: latitude,
                        lng: longitude,
                    },
                    city: null,
                    country: null,
                };

                resolve(location);
            },
            (error) => {
                // handle permission denial gracefully
                let message = 'Location access denied';

                if(error.code === 1){
                    message = 'Location permission denied by user.';
                } else if(error.code === 2){
                    message = 'Location unavailable.';
                }else if(error.code === 3){
                    message = 'Location request timed out.';
                }else{
                    message = 'Unknown location error.';
                }

                reject(new Error(message));
            },
            {
                enableHighAccuracy: false, // lower accuracy for battery savings
                timeout: 15000, // 15 seconds
                maximumAge: 60000, // 1 minute
            }
        );
    });
};

export const getCityFromCoordinates = async (latitude, longitude) => {
    try{
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
        const data = await response.json();
        return data.address.city;
    }catch(error){
        console.error("Error getting city from coordinates:", error);
        return null;
    }
};

export const getCountryFromCoordinates = async (latitude, longitude) => {
    try{
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
        const data = await response.json();
        return data.address.country;
    }catch(error){
        console.error("Error getting country from coordinates:", error);
        return null;
    }
};