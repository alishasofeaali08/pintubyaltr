
// =====================================================
// PINTU ADMIN SYSTEM
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // ADMIN LOGIN
    // =====================================================

    const adminLoginForm = document.getElementById("adminLoginForm");

    if (adminLoginForm) {

        adminLoginForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const username = document.getElementById("adminUsername")?.value.trim();
            const password = document.getElementById("adminPassword")?.value;

            if (!username || !password) {
                alert("Please enter your username and password.");
                return;
            }

            const users = getData("pintuUsers", []);

            const matchedUser = users.find(user =>
                (
                    (user.username || "").toLowerCase() === username.toLowerCase() ||
                    (user.email || "").toLowerCase() === username.toLowerCase()
                ) && user.password === password
            );

            if (!matchedUser) {
                alert("Invalid username/email or password.");
                return;
            }

            const profiles = getData("pintuProfiles", {});
            const profile = profiles[matchedUser.id] || {};

            const userRole = profile.role || matchedUser.role || "Tenant";

            if (userRole !== "Admin") {
                alert("Access denied. You do not have admin privileges.");
                return;
            }

            const currentUser = {
                id: matchedUser.id,
                name: profile.name || matchedUser.username,
                username: matchedUser.username,
                email: profile.email || matchedUser.email,
                phone: profile.phone || matchedUser.phone,
                role: userRole
            };

            saveData("currentUser", currentUser);
            saveData("isAdminLoggedIn", true);

            alert("Admin login successful!");

            window.location.href = "admin-dashboard.html";

        });
    }


    // =====================================================
    // ADMIN DASHBOARD
    // =====================================================

    const adminDashboard = document.querySelector(".admin-dashboard");

    if (!adminDashboard) return;

    const isAdminLoggedIn = getData("isAdminLoggedIn", false);
    const currentUser = getCurrentUser();

    if (!isAdminLoggedIn || !currentUser || currentUser.role !== "Admin") {

        alert("Access denied. Please login as admin.");

        window.location.href = "admin-login.html";

        return;
    }


    // =====================================================
    // ADMIN PROFILE
    // =====================================================

    const adminNameElement = document.getElementById("adminName");

    if (adminNameElement) {
        adminNameElement.textContent = currentUser.name || "Admin";
    }


    // =====================================================
    // INITIAL DASHBOARD LOAD
    // =====================================================

    loadAdminStats();
    loadUsersTable();


    // =====================================================
    // SEARCH USERS
    // =====================================================

    const userSearch = document.getElementById("userSearch");

    if (userSearch) {
        userSearch.addEventListener("input", loadUsersTable);
    }


    // =====================================================
    // FILTER USERS BY ROLE
    // =====================================================

    const roleFilter = document.getElementById("roleFilter");

    if (roleFilter) {
        roleFilter.addEventListener("change", loadUsersTable);
    }


    // =====================================================
    // LOGOUT
    // =====================================================

    const logoutBtn = document.getElementById("adminLogoutBtn");

    if (logoutBtn) {

        logoutBtn.addEventListener("click", function (event) {

            event.preventDefault();

            if (confirm("Are you sure you want to logout?")) {

                saveData("isAdminLoggedIn", false);
                saveData("currentUser", null);

                window.location.href = "admin-login.html";

            }

        });
    }


    // =====================================================
    // EDIT MODAL
    // =====================================================

    const editModal = document.getElementById("editUserModal");

    const closeEditModal = document.getElementById("closeEditModal");
    const cancelEdit = document.getElementById("cancelEdit");
    const editUserForm = document.getElementById("editUserForm");

    function closeModal() {

        if (editModal) {
            editModal.classList.remove("active");
        }

    }

    if (closeEditModal) {
        closeEditModal.addEventListener("click", closeModal);
    }

    if (cancelEdit) {
        cancelEdit.addEventListener("click", closeModal);
    }

    if (editModal) {

        editModal.addEventListener("click", function (event) {

            if (event.target === editModal) {
                closeModal();
            }

        });

    }


    // =====================================================
    // SAVE EDITED USER
    // =====================================================

    if (editUserForm) {

        editUserForm.addEventListener("submit", function (event) {

            event.preventDefault();

            saveUserChanges();

        });

    }

});


// =====================================================
// LOAD ADMIN STATISTICS
// =====================================================

function loadAdminStats() {

    const users = getData("pintuUsers", []);
    const profiles = getData("pintuProfiles", {});

    const getRole = user => {

        const profile = profiles[user.id] || {};

        return profile.role || user.role || "Tenant";

    };

    const totalUsers = users.length;

    const adminCount = users.filter(u => getRole(u) === "Admin").length;

    const tenantCount = users.filter(u => getRole(u) === "Tenant").length;

    const landlordCount = users.filter(u => getRole(u) === "Landlord").length;

    const propertyManagerCount = users.filter(
        u => getRole(u) === "Property Manager"
    ).length;


    const updateElement = (id, value) => {

        const element = document.getElementById(id);

        if (element) {
            element.textContent = value;
        }

    };

    updateElement("totalUsers", totalUsers);
    updateElement("adminCount", adminCount);
    updateElement("tenantCount", tenantCount);
    updateElement("landlordCount", landlordCount);
    updateElement("propertyManagerCount", propertyManagerCount);

}


// =====================================================
// LOAD AND FILTER USERS TABLE
// =====================================================

function loadUsersTable() {

    const users = getData("pintuUsers", []);
    const profiles = getData("pintuProfiles", {});

    const tbody = document.getElementById("usersTableBody");

    if (!tbody) return;

    const searchInput = document.getElementById("userSearch");
    const roleFilter = document.getElementById("roleFilter");

    const search = (searchInput?.value || "").trim().toLowerCase();

    const selectedRole = roleFilter?.value || "All";

    tbody.innerHTML = "";


    // FILTER USERS

    const filteredUsers = users.filter(user => {

        const profile = profiles[user.id] || {};

        const name = profile.name || user.username || "";
        const email = profile.email || user.email || "";
        const phone = profile.phone || user.phone || "";

        const role = profile.role || user.role || "Tenant";

        const matchesSearch =
            name.toLowerCase().includes(search) ||
            email.toLowerCase().includes(search) ||
            phone.toLowerCase().includes(search);

        const matchesRole =
            selectedRole === "All" || role === selectedRole;

        return matchesSearch && matchesRole;

    });


    // DISPLAY USERS

    filteredUsers.forEach(user => {

        const profile = profiles[user.id] || {};

        const name = profile.name || user.username || "N/A";
        const email = profile.email || user.email || "N/A";
        const phone = profile.phone || user.phone || "N/A";

        const role = profile.role || user.role || "Tenant";

        const row = document.createElement("tr");

        // Create cells safely
        const nameCell = document.createElement("td");
        nameCell.textContent = name;

        const emailCell = document.createElement("td");
        emailCell.textContent = email;

        const phoneCell = document.createElement("td");
        phoneCell.textContent = phone;

        const roleCell = document.createElement("td");

        const roleBadge = document.createElement("span");

        roleBadge.className = "role-badge " +
            role.toLowerCase().replace(/\s+/g, "-");

        roleBadge.textContent = role;

        roleCell.appendChild(roleBadge);

        const actionCell = document.createElement("td");

        const editButton = document.createElement("button");

        editButton.className = "action-btn edit-btn";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", function () {
            openEditUser(user.id);
        });

        const deleteButton = document.createElement("button");

        deleteButton.className = "action-btn delete-btn";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function () {
            deleteUser(user.id);
        });

        actionCell.appendChild(editButton);
        actionCell.appendChild(deleteButton);

        row.appendChild(nameCell);
        row.appendChild(emailCell);
        row.appendChild(phoneCell);
        row.appendChild(roleCell);
        row.appendChild(actionCell);

        tbody.appendChild(row);

    });


    // EMPTY RESULTS

    if (filteredUsers.length === 0) {

        const row = document.createElement("tr");

        const cell = document.createElement("td");

        cell.colSpan = 5;
        cell.textContent = "No users found.";
        cell.style.textAlign = "center";
        cell.style.padding = "30px";

        row.appendChild(cell);

        tbody.appendChild(row);

    }


    // UPDATE RESULT COUNT

    const resultCount = document.getElementById("userResultCount");

    if (resultCount) {

        resultCount.textContent =
            `Showing ${filteredUsers.length} of ${users.length} users`;

    }

}


// =====================================================
// OPEN EDIT USER MODAL
// =====================================================

function openEditUser(userId) {

    const users = getData("pintuUsers", []);
    const profiles = getData("pintuProfiles", {});

    const user = users.find(u => String(u.id) === String(userId));

    if (!user) {
        alert("User not found.");
        return;
    }

    const profile = profiles[userId] || {};

    document.getElementById("editUserId").value = userId;

    document.getElementById("editName").value =
        profile.name || user.username || "";

    document.getElementById("editEmail").value =
        profile.email || user.email || "";

    document.getElementById("editPhone").value =
        profile.phone || user.phone || "";

    document.getElementById("editRole").value =
        profile.role || user.role || "Tenant";

    document.getElementById("editUserModal").classList.add("active");

}


// =====================================================
// SAVE USER CHANGES
// =====================================================

function saveUserChanges() {

    const userId = document.getElementById("editUserId").value;

    const name = document.getElementById("editName").value.trim();
    const email = document.getElementById("editEmail").value.trim();
    const phone = document.getElementById("editPhone").value.trim();
    const role = document.getElementById("editRole").value;


    if (!name || !email) {

        alert("Name and email are required.");
        return;

    }


    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {

        alert("Please enter a valid email address.");
        return;

    }


    const users = getData("pintuUsers", []);
    const profiles = getData("pintuProfiles", {});


    const userIndex = users.findIndex(
        u => String(u.id) === String(userId)
    );

    if (userIndex === -1) {

        alert("User not found.");
        return;

    }


    // CHECK DUPLICATE EMAIL

    const duplicateEmail = users.some((user, index) => {

        return index !== userIndex &&
            (user.email || "").toLowerCase() === email.toLowerCase();

    });

    if (duplicateEmail) {

        alert("This email address is already registered.");
        return;

    }


    // UPDATE USER

    users[userIndex].email = email;
    users[userIndex].phone = phone;

    profiles[userId] = {

        ...profiles[userId],

        name: name,
        email: email,
        phone: phone,
        role: role

    };


    saveData("pintuUsers", users);
    saveData("pintuProfiles", profiles);


    alert("User updated successfully!");

    document.getElementById("editUserModal").classList.remove("active");

    loadUsersTable();
    loadAdminStats();

}


// =====================================================
// DELETE USER
// =====================================================

function deleteUser(userId) {

    if (!confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
    )) {
        return;
    }


    const currentUser = getCurrentUser();

    if (currentUser && String(currentUser.id) === String(userId)) {

        alert("You cannot delete your own account.");
        return;

    }


    const users = getData("pintuUsers", []);
    const profiles = getData("pintuProfiles", {});


    const userIndex = users.findIndex(
        u => String(u.id) === String(userId)
    );

    if (userIndex === -1) {

        alert("User not found.");
        return;

    }


    const user = users[userIndex];

    const profile = profiles[userId] || {};

    const userRole = profile.role || user.role || "Tenant";


    if (userRole === "Admin") {

        alert("You cannot delete admin accounts.");
        return;

    }


    // DELETE USER

    users.splice(userIndex, 1);

    delete profiles[userId];


    saveData("pintuUsers", users);
    saveData("pintuProfiles", profiles);


    alert("User deleted successfully!");


    loadUsersTable();
    loadAdminStats();

}
