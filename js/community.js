// =====================================================
// COMMUNITY SYSTEM
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    const postForm = document.getElementById("postForm");
    const postsContainer = document.getElementById("postsContainer");

    if (postForm && postsContainer) {

        const currentUser = getCurrentUser();

        if (!currentUser) {
            alert("Please log in to use the community.");
            window.location.href = "login.html";
            return;
        }

        const postMessage = document.getElementById("postMessage");
        const filterCategory = document.getElementById("filterCategory");
        const postContent = document.getElementById("postContent");
        const characterCount = document.getElementById("characterCount");
        const authorName = document.getElementById("authorName");
        const authorRole = document.getElementById("authorRole");
        const postTitle = document.getElementById("postTitle");
        const postCategory = document.getElementById("postCategory");

        const userId = getUserId();
        const profile = getUserProfile();

        if (authorName) {
            authorName.value = profile.name || currentUser.username || "";
            authorName.readOnly = true;
        }

        if (authorRole) {
            authorRole.value = profile.role || "Tenant";
            authorRole.readOnly = true;
        }

        let posts = getData("pintuPosts", []);

        if (!Array.isArray(posts)) posts = [];

        function savePosts() {
            saveData("pintuPosts", posts);
        }

        function escapeHTML(value) {
            return String(value).replace(/[&<>"']/g, character => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            })[character]);
        }

        // Character counter
        if (postContent && characterCount) {

            postContent.addEventListener("input", function () {
                characterCount.textContent = `${this.value.length}/500`;
            });
        }


        // Submit post
        postForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const title = postTitle?.value.trim() || "";
            const content = postContent?.value.trim() || "";
            const category = postCategory?.value || "General";

            if (!title || !content) {
                alert("Please enter a title and post content.");
                return;
            }

            if (content.length > 500) {
                alert("Your post cannot exceed 500 characters.");
                return;
            }

            const newPost = {
                id: Date.now().toString(),
                userId: userId,
                author: profile.name || currentUser.username,
                role: profile.role || "Tenant",
                title: title,
                content: content,
                category: category,
                likes: [],
                comments: [],
                date: new Date().toISOString()
            };

            posts.unshift(newPost);
            savePosts();

            // Award community points only once
            let claimedTasks = getUserData("pintuTasksByUser", []);

            if (!Array.isArray(claimedTasks)) claimedTasks = [];

            if (!claimedTasks.includes("community")) {

                claimedTasks.push("community");
                saveUserData("pintuTasksByUser", claimedTasks);

                let points = Number(getUserData("pintuPointsByUser", 0)) || 0;

                points += 30;
                saveUserData("pintuPointsByUser", points);

                let activities = getUserData("pintuActivityByUser", []);

                if (!Array.isArray(activities)) activities = [];

                activities.unshift({
                    id: Date.now().toString(),
                    description: "Earned 30 points for creating a community post",
                    type: "points",
                    date: new Date().toISOString()
                });

                saveUserData("pintuActivityByUser", activities.slice(0, 10));
            }

            postForm.reset();

            if (authorName) {
                authorName.value = profile.name || currentUser.username || "";
            }

            if (authorRole) {
                authorRole.value = profile.role || "Tenant";
            }

            if (characterCount) {
                characterCount.textContent = "0/500";
            }

            renderPosts();

            alert("Your post has been published!");
        });


        // Render posts
        function renderPosts() {

            const selectedCategory = filterCategory?.value || "All";

            const filteredPosts = posts.filter(post =>
                selectedCategory === "All" || post.category === selectedCategory
            );

            postsContainer.innerHTML = "";

            const emptyMessage = document.getElementById("emptyMessage");

            if (filteredPosts.length === 0) {

                if (emptyMessage) {
                    emptyMessage.style.display = "block";
                } else {
                    postsContainer.innerHTML = "<p>No community posts yet.</p>";
                }

                return;

            } else if (emptyMessage) {
                emptyMessage.style.display = "none";
            }

            filteredPosts.forEach(post => {

                const liked = (post.likes || []).includes(userId);
                const isOwner = String(post.userId) === String(userId);

                const comments = Array.isArray(post.comments) ? post.comments : [];

                const postCard = document.createElement("article");
                postCard.className = "post-card";

                postCard.innerHTML = `
                    <div class="post-header">
                        <div>
                            <h3>${escapeHTML(post.author)}</h3>
                            <small>${escapeHTML(post.role || "Tenant")} · ${new Date(post.date).toLocaleString()}</small>
                        </div>
                        <span class="post-category">${escapeHTML(post.category)}</span>
                    </div>

                    <h2>${escapeHTML(post.title)}</h2>
                    <p class="post-content">${escapeHTML(post.content)}</p>

                    <div class="post-actions">
                        <button class="like-btn" data-id="${post.id}">
                            ${liked ? "❤️ Liked" : "🤍 Like"} (${(post.likes || []).length})
                        </button>

                        ${isOwner ? `
                            <button class="delete-post-btn" data-id="${post.id}">
                                Delete
                            </button>
                        ` : ""}
                    </div>

                    <div class="comments-section">
                        <h4>Comments (${comments.length})</h4>

                        <div class="comments-list">
                            ${comments.map(comment => `
                                <div class="comment">
                                    <strong>${escapeHTML(comment.author)}</strong>
                                    <p>${escapeHTML(comment.text)}</p>
                                </div>
                            `).join("")}
                        </div>

                        <form class="comment-form" data-id="${post.id}">
                            <input
                                type="text"
                                name="comment"
                                placeholder="Write a comment..."
                                maxlength="250"
                                required
                            >
                            <button type="submit">Comment</button>
                        </form>
                    </div>
                `;

                postsContainer.appendChild(postCard);
            });

            attachPostEvents();
        }


        // Like, delete and comment events
        function attachPostEvents() {

            postsContainer.querySelectorAll(".like-btn").forEach(button => {

                button.addEventListener("click", function () {

                    const post = posts.find(item => item.id === this.dataset.id);

                    if (!post) return;

                    if (!Array.isArray(post.likes)) post.likes = [];

                    if (post.likes.includes(userId)) {
                        post.likes = post.likes.filter(id => id !== userId);
                    } else {
                        post.likes.push(userId);
                    }

                    savePosts();
                    renderPosts();
                });
            });


            postsContainer.querySelectorAll(".delete-post-btn").forEach(button => {

                button.addEventListener("click", function () {

                    const postId = this.dataset.id;

                    const confirmed = confirm("Are you sure you want to delete this post?");

                    if (!confirmed) return;

                    posts = posts.filter(post =>
                        !(post.id === postId && String(post.userId) === String(userId))
                    );

                    savePosts();
                    renderPosts();
                });
            });


            postsContainer.querySelectorAll(".comment-form").forEach(form => {

                form.addEventListener("submit", function (event) {

                    event.preventDefault();

                    const commentInput = this.querySelector('input[name="comment"]');
                    const commentText = commentInput.value.trim();

                    if (!commentText) return;

                    const post = posts.find(item => item.id === this.dataset.id);

                    if (!post) return;

                    if (!Array.isArray(post.comments)) post.comments = [];

                    post.comments.push({
                        id: Date.now().toString(),
                        userId: userId,
                        author: profile.name || currentUser.username,
                        text: commentText,
                        date: new Date().toISOString()
                    });

                    savePosts();
                    renderPosts();
                });
            });
        }


        // Category filter
        if (filterCategory) {
            filterCategory.addEventListener("change", renderPosts);
        }

        renderPosts();
    }
});
