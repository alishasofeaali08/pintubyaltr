// =====================================================
// DASHBOARD SYSTEM
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    const profileModal = document.getElementById("profileModal");

    if (profileModal) {

        const currentUser = getCurrentUser();

        if (!currentUser) {
            alert("Please log in to access your dashboard.");
            window.location.href = "login.html";
            return;
        }

        const userId = getUserId();

        let profile = getUserProfile();

        let points = Number(getUserData("pintuPointsByUser", 0)) || 0;

        let claimedTasks = getUserData("pintuTasksByUser", []);
        let redeemedRewards = getUserData("pintuRewardsByUser", []);
        let activities = getUserData("pintuActivityByUser", []);

        if (!Array.isArray(claimedTasks)) claimedTasks = [];
        if (!Array.isArray(redeemedRewards)) redeemedRewards = [];
        if (!Array.isArray(activities)) activities = [];


        // -------------------------------------------------
        // SAVE DASHBOARD DATA
        // -------------------------------------------------

        function saveDashboard() {

            saveUserData("pintuProfiles", profile);
            saveUserData("pintuPointsByUser", points);
            saveUserData("pintuTasksByUser", claimedTasks);
            saveUserData("pintuRewardsByUser", redeemedRewards);
            saveUserData("pintuActivityByUser", activities);

            const updatedUser = {
                ...getCurrentUser(),
                ...profile
            };

            saveData("currentUser", updatedUser);

            saveData("savedUsername", profile.name);
            saveData("savedEmail", profile.email);
            saveData("savedPhone", profile.phone);

            const users = getData("pintuUsers", []);

            const userIndex = users.findIndex(user =>
                String(user.id) === String(userId)
            );

            if (userIndex !== -1) {
                users[userIndex].username = profile.name;
                users[userIndex].email = profile.email;
                users[userIndex].phone = profile.phone;
                users[userIndex].role = profile.role;

                saveData("pintuUsers", users);
            }
        }


        // -------------------------------------------------
        // ACTIVITY TRACKING
        // -------------------------------------------------

        function addActivity(description, type = "general") {

            activities.unshift({
                id: Date.now().toString(),
                description: description,
                type: type,
                date: new Date().toISOString()
            });

            activities = activities.slice(0, 10);

            saveDashboard();
            renderActivity();
        }


        // -------------------------------------------------
        // PROFILE DISPLAY
        // -------------------------------------------------

        function renderProfile() {

            const username = document.getElementById("username");
            const profileName = document.getElementById("profileName");
            const profileEmail = document.getElementById("profileEmail");
            const profileRole = document.getElementById("profileRole");
            const profileAvatar = document.getElementById("profileAvatar");

            const detailName = document.getElementById("detailName");
            const detailEmail = document.getElementById("detailEmail");
            const detailPhone = document.getElementById("detailPhone");

            if (username) {
                username.textContent = profile.name || "User";
            }

            if (profileName) {
                profileName.textContent = profile.name || "User Name";
            }

            if (profileEmail) {
                profileEmail.textContent = profile.email || "No email provided";
            }

            if (profileRole) {
                profileRole.textContent = profile.role || "Tenant";
            }

            if (profileAvatar) {
                profileAvatar.textContent = (profile.name || "U").charAt(0).toUpperCase();
            }

            if (detailName) {
                detailName.textContent = profile.name || "Not provided";
            }

            if (detailEmail) {
                detailEmail.textContent = profile.email || "Not provided";
            }

            if (detailPhone) {
                detailPhone.textContent = profile.phone || "Not provided";
            }

            const accountRole = document.getElementById("accountRole");

            if (accountRole) {
                accountRole.textContent = profile.role || "Tenant";
            }
        }


        // -------------------------------------------------
        // POINTS DISPLAY
        // -------------------------------------------------

        function renderStats() {

            const totalPoints = document.getElementById("totalPoints");

            if (totalPoints) {
                totalPoints.textContent = points.toLocaleString();
            }
        }


        // -------------------------------------------------
        // TASK SYSTEM
        // -------------------------------------------------

        const tasks = [
            {
                id: "profile",
                name: "Complete your profile",
                description: "Add your personal information.",
                points: 50
            },
            {
                id: "community",
                name: "Create a community post",
                description: "Share something with the PINTU community.",
                points: 30
            },
            {
                id: "enquiry",
                name: "Submit an enquiry",
                description: "Send an enquiry through PINTU.",
                points: 20
            },
            {
                id: "review",
                name: "Share your feedback",
                description: "Help improve the PINTU platform.",
                points: 40
            }
        ];

        function renderTasks() {

            const taskContainer = document.getElementById("tasksContainer");

            if (!taskContainer) return;

            taskContainer.innerHTML = "";

            tasks.forEach(task => {

                const completed = claimedTasks.includes(task.id);

                const taskCard = document.createElement("div");
                taskCard.className = "task-card";

                taskCard.innerHTML = `
                    <div class="task-info">
                        <h3>${task.name}</h3>
                        <p>${task.description}</p>
                        <span>+${task.points} points</span>
                    </div>
                    <span class="task-status">
                        ${completed ? "Completed" : "Not completed"}
                    </span>
                `;

                taskContainer.appendChild(taskCard);
            });
        }


        // -------------------------------------------------
        // REWARDS SYSTEM
        // -------------------------------------------------

        const rewards = [
            {
                id: "voucher",
                name: "Shopping Voucher",
                description: "Redeem a shopping voucher.",
                points: 100
            },
            {
                id: "consultation",
                name: "Property Consultation",
                description: "Get a property consultation session.",
                points: 200
            },
            {
                id: "badge",
                name: "Exclusive PINTU Badge",
                description: "Unlock an exclusive membership badge.",
                points: 300
            }
        ];

        function renderRewards() {

            const rewardsContainer = document.getElementById("rewardsContainer");

            if (!rewardsContainer) return;

            rewardsContainer.innerHTML = "";

            rewards.forEach(reward => {

                const redeemed = redeemedRewards.includes(reward.id);
                const canRedeem = points >= reward.points && !redeemed;

                const rewardCard = document.createElement("div");
                rewardCard.className = "reward-card";

                rewardCard.innerHTML = `
                    <h3>${reward.name}</h3>
                    <p>${reward.description}</p>
                    <span>${reward.points} points</span>
                    <button
                        class="redeem-btn"
                        data-reward="${reward.id}"
                        ${!canRedeem ? "disabled" : ""}
                    >
                        ${redeemed ? "Redeemed" : canRedeem ? "Redeem" : "Not Enough Points"}
                    </button>
                `;

                rewardsContainer.appendChild(rewardCard);
            });

            rewardsContainer.querySelectorAll(".redeem-btn").forEach(button => {

                button.addEventListener("click", function () {

                    const rewardId = this.dataset.reward;
                    const selectedReward = rewards.find(reward => reward.id === rewardId);

                    if (!selectedReward) return;

                    if (redeemedRewards.includes(rewardId)) {
                        alert("You have already redeemed this reward.");
                        return;
                    }

                    if (points < selectedReward.points) {
                        alert("You do not have enough points.");
                        return;
                    }

                    const confirmed = confirm(
                        `Redeem ${selectedReward.name} for ${selectedReward.points} points?`
                    );

                    if (!confirmed) return;

                    points -= selectedReward.points;
                    redeemedRewards.push(rewardId);

                    addActivity(
                        `Redeemed ${selectedReward.name}`,
                        "reward"
                    );

                    saveDashboard();
                    refreshDashboard();

                    alert("Reward redeemed successfully!");
                });
            });
        }


        // -------------------------------------------------
        // ACTIVITY DISPLAY
        // -------------------------------------------------

        function renderActivity() {

            const activityContainer = document.getElementById("activityContainer");

            if (!activityContainer) return;

            activityContainer.innerHTML = "";

            if (activities.length === 0) {
                activityContainer.innerHTML = "<p>No recent activity yet.</p>";
                return;
            }

            activities.forEach(activity => {

                const activityItem = document.createElement("div");
                activityItem.className = "activity-item";

                const activityDate = new Date(activity.date);

                activityItem.innerHTML = `
                    <div>
                        <p>${activity.description}</p>
                        <small>${activityDate.toLocaleString()}</small>
                    </div>
                `;

                activityContainer.appendChild(activityItem);
            });
        }


        // -------------------------------------------------
        // PROFILE EDITING
        // -------------------------------------------------

        const editProfileBtn = document.getElementById("editProfileBtn");
        const closeModal = document.getElementById("closeModal");
        const cancelEdit = document.getElementById("cancelEdit");
        const profileForm = document.getElementById("profileForm");

        const editName = document.getElementById("editName");
        const editEmail = document.getElementById("editEmail");
        const editPhone = document.getElementById("editPhone");
        const editRole = document.getElementById("editRole");

        function openProfileModal() {

            if (editName) editName.value = profile.name || "";
            if (editEmail) editEmail.value = profile.email || "";
            if (editPhone) editPhone.value = profile.phone || "";
            if (editRole) editRole.value = profile.role || "Tenant";

            profileModal.classList.add("active");
        }

        function closeProfileModal() {
            profileModal.classList.remove("active");
        }

        if (editProfileBtn) {
            editProfileBtn.addEventListener("click", openProfileModal);
        }

        if (closeModal) {
            closeModal.addEventListener("click", closeProfileModal);
        }

        if (cancelEdit) {
            cancelEdit.addEventListener("click", closeProfileModal);
        }

        profileModal.addEventListener("click", function (event) {
            if (event.target === profileModal) {
                closeProfileModal();
            }
        });

        if (profileForm) {

            profileForm.addEventListener("submit", function (event) {
                event.preventDefault();

                const newName = editName.value.trim();
                const newEmail = editEmail.value.trim();
                const newPhone = editPhone.value.trim();
                const newRole = editRole.value;

                if (newName.length < 3) {
                    alert("Name must contain at least 3 characters.");
                    return;
                }

                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                if (!emailPattern.test(newEmail)) {
                    alert("Please enter a valid email address.");
                    return;
                }

                if (newPhone) {
                    const phonePattern = /^(\+?6?01)[0-46-9]-?[0-9]{7,8}$/;

                    if (!phonePattern.test(newPhone)) {
                        alert("Please enter a valid Malaysian phone number.");
                        return;
                    }
                }

                const users = getData("pintuUsers", []);

                const emailExists = users.some(user =>
                    String(user.id) !== String(userId) &&
                    user.email.toLowerCase() === newEmail.toLowerCase()
                );

                if (emailExists) {
                    alert("This email address is already in use.");
                    return;
                }

                profile = {
                    ...profile,
                    name: newName,
                    email: newEmail,
                    phone: newPhone,
                    role: newRole
                };

                saveDashboard();

                renderProfile();
                closeProfileModal();

                addActivity("Updated profile information", "profile");

                alert("Profile updated successfully!");
            });
        }


        // -------------------------------------------------
        // MEMBERSHIP TIER SYSTEM
        // -------------------------------------------------

        const membershipTiers = {
            Bronze: {
                min: 0,
                max: 199,
                price: 0,
                description: "Enjoy essential PINTU features and community access."
            },

            Silver: {
                min: 200,
                max: 499,
                price: 19.90,
                description: "Unlock enhanced account features and priority enquiries."
            },

            Gold: {
                min: 500,
                max: 999,
                price: 39.90,
                description: "Enjoy premium property services and exclusive offers."
            },

            Platinum: {
                min: 1000,
                max: Infinity,
                price: 69.90,
                description: "Access premium support and exclusive membership benefits."
            }
        };

        function getMembershipTier() {

            if (points >= 1000) return "Platinum";
            if (points >= 500) return "Gold";
            if (points >= 200) return "Silver";

            return "Bronze";
        }

        function renderTier() {

            const currentTier = getMembershipTier();
            const tier = membershipTiers[currentTier];

            const currentTierElement = document.getElementById("currentTier");
            const tierPointsElement = document.getElementById("tierPoints");
            const tierDescriptionElement = document.getElementById("tierDescription");
            const tierProgressText = document.getElementById("tierProgressText");
            const tierProgressFill = document.getElementById("tierProgressFill");

            if (currentTierElement) {
                currentTierElement.textContent = currentTier;
            }

            if (tierPointsElement) {
                tierPointsElement.textContent = points.toLocaleString();
            }

            if (tierDescriptionElement) {
                tierDescriptionElement.textContent = tier.description;
            }

            let nextTier = null;

            if (currentTier === "Bronze") nextTier = "Silver";
            else if (currentTier === "Silver") nextTier = "Gold";
            else if (currentTier === "Gold") nextTier = "Platinum";

            if (nextTier) {

                const nextTierPoints = membershipTiers[nextTier].min;
                const remaining = Math.max(0, nextTierPoints - points);

                const progress = Math.min(
                    100,
                    ((points - tier.min) / (nextTierPoints - tier.min)) * 100
                );

                if (tierProgressText) {
                    tierProgressText.textContent =
                        `${points} / ${nextTierPoints} points (${remaining} more to ${nextTier})`;
                }

                if (tierProgressFill) {
                    tierProgressFill.style.width = `${progress}%`;
                }

            } else {

                if (tierProgressText) {
                    tierProgressText.textContent = "Maximum membership tier reached!";
                }

                if (tierProgressFill) {
                    tierProgressFill.style.width = "100%";
                }
            }

            document.querySelectorAll(".upgrade-tier").forEach(button => {

                const selectedTier = button.dataset.tier;

                if (selectedTier === currentTier) {
                    button.textContent = "Current Tier";
                    button.disabled = true;
                } else {
                    button.textContent = "Upgrade";
                    button.disabled = false;
                }
            });
        }


        // -------------------------------------------------
        // MEMBERSHIP UPGRADE REQUESTS
        // -------------------------------------------------

        document.querySelectorAll(".upgrade-tier").forEach(button => {

            button.addEventListener("click", function () {

                const selectedTier = this.dataset.tier;
                const tier = membershipTiers[selectedTier];

                if (!tier) return;

                const currentTier = getMembershipTier();

                if (selectedTier === currentTier) {
                    alert("This is already your current membership tier.");
                    return;
                }

                if (membershipTiers[selectedTier].min < membershipTiers[currentTier].min) {
                    alert("You cannot request an upgrade to a lower tier.");
                    return;
                }

                if (tier.price === 0) {
                    alert("Bronze membership is free.");
                    return;
                }

                const paymentRequests = getData("pintuPaymentRequests", []);

                const existingRequest = paymentRequests.find(request =>
                    String(request.userId) === String(userId) &&
                    request.tier === selectedTier &&
                    request.status === "Pending"
                );

                if (existingRequest) {
                    alert("You already have a pending request for this membership tier.");
                    return;
                }

                const confirmed = confirm(
                    `Request an upgrade to ${selectedTier} membership for RM${tier.price.toFixed(2)}?`
                );

                if (!confirmed) return;

                const newRequest = {
                    id: Date.now().toString(),
                    userId: userId,
                    userName: profile.name,
                    userEmail: profile.email,
                    tier: selectedTier,
                    amount: tier.price,
                    status: "Pending",
                    date: new Date().toISOString()
                };

                paymentRequests.push(newRequest);
                saveData("pintuPaymentRequests", paymentRequests);

                addActivity(
                    `Requested ${selectedTier} membership upgrade`,
                    "membership"
                );

                alert(
                    "Your membership upgrade request has been submitted. It is currently pending approval."
                );
            });
        });


        // -------------------------------------------------
        // REFRESH DASHBOARD
        // -------------------------------------------------

        function refreshDashboard() {

            renderProfile();
            renderStats();
            renderTasks();
            renderRewards();
            renderActivity();
            renderTier();
        }

        saveDashboard();
        refreshDashboard();

    }
});
