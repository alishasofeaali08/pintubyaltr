// =====================================================
// SHARED STORAGE FUNCTIONS
// =====================================================

function getData(key, fallback = null) {
    try {
        const data = localStorage.getItem(key);
        return data === null ? fallback : JSON.parse(data);
    } catch (error) {
        console.error("Storage read error:", key, error);
        return fallback;
    }
}

function saveData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getCurrentUser() {
    return getData("currentUser", null);
}

function getUserId() {
    const user = getCurrentUser();
    return user ? String(user.id) : null;
}

function getUserData(key, fallback = null) {
    const userId = getUserId();

    if (!userId) return fallback;

    const allData = getData(key, {});
    return allData[userId] !== undefined ? allData[userId] : fallback;
}

function saveUserData(key, value) {
    const userId = getUserId();

    if (!userId) return;

    const allData = getData(key, {});
    allData[userId] = value;

    saveData(key, allData);
}

function getUserProfile() {
    const userId = getUserId();
    const user = getCurrentUser();

    if (!userId || !user) return null;

    const profiles = getData("pintuProfiles", {});
    return profiles[userId] || {
        name: user.name || user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "Tenant"
    };
}

function showMessage(element, message, type = "success") {
    if (!element) return;

    element.textContent = message;
    element.className = "form-message " + type;
}
