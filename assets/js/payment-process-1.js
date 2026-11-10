// ========== RÉCUPÉRATION DES INFORMATIONS DE RÉSERVATION ==========

// Récupérer les paramètres présents dans l'URL
const paymentParams = new URLSearchParams(window.location.search);

// Récupérer les identifiants de la chambre et de l'hôtel
const roomId = paymentParams.get("room_id");
const hotelId = paymentParams.get("hotel_id");

// Vérifier les informations récupérées
console.log("Identifiant de la chambre :", roomId);
console.log("Identifiant de l'hôtel :", hotelId);

// ========== RÉCUPÉRATION DES DATES DE RÉSERVATION ==========

// Récupérer les dates transmises dans l'URL
const checkIn = paymentParams.get("checkin");
const checkOut = paymentParams.get("checkout");

// Vérifier les dates récupérées
console.log("Date d'arrivée :", checkIn);
console.log("Date de départ :", checkOut);

// ========== AFFICHAGE DES DATES DE RÉSERVATION ==========

// Récupérer les éléments HTML
const paymentCheckIn = document.getElementById("payment-checkin");
const paymentCheckOut = document.getElementById("payment-checkout");

// Afficher les dates transmises dans l'URL
if (paymentCheckIn && checkIn) {
    paymentCheckIn.textContent = checkIn;
}

if (paymentCheckOut && checkOut) {
    paymentCheckOut.textContent = checkOut;
}

// ========== CALCUL DU NOMBRE DE NUITS ==========

// Déclarer la variable pour pouvoir l'utiliser dans tout le fichier
let nombreNuits = 0;

// Vérifier que les deux dates sont présentes
if (checkIn && checkOut) {

    // Convertir les dates en millisecondes
    const dateArrivee = Date.parse(`${checkIn}T00:00:00Z`);
    const dateDepart = Date.parse(`${checkOut}T00:00:00Z`);

    // Calculer le nombre de nuits
    nombreNuits = (dateDepart - dateArrivee) / (1000 * 60 * 60 * 24);

    // Vérifier le résultat
    console.log("Nombre de nuits :", nombreNuits);

    // ========== AFFICHAGE DU NOMBRE DE NUITS ==========

    // Récupérer l'élément HTML
    const paymentRoomDetails = document.getElementById("payment-room-details");

    // Afficher la durée du séjour
    if (paymentRoomDetails && Number.isInteger(nombreNuits) && nombreNuits > 0) {

        paymentRoomDetails.textContent =
            `${nombreNuits} night${nombreNuits > 1 ? "s" : ""}, 1 room.`;

    }
}

// ========== RÉCUPÉRATION DES INFORMATIONS DE LA CHAMBRE ==========

if (hotelId && roomId) {

    fetch(`http://localhost:3000/api/rooms`)

        .then(response => {

            if (!response.ok) {
                throw new Error("Impossible de récupérer les chambres.");
            }

            return response.json();
        })

        .then(rooms => {

            // Vérifier la structure des données renvoyées par l'API
            console.log("Réponse complète de l'API :", rooms);


            // Rechercher la chambre sélectionnée
            const selectedRoom = rooms.find(
                room => room.id === Number(roomId)
            );

            console.log("Chambre sélectionnée depuis MySQL :", selectedRoom);

            // ========== AFFICHAGE DU NOM DE LA CHAMBRE ==========

            // Récupérer l'élément HTML
            const paymentRoomName = document.getElementById("payment-room-name");

            // Afficher le nom de la chambre provenant de MySQL
            if (paymentRoomName && selectedRoom) {
                paymentRoomName.textContent = selectedRoom.name;
            }

            // ========== CALCUL ET AFFICHAGE DU PRIX TOTAL ==========

            // Récupérer l'élément HTML
            const paymentRoomPrice = document.getElementById("payment-room-price");

            // Vérifier que la chambre et le nombre de nuits sont valides
            if (
                paymentRoomPrice &&
                selectedRoom &&
                Number.isInteger(nombreNuits) &&
                nombreNuits > 0
            ) {

                // Récupérer le prix d'une nuit depuis MySQL
                const prixParNuit = Number(selectedRoom.price);

                // Calculer le prix total du séjour
                const prixTotal = prixParNuit * nombreNuits;

                // Afficher le prix total avec deux décimales
                paymentRoomPrice.textContent = prixTotal.toFixed(2);

                // Vérifier le calcul
                console.log("Prix total du séjour :", prixTotal);
            }

            // ========== AFFICHAGE DE LA CAPACITÉ DE LA CHAMBRE ==========

            // Récupérer l'élément HTML
            const paymentRoomDetails = document.getElementById("payment-room-details");

            // Récupérer la capacité depuis MySQL
            if (paymentRoomDetails && selectedRoom) {

                const capacity = Number(selectedRoom.capacity);

                // Conserver le nombre de nuits déjà affiché
                const roomDetails = paymentRoomDetails.textContent.trim();

                // Ajouter la capacité maximale
                if (capacity > 0) {
                    paymentRoomDetails.textContent =
                        `${roomDetails.replace(/\.$/, "")}, max. ${capacity} ${capacity > 1 ? "people" : "person"}.`;
                }
            }

            // ========== AFFICHAGE DE LA DESCRIPTION DE LA CHAMBRE ==========

            // Récupérer l'élément HTML
            const paymentRoomDescription = document.getElementById("payment-room-description");

            // Afficher la description provenant de MySQL
            if (paymentRoomDescription && selectedRoom) {
                paymentRoomDescription.textContent =
                    selectedRoom.description || "Aucune description disponible pour cette chambre.";
            }

        })

        .catch(error => {
            console.error("Erreur API chambre :", error.message);
        });

}

// ========== RÉCUPÉRATION DES INFORMATIONS DE L'HÔTEL ==========

if (hotelId) {

    fetch(`http://localhost:3000/api/hotels/${hotelId}`)

        .then(response => {
            if (!response.ok) {
                throw new Error("Impossible de récupérer l'hôtel.");
            }

            return response.json();
        })

        .then(hotel => {

            console.log("Hôtel sélectionné depuis MySQL :", hotel);

            // ========== AFFICHAGE DU NOM DE L'HÔTEL ==========

            // Récupérer l'élément HTML
            const paymentHotelName = document.getElementById("payment-hotel-name");

            // Afficher le nom de l'hôtel provenant de MySQL
            if (paymentHotelName) {
                paymentHotelName.textContent = hotel.name;
            }

            // ========== AFFICHAGE DE LA LOCALISATION DE L'HÔTEL ==========

            // Récupérer l'élément HTML
            const paymentHotelLocation = document.getElementById("payment-hotel-location");

            // Afficher les informations provenant de MySQL
            if (paymentHotelLocation) {
                paymentHotelLocation.textContent = [
                    hotel.address,
                    hotel.city,
                    hotel.country
                ].filter(Boolean).join(", ");
            }

        })

        .catch(error => {
            console.error("Erreur API hôtel :", error.message);
        });

}