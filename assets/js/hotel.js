//========== CAROUSEL ==========

// IMAGES

const images = [
    "/Book-Your-Travel/assets/images/hotel/luxury-poolside-experience-where-guests-bask-opulence-cabanas (1).webp",
    "/Book-Your-Travel/assets/images/hotel/hhyunma-hotel-swimming-pool-1065275_1920 (1).webp",
    "/Book-Your-Travel/assets/images/hotel/engin_akyurt-resort-4369984_1920 (1).webp",
    "/Book-Your-Travel/assets/images/hotel/dreamwalker-palm-966994_1920 (1).webp",
    "/Book-Your-Travel/assets/images/hotel/chair-pool (1) (1).webp"
];


// ELEMENTS

const mainImage = document.getElementById("mainImage");
const thumbnails = document.querySelectorAll(".thumbnail");
const previousButton = document.querySelector(".prev");
const nextButton = document.querySelector(".next");

// IMAGE ACTUELLE

let currentIndex = 0;

// AFFICHER UNE IMAGE

function showSlide(index) {
    currentIndex = index;

    /* Change la grande image */
    mainImage.src = images[currentIndex];


    /* Change la petite image active */
    thumbnails.forEach((thumbnail, index) => {
        thumbnail.classList.toggle(
            "active",
            index === currentIndex
        );
    });
}

// BOUTON PREVIOUS

previousButton.addEventListener("click", function () {
    currentIndex--;

    if (currentIndex < 0) {
        currentIndex = images.length - 1;
    }

    showSlide(currentIndex);
});

// BOUTON NEXT

nextButton.addEventListener("click", function () {
    currentIndex++;

    if (currentIndex >= images.length) {
        currentIndex = 0;
    }

    showSlide(currentIndex);
});

// PETITES IMAGES

thumbnails.forEach(function (thumbnail) {
    thumbnail.addEventListener("click", function () {

        const index = Number(
            thumbnail.dataset.index
        );

        showSlide(index);
    });
});

//========== TABS NAV GAUCHE  ==========

const tabs = document.querySelectorAll(".hotel-tab");
const contents = document.querySelectorAll(".tab-content");

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        const target = tab.dataset.tab;

        // Retirer la classe active de tous les boutons
        tabs.forEach(tab => {
            tab.classList.remove("active");
            tab.setAttribute("aria-selected", "false");
        });

        // Activer le bouton cliqué
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");

        // Cacher tous les contenus
        contents.forEach(content => {
            content.classList.remove("active");
        });

        // Afficher le contenu correspondant
        const targetContent = document.getElementById(target);
        targetContent.classList.add("active");
    });

});

//========== CARDS ROOMS ==========

const cardsRoom = [

    {
        name: "Superior Double Room",
        img: "/Book-Your-Travel/assets/images/hotel/interior-modern-comfortable-hotel-room (1).webp",
        person: "2"
    },
    {
        name: "Deluxe Single Room",
        img: "/Book-Your-Travel/assets/images/hotel/visualsofdana-T5pL6ciEn-I-unsplash (1).webp",
        person: "1"
    },
    {
        name: "Standard Family Room",
        img: "/Book-Your-Travel/assets/images/hotel/interior-modern-comfortable-hotel-room (1).webp",
        person: "3"
    },
    {
        name: "Superior Double Room",
        img: "/Book-Your-Travel/assets/images/hotel/visualsofdana-T5pL6ciEn-I-unsplash (1).webp",
        person: "2"
    },
];

// CONTENEUR DES CARTES

const roomCard =
    document.getElementById("room-card");

// AFFICHER LES CHAMBRES

function afficherRooms(rooms) {

    if (!roomCard) {
        console.error(
            "Le conteneur #room-card est introuvable."
        );
        return;
    }

    // Nettoyage du conteneur
    roomCard.innerHTML = "";

    // Vérifier si l'hôtel possède des chambres
    if (rooms.length === 0) {
        roomCard.innerHTML = "<p>Aucune chambre disponible pour cet hôtel.</p>";
        return;
    }


    // CREATION DE CHAQUE CARTE

    // Pourcourir le tableau destinations et créer automatiquement une carte pour chaque destination.
    rooms.forEach((room) => {
        // Création d'un élément HTML directement en Javascript.
        const colRoom = document.createElement("div");

        colRoom.className =
            "col-12";

        // GENERER LES BONHOMMES

        const peopleIcons = "👤".repeat(room.capacity);

        // HTML DE LA CARTE

        colRoom.innerHTML = `

<article class="room">

    
    <img class="img-room" src="${room.image ? `../images/hotel/${room.image}` : '../images/hotel/interior-modern-comfortable-hotel-room (1).webp'}" 
        alt="Photo de ${room.name}" 
        width="584" height="533" 
        loading="lazy">
    <div class="room-description">
        <h3>${room.name}</h3>

        <p>${room.description || "Aucune description disponible pour cette chambre."}</p>
    </div>

    <div class="room-info">
        <p>Max :
            <span class="people" aria-hidden="true">${peopleIcons}</span>
            <span class="visually-hidden">${room.capacity} people</span>
        </p>
        <p>Price: $ ${room.price}</p>
        <p>Rooms: 01</p>
        <a class="booking"
            href="payment-process-1.html?room_id=${room.id}&hotel_id=${room.hotel_id}&checkin=${encodeURIComponent(checkIn || "")}&checkout=${encodeURIComponent(checkOut || "")}"
            aria-label="Book ${room.name}">
        BOOK NOW
</a>
    </div>
    
    
</article>

<hr>

`;

        // AJOUT DE LA CARTE
        // Pour ajouter l'élément créé dans le conteneur cards-container.
        roomCard.appendChild(colRoom);
    });
}

// Commentaires 

const commentaires = [
    {
        nameReviews: "Anonymous",
        imgPerson: "../images/Avatar-inconnu.webp",
        positifReviews: "It was a warm friendly hotel. Very easy access to shops and underground stations. Staff very welcoming.",
        negatifReviews: "noisy neigbourghs spoilt the rather calm environment"
    },
    {
        nameReviews: "Anonymous",
        imgPerson: "../images/Avatar-inconnu.webp",
        positifReviews: "It was a warm friendly hotel. Very easy access to shops and underground stations. Staff very welcoming.",
        negatifReviews: "noisy neigbourghs spoilt the rather calm environment"
    },
    {
        nameReviews: "Anonymous",
        imgPerson: "../images/Avatar-inconnu.webp",
        positifReviews: "It was a warm friendly hotel. Very easy access to shops and underground stations. Staff very welcoming.",
        negatifReviews: "noisy neigbourghs spoilt the rather calm environment"
    },
    {
        nameReviews: "Anonymous",
        imgPerson: "../images/Avatar-inconnu.webp",
        positifReviews: "It was a warm friendly hotel. Very easy access to shops and underground stations. Staff very welcoming.",
        negatifReviews: "noisy neigbourghs spoilt the rather calm environment"
    },
    {
        nameReviews: "Anonymous",
        imgPerson: "../images/Avatar-inconnu.webp",
        positifReviews: "It was a warm friendly hotel. Very easy access to shops and underground stations. Staff very welcoming.",
        negatifReviews: "noisy neigbourghs spoilt the rather calm environment"
    },
];

const commentaire =
    document.getElementById("commentaire");

function afficherCommentaires() {

    if (!commentaire) {
        console.error(
            "Le conteneur #commentaire est introuvable."
        );
        return;
    }

    commentaire.innerHTML = "";

    // Pourcourir le tableau commentaire et créer automatiquement une carte pour chaque commentaire.
    commentaires.forEach((com) => {
        // Création d'un élément HTML directement en Javascript.
        const colCommentaire = document.createElement("div");

        colCommentaire.className =
            "col-12  containerCom";

        colCommentaire.innerHTML = `

                                    
                                    <figure class="left">
                                    <img class="avatar" src="${com.imgPerson}" alt="Avatar inconnu">

                                    <address class="address-avatar">
                                        <p class="anonymous">${com.nameReviews}</p>
                                        <p>Solo travellerNorway</p>
                                        <p>22/06/2016</p>   
                                    </address>
                                </figure>

                                <div class="text-commentaire">
                                <div class="positif pro">
                                    <p>${com.positifReviews}</p>
                                </div>
                                <div class="negatif con">
                                    <p>${com.negatifReviews}</p>
                                </div>

                                </div>
                                <hr>
                                
                                <hr>

                                
                                
`;

        commentaire.appendChild(colCommentaire);
    });
}

document.addEventListener(
    "DOMContentLoaded", // Attend que le HTML soit chargé avant d'exécuter le code.
    () => {

        afficherCommentaires();
    }
);

// ========== RÉCUPÉRATION DES PARAMÈTRES DE RECHERCHE ==========

// Récupérer les paramètres présents dans l'URL
const searchParams = new URLSearchParams(window.location.search);

const hotelId = searchParams.get("id");

// Récupérer les informations saisies dans le formulaire
const destination = searchParams.get("destination");
const checkIn = searchParams.get("checkin");
const checkOut = searchParams.get("checkout");

console.log("Identifiant de l'hôtel sélectionné :", hotelId);

// Afficher les informations pour vérifier leur récupération
console.log("Destination :", destination);
console.log("Date d'arrivée :", checkIn);
console.log("Date de départ :", checkOut);

// ========== RÉCUPÉRATION DES HÔTELS DEPUIS L'API ==========

// Envoyer une requête GET à notre serveur Node.js
fetch("http://localhost:3000/api/hotels")
    .then(response => {

        // Vérifier que le serveur a répondu correctement
        if (!response.ok) {
            throw new Error("Erreur lors de la récupération des hôtels");
        }

        // Transformer la réponse JSON en données JavaScript
        return response.json();
    })
    .then(hotels => {

        // Afficher tous les hôtels récupérés depuis MySQL
        console.log("Hôtels récupérés depuis MySQL :", hotels);

        // Filtrer les hôtels selon la destination recherchée
        const hotelsFiltres = hotels.filter(hotel => {

            // Si aucune destination n'est saisie, conserver tous les hôtels
            if (!destination) {
                return true;
            }

            // Comparer la ville de l'hôtel à la destination recherchée
            return hotel.city.toLowerCase() === destination.trim().toLowerCase();
        });

        // Afficher les hôtels correspondant à la recherche
        console.log("Hôtels correspondant à la destination :", hotelsFiltres);
    })
    .catch(error => {

        // Afficher une éventuelle erreur
        console.error("Erreur API :", error.message);
    });

// ========== RÉCUPÉRATION DE L'HÔTEL SÉLECTIONNÉ ==========

if (hotelId) {

    fetch(`http://localhost:3000/api/hotels/${hotelId}`)

        .then(response => {

            if (!response.ok) {
                throw new Error("Impossible de récupérer cet hôtel");
            }

            return response.json();
        })

        .then(hotel => {

            console.log("Hôtel sélectionné depuis MySQL :", hotel);

            // ========== AFFICHAGE DU NOM DE L'HÔTEL ==========

            // Récupérer le titre dans le HTML
            const hotelName = document.getElementById("hotel-name");

            // Remplacer le nom statique par celui provenant de MySQL
            if (hotelName) {
                hotelName.textContent = hotel.name;
            }

            // ========== AFFICHAGE DE LA LOCALISATION ==========

            // Récupérer l'élément HTML
            const hotelLocation = document.getElementById("hotel-location");

            // Afficher les informations provenant de MySQL
            if (hotelLocation) {
                hotelLocation.textContent = [
                    hotel.address,
                    hotel.city,
                    hotel.country
                ].filter(Boolean).join(", ");
            }

            // ========== AFFICHAGE DE LA DESCRIPTION ==========

            // Récupérer le paragraphe dans le HTML
            const hotelDescription = document.getElementById("hotel-description");

            // Afficher la description provenant de MySQL
            if (hotelDescription) {

                hotelDescription.textContent =
                    hotel.description || "Aucune description disponible pour cet hôtel.";

            }

        })

        .catch(error => {
            console.error("Erreur API hôtel :", error.message);
        });

}

// ========== RÉCUPÉRATION DES CHAMBRES DE L'HÔTEL ==========

if (hotelId) {

    fetch("http://localhost:3000/api/rooms")

        .then(response => {

            if (!response.ok) {
                throw new Error("Impossible de récupérer les chambres");
            }

            return response.json();
        })

        .then(rooms => {

            // Filtrer les chambres selon l'hôtel sélectionné
            const hotelRooms = rooms.filter(room => {
                return Number(room.hotel_id) === Number(hotelId);
            });

            console.log("Chambres de l'hôtel sélectionné :", hotelRooms);

            // Afficher les chambres récupérées depuis MySQL
            afficherRooms(hotelRooms);

        })

        .catch(error => {
            console.error("Erreur API chambres :", error.message);
        });

}