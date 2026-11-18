// =====================================================
// MARKETPLACE SYSTEM
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // STORAGE AND USER FUNCTIONS
    // =====================================================

    function getData(key, fallback = null) {
        try {
            const value = localStorage.getItem(key);
            return value === null ? fallback : JSON.parse(value);
        } catch (error) {
            console.error("Storage error:", error);
            return fallback;
        }
    }

    function saveData(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function getCurrentUser() {
        return getData("currentUser", null);
    }

    function getUserProfile(userId) {
        const profiles = getData("pintuProfiles", {});
        return profiles[String(userId)] || {};
    }

    const currentUser = getCurrentUser();

    if (!currentUser) {
        alert("Please log in to access the marketplace.");
        window.location.href = "login.html";
        return;
    }

    const userId = String(currentUser.id);

    const currentProfile = getUserProfile(userId);

    const currentName =
        currentProfile.name ||
        currentUser.name ||
        currentUser.username ||
        "PINTU User";

    const currentRole =
        currentProfile.role ||
        currentUser.role ||
        "Tenant";


    // =====================================================
    // HTML ELEMENTS
    // =====================================================

    const propertyGrid = document.getElementById("propertyGrid");
    const listingCount = document.getElementById("listingCount");
    const emptyListings = document.getElementById("emptyListings");

    const searchProperty = document.getElementById("searchProperty");
    const filterType = document.getElementById("filterType");
    const filterPrice = document.getElementById("filterPrice");
    const sortListings = document.getElementById("sortListings");

    const listingModal = document.getElementById("listingModal");
    const listingForm = document.getElementById("listingForm");

    const detailsModal = document.getElementById("detailsModal");
    const chatModal = document.getElementById("chatModal");

    const propertyImage = document.getElementById("propertyImage");

    if (!propertyGrid || !listingForm) return;


    // =====================================================
    // PROPERTY DATA
    // =====================================================

    let listings = getData("pintuProperties", []);

    if (!Array.isArray(listings)) {
        listings = [];
    }

    function saveListings() {
        saveData("pintuProperties", listings);
    }

    function canManageProperties() {
        return ["Landlord", "Property Manager"].includes(currentRole);
    }

    function findListing(id) {
        return listings.find(item => String(item.id) === String(id));
    }

    function isOwner(listing) {
        return listing && String(listing.ownerId) === userId;
    }


    // =====================================================
    // IMAGE FALLBACK
    // =====================================================

    const fallbackImage = "https://placehold.co/800x500/e9e9df/77775f?text=PINTU+Property";

    function getImage(listing) {
        return listing.image || fallbackImage;
    }


    // =====================================================
    // ADD PROPERTY MODAL
    // =====================================================

    const openListingForm = document.getElementById("openListingForm");
    const closeListingModal = document.getElementById("closeListingModal");
    const cancelListing = document.getElementById("cancelListing");

    const listingModalTitle = document.getElementById("listingModalTitle");
    const editingListingId = document.getElementById("editingListingId");

    function openAddListing() {

        if (!canManageProperties()) {
            alert("Only landlords and property managers can publish property listings.");
            return;
        }

        listingForm.reset();
        editingListingId.value = "";
        listingModalTitle.textContent = "Add Property";

        listingModal.classList.add("active");
    }

    function closeAddListing() {
        listingModal.classList.remove("active");
        listingForm.reset();
        editingListingId.value = "";
    }

    if (openListingForm) {
        openListingForm.addEventListener("click", openAddListing);
    }

    if (closeListingModal) {
        closeListingModal.addEventListener("click", closeAddListing);
    }

    if (cancelListing) {
        cancelListing.addEventListener("click", closeAddListing);
    }


    // =====================================================
    // READ PROPERTY IMAGE
    // =====================================================

    function readImage(file) {
        return new Promise((resolve, reject) => {

            if (!file) {
                resolve(null);
                return;
            }

            if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
                reject(new Error("Please select a JPG, PNG or WEBP image."));
                return;
            }

            if (file.size > 1024 * 1024) {
                reject(new Error("Image must be smaller than 1 MB."));
                return;
            }

            const reader = new FileReader();

            reader.onload = function () {
                resolve(reader.result);
            };

            reader.onerror = function () {
                reject(new Error("Unable to read the selected image."));
            };

            reader.readAsDataURL(file);
        });
    }


    // =====================================================
    // CREATE AND UPDATE PROPERTY
    // =====================================================

    listingForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        if (!canManageProperties()) {
            alert("You do not have permission to publish properties.");
            return;
        }

        const id = editingListingId.value;

        const existingListing = id ? findListing(id) : null;

        if (id && (!existingListing || !isOwner(existingListing))) {
            alert("You can only edit your own property listings.");
            return;
        }

        const title = document.getElementById("propertyTitle").value.trim();
        const type = document.getElementById("propertyType").value;
        const price = Number(document.getElementById("propertyPrice").value);
        const location = document.getElementById("propertyLocation").value.trim();
        const bedrooms = Number(document.getElementById("propertyBedrooms").value);
        const bathrooms = Number(document.getElementById("propertyBathrooms").value);
        const furnishing = document.getElementById("propertyFurnishing").value;
        const description = document.getElementById("propertyDescription").value.trim();

        if (!title || !type || !price || !location || !description) {
            alert("Please complete all required property details.");
            return;
        }

        if (!Number.isFinite(price) || price <= 0 ||
            !Number.isInteger(bedrooms) || bedrooms < 0 ||
            !Number.isInteger(bathrooms) || bathrooms < 0) {
            alert("Please enter valid rental, bedroom and bathroom values.");
            return;
        }

        const file = propertyImage.files[0];

        let image = existingListing?.image || "";

        try {
            if (file) {
                image = await readImage(file);
            }
        } catch (error) {
            alert(error.message);
            return;
        }

        const propertyData = {
            title,
            type,
            price,
            location,
            bedrooms,
            bathrooms,
            furnishing,
            description,
            image
        };

        if (existingListing) {

            Object.assign(existingListing, propertyData);

            existingListing.updatedAt = new Date().toISOString();

            alert("Property listing updated successfully!");

        } else {

            const newListing = {
                id: Date.now().toString(),
                ownerId: userId,
                ownerName: currentName,
                ownerRole: currentRole,
                ...propertyData,
                createdAt: new Date().toISOString(),
                status: "Available"
            };

            listings.unshift(newListing);

            alert("Your property has been published!");
        }

        try {
            saveListings();
        } catch (error) {
            console.error(error);
            alert("Unable to save the listing. Your browser storage may be full.");
            return;
        }

        closeAddListing();
        renderListings();
    });


    // =====================================================
    // DISPLAY PROPERTY CARDS
    // =====================================================

    function createElement(tag, className, text) {
        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }

        if (text !== undefined) {
            element.textContent = text;
        }

        return element;
    }

    function renderListings() {

        let filteredListings = [...listings];

        const search = searchProperty.value.trim().toLowerCase();
        const selectedType = filterType.value;
        const selectedPrice = filterPrice.value;
        const sort = sortListings.value;

        // Search by property name, location or description
        if (search) {
            filteredListings = filteredListings.filter(property => {

                const searchableText = [
                    property.title,
                    property.location,
                    property.description,
                    property.type
                ].join(" ").toLowerCase();

                return searchableText.includes(search);
            });
        }

        // Filter property type
        if (selectedType !== "All") {
            filteredListings = filteredListings.filter(property =>
                property.type === selectedType
            );
        }

        // Filter maximum rental price
        if (selectedPrice !== "All") {
            const maxPrice = Number(selectedPrice);

            filteredListings = filteredListings.filter(property =>
                Number(property.price) < maxPrice
            );
        }

        // Sort listings
        if (sort === "low") {
            filteredListings.sort((a, b) => a.price - b.price);
        } else if (sort === "high") {
            filteredListings.sort((a, b) => b.price - a.price);
        } else {
            filteredListings.sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );
        }

        propertyGrid.innerHTML = "";

        listingCount.textContent =
            `${filteredListings.length} properties found`;

        emptyListings.hidden = filteredListings.length !== 0;

        filteredListings.forEach(property => {

            const card = createElement("article", "property-card");

            const image = createElement("img", "property-image");
            image.src = getImage(property);
            image.alt = property.title;
            image.onerror = function () {
                this.src = fallbackImage;
            };

            const content = createElement("div", "property-card-content");

            const top = createElement("div", "property-card-top");

            const tag = createElement("span", "property-tag", property.type);

            const price = createElement("div", "property-price");

            const priceValue = createElement(
                "span",
                "",
                `RM${Number(property.price).toLocaleString("en-MY")}`
            );

            const perMonth = createElement("small", "", " / month");

            price.append(priceValue, perMonth);
            top.append(tag, price);

            const title = createElement("h3", "", property.title);

            const location = createElement(
                "p",
                "property-location",
                `📍 ${property.location}`
            );

            const features = createElement("div", "property-features");

            features.append(
                createElement("span", "", `🛏 ${property.bedrooms} Bedrooms`),
                createElement("span", "", `🚿 ${property.bathrooms} Bathrooms`),
                createElement("span", "", property.furnishing)
            );

            const owner = createElement(
                "p",
                "property-owner",
                `Listed by ${property.ownerName}`
            );

            const actions = createElement("div", "card-actions");

            const viewButton = createElement("button", "view-btn", "View Details");

            viewButton.addEventListener("click", () => {
                openDetails(property.id);
            });

            const chatButton = createElement("button", "chat-btn", "Chat with Owner");

            chatButton.addEventListener("click", () => {
                openChat(property.id);
            });

            actions.append(viewButton, chatButton);

            content.append(top, title, location, features, owner, actions);
            card.append(image, content);

            propertyGrid.appendChild(card);
        });
    }


    // =====================================================
    // SEARCH, FILTER AND SORT
    // =====================================================

    searchProperty.addEventListener("input", renderListings);
    filterType.addEventListener("change", renderListings);
    filterPrice.addEventListener("change", renderListings);
    sortListings.addEventListener("change", renderListings);


    // =====================================================
    // PROPERTY DETAILS
    // =====================================================

    let selectedPropertyId = null;

    const closeDetails = document.getElementById("closeDetails");
    const chatOwnerBtn = document.getElementById("chatOwnerBtn");
    const editDetailsBtn = document.getElementById("editDetailsBtn");
    const deleteDetailsBtn = document.getElementById("deleteDetailsBtn");

    function openDetails(id) {

        const property = findListing(id);

        if (!property) return;

        selectedPropertyId = property.id;

        const image = document.getElementById("detailsImage");
        image.src = getImage(property);
        image.alt = property.title;
        image.onerror = function () {
            this.src = fallbackImage;
        };

        document.getElementById("detailsType").textContent = property.type;
        document.getElementById("detailsTitle").textContent = property.title;

        document.getElementById("detailsPrice").textContent =
            `RM${Number(property.price).toLocaleString("en-MY")} / month`;

        document.getElementById("detailsLocation").textContent =
            `📍 ${property.location}`;

        document.getElementById("detailsBedrooms").textContent =
            `🛏 ${property.bedrooms} Bedrooms`;

        document.getElementById("detailsBathrooms").textContent =
            `🚿 ${property.bathrooms} Bathrooms`;

        document.getElementById("detailsFurnishing").textContent =
            property.furnishing;

        document.getElementById("detailsDescription").textContent =
            property.description;

        document.getElementById("detailsOwner").textContent =
            property.ownerName;

        document.getElementById("ownerAvatar").textContent =
            (property.ownerName || "U").charAt(0).toUpperCase();

        const owner = isOwner(property);

        editDetailsBtn.hidden = !owner;
        deleteDetailsBtn.hidden = !owner;

        chatOwnerBtn.hidden = owner;

        detailsModal.classList.add("active");
    }

    closeDetails.addEventListener("click", function () {
        detailsModal.classList.remove("active");
    });


    // =====================================================
    // EDIT PROPERTY
    // =====================================================

    editDetailsBtn.addEventListener("click", function () {

        const property = findListing(selectedPropertyId);

        if (!property || !isOwner(property)) {
            alert("You cannot edit this listing.");
            return;
        }

        detailsModal.classList.remove("active");

        listingForm.reset();

        editingListingId.value = property.id;

        document.getElementById("propertyTitle").value = property.title;
        document.getElementById("propertyType").value = property.type;
        document.getElementById("propertyPrice").value = property.price;
        document.getElementById("propertyLocation").value = property.location;
        document.getElementById("propertyBedrooms").value = property.bedrooms;
        document.getElementById("propertyBathrooms").value = property.bathrooms;
        document.getElementById("propertyFurnishing").value = property.furnishing;
        document.getElementById("propertyDescription").value = property.description;

        listingModalTitle.textContent = "Edit Property";

        listingModal.classList.add("active");
    });


    // =====================================================
    // DELETE PROPERTY
    // =====================================================

    deleteDetailsBtn.addEventListener("click", function () {

        const property = findListing(selectedPropertyId);

        if (!property || !isOwner(property)) {
            alert("You cannot delete this listing.");
            return;
        }

        const confirmed = confirm(
            `Are you sure you want to delete "${property.title}"?`
        );

        if (!confirmed) return;

        listings = listings.filter(item =>
            String(item.id) !== String(property.id)
        );

        saveListings();

        detailsModal.classList.remove("active");

        selectedPropertyId = null;

        renderListings();

        alert("Property listing deleted successfully.");
    });


    // =====================================================
    // CHAT SYSTEM
    // =====================================================

    const chatOwnerName = document.getElementById("chatOwnerName");
    const chatPropertyName = document.getElementById("chatPropertyName");
    const chatMessages = document.getElementById("chatMessages");
    const chatForm = document.getElementById("chatForm");
    const chatInput = document.getElementById("chatInput");
    const closeChat = document.getElementById("closeChat");

    let activeConversationId = null;
    let activePropertyId = null;

    function getConversationId(propertyId, ownerId) {

        const participants = [userId, String(ownerId)].sort();

        return `${propertyId}_${participants[0]}_${participants[1]}`;
    }

    function getAllMessages() {
        const messages = getData("pintuMessages", {});
        return messages && typeof messages === "object" && !Array.isArray(messages)
            ? messages
            : {};
    }

    function renderMessages() {

        if (!activeConversationId) return;

        const allMessages = getAllMessages();

        const messages = allMessages[activeConversationId] || [];

        chatMessages.innerHTML = "";

        if (messages.length === 0) {

            const empty = createElement(
                "p",
                "chat-empty",
                "Start the conversation by sending a message."
            );

            chatMessages.appendChild(empty);
            return;
        }

        messages.forEach(message => {

            const mine = String(message.senderId) === userId;

            const bubble = createElement(
                "div",
                mine ? "message mine" : "message theirs"
            );

            const messageText = createElement("div", "", message.text);

            const time = createElement(
                "small",
                "",
                new Date(message.date).toLocaleString()
            );

            bubble.append(messageText, time);
            chatMessages.appendChild(bubble);
        });

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function openChat(propertyId) {

        const property = findListing(propertyId);

        if (!property) {
            alert("This property listing is no longer available.");
            return;
        }

        if (isOwner(property)) {
            alert("You are the owner of this property.");
            return;
        }

        activePropertyId = property.id;

        activeConversationId = getConversationId(
            property.id,
            property.ownerId
        );

        chatOwnerName.textContent = property.ownerName;
        chatPropertyName.textContent = property.title;

        renderMessages();

        detailsModal.classList.remove("active");
        chatModal.classList.add("active");

        chatInput.focus();
    }

    if (chatOwnerBtn) {
        chatOwnerBtn.addEventListener("click", function () {

            if (!selectedPropertyId) return;

            openChat(selectedPropertyId);
        });
    }

    closeChat.addEventListener("click", function () {
        chatModal.classList.remove("active");
    });


    // =====================================================
    // SEND CHAT MESSAGE
    // =====================================================

    chatForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const text = chatInput.value.trim();

        if (!text || !activeConversationId || !activePropertyId) {
            return;
        }

        const property = findListing(activePropertyId);

        if (!property) {
            alert("This property is no longer available.");
            chatModal.classList.remove("active");
            return;
        }

        const allMessages = getAllMessages();

        if (!Array.isArray(allMessages[activeConversationId])) {
            allMessages[activeConversationId] = [];
        }

        allMessages[activeConversationId].push({
            id: Date.now().toString(),
            propertyId: activePropertyId,
            senderId: userId,
            senderName: currentName,
            receiverId: String(property.ownerId),
            text: text,
            date: new Date().toISOString()
        });

        try {
            saveData("pintuMessages", allMessages);
        } catch (error) {
            console.error(error);
            alert("Unable to send message. Your browser storage may be full.");
            return;
        }

        chatInput.value = "";

        renderMessages();
    });


    // =====================================================
    // CLOSE MODALS WHEN CLICKING OUTSIDE
    // =====================================================

    [listingModal, detailsModal, chatModal].forEach(modal => {

        modal.addEventListener("click", function (event) {

            if (event.target === modal) {
                modal.classList.remove("active");
            }
        });
    });


    // =====================================================
    // INITIAL DISPLAY
    // =====================================================

    if (openListingForm && !canManageProperties()) {
        openListingForm.hidden = true;
    }

    renderListings();

});
