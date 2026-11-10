// ========== RÉCUPÉRATION DES PARAMÈTRES DE RECHERCHE ==========

const searchParams = new URLSearchParams(window.location.search);

const destination = searchParams.get("destination");
const checkIn = searchParams.get("checkin");
const checkOut = searchParams.get("checkout");

// ========== AFFICHAGE DES PARAMÈTRES ==========

console.log("Destination :", destination);
console.log("Date d'arrivée :", checkIn);
console.log("Date de départ :", checkOut);

// ========== RÉCUPÉRATION DES HÔTELS DEPUIS L'API ==========

fetch("http://localhost:3000/api/hotels")

    .then(response => {

        if (!response.ok) {
            throw new Error("Erreur lors de la récupération des hôtels");
        }

        return response.json();
    })

    .then(hotels => {

        console.log("Hôtels récupérés depuis MySQL :", hotels);

        // Filtrer les hôtels selon la destination recherchée

        const hotelsFiltres = hotels.filter(hotel => {

            if (!destination) {
                return true;
            }

            return hotel.city.toLowerCase() === destination.trim().toLowerCase();
        });

        console.log("Hôtels correspondant à la destination :", hotelsFiltres);

        // ========== AFFICHAGE DES HÔTELS ==========

        // Récupérer le conteneur HTML
        const hotelsContainer = document.getElementById("hotels-results");

        // Vider le conteneur avant l'affichage
        hotelsContainer.innerHTML = "";

        // Vérifier si des hôtels correspondent à la recherche
        if (hotelsFiltres.length === 0) {

            hotelsContainer.textContent = "No hotels found for this destination.";

        } else {

            // Parcourir les hôtels récupérés depuis MySQL
            hotelsFiltres.forEach(hotel => {

                // Créer une carte pour chaque hôtel
                const hotelCard = document.createElement("article");
                hotelCard.classList.add("hotel-result-card");

                // ========== IMAGE DE L'HÔTEL ==========

                // Créer l'élément image
                const hotelImage = document.createElement("img");

                // Images d'illustration associées aux hôtels
                const hotelImages = {
                    1: "../images/hotel/engin_akyurt-resort-4369984_1920 (1).webp",
                    4: "../images/hotel/hhyunma-hotel-swimming-pool-1065275_1920 (1).webp",
                    5: "../images/hotel/dreamwalker-palm-966994_1920 (1).webp"
                };

                // Choisir l'image selon l'identifiant de l'hôtel
                hotelImage.src = hotelImages[hotel.id]
                    || "../images/hotel/engin_akyurt-resort-4369984_1920 (1).webp";

                // Texte alternatif
                hotelImage.alt = `Illustration de l'hôtel ${hotel.name}`;

                // Classe CSS
                hotelImage.classList.add("hotel-result-image");

                // Nom de l'hôtel
                const hotelName = document.createElement("h2");
                hotelName.textContent = hotel.name;

                // Ville et pays
                const hotelLocation = document.createElement("p");
                hotelLocation.textContent = `${hotel.city}, ${hotel.country}`;

                // Bouton vers la fiche de l'hôtel
                const hotelLink = document.createElement("a");
                hotelLink.textContent = "VIEW HOTEL";
                // Transmettre l'hôtel sélectionné et les dates de recherche
                const hotelParams = new URLSearchParams();

                hotelParams.set("id", hotel.id);

                if (checkIn) {
                    hotelParams.set("checkin", checkIn);
                }

                if (checkOut) {
                    hotelParams.set("checkout", checkOut);
                }

                hotelLink.href = `hotel.html?${hotelParams.toString()}`;

                // Ajouter les éléments dans la carte
                hotelCard.appendChild(hotelImage);
                hotelCard.appendChild(hotelName);
                hotelCard.appendChild(hotelLocation);
                hotelCard.appendChild(hotelLink);

                // Ajouter la carte dans la grille
                hotelsContainer.appendChild(hotelCard);

            });

        }

    })

    .catch(error => {
        console.error("Erreur API :", error.message);
    });