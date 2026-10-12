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

function afficherRooms() {

    if (!roomCard) {
        console.error(
            "Le conteneur #room-card est introuvable."
        );
        return;
    }

    // Nettoyage du conteneur
    roomCard.innerHTML = "";

    // CREATION DE CHAQUE CARTE

    // Pourcourir le tableau destinations et créer automatiquement une carte pour chaque destination.
    cardsRoom.forEach((room) => {
        // Création d'un élément HTML directement en Javascript.
        const colRoom = document.createElement("div");

        colRoom.className =
            "col-12";

        // GENERER LES BONHOMMES

        const peopleIcons = "👤".repeat(room.person);

        // HTML DE LA CARTE

        colRoom.innerHTML = `

<article class="room">

    
    <img class="img-room" src="${room.img}" alt="Photo de ${room.name}" width="584" height="533" loading="lazy">
    <div class="room-description">
        <h3>${room.name}</h3>
            <p>Prices are per room 20% VAT Included in price</p>
            <p>
                Non-refundableFull
                English breakfast $ 24.80
            </p>
                                    
            <p class="more-info">+ more info</p>
    </div>

    <div class="room-info">
        <p>Max :
            <span class="people" aria-hidden="true">${peopleIcons}</span>
            <span class="visually-hidden">${room.person} people</span>
        </p>
        <p>Price: $ 55</p>
        <p>Rooms: 01</p>
        <a class="booking" href="/Book-Your-Travel/assets/pages/payment-process-1.html" aria-label="Book ${room.name}">BOOK NOW</a>
    </div>
    
    
</article>

<hr>

`;

        // AJOUT DE LA CARTE
        // Pour ajouter l'élément créé dans le conteneur cards-container.
        roomCard.appendChild(colRoom);
    });
}

// ===== INITIALISATION =====

document.addEventListener(
    "DOMContentLoaded", // Attend que le HTML soit chargé avant d'exécuter le code.
    () => {

        afficherRooms();
    }
);

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