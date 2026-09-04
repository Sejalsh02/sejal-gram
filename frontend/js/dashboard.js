const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}


// =========================================
// API CONFIG
// =========================================

const API_URL = "http://localhost:5000";


// =========================================
// GLOBAL POSTS
// =========================================

let allPosts = [];


// =========================================
// LOAD POSTS
// =========================================

async function loadPosts() {

    const postContainer = document.getElementById("posts");

    try {

        const response = await fetch(
            `${API_URL}/api/posts`
        );

        if (!response.ok) {
            throw new Error("Unable to load posts");
        }

        const data = await response.json();

        allPosts = data.posts || [];

        renderPosts(allPosts);

        updatePostCount(allPosts.length);

    } catch (error) {

        console.error("Load Posts Error:", error);

        postContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⚠️</div>

                <h3>Couldn't load your feed</h3>

                <p>
                    Make sure the backend server is running
                    and try refreshing the page.
                </p>
            </div>
        `;
    }
}


// =========================================
// RENDER POSTS
// =========================================

function renderPosts(posts) {

    const postContainer =
        document.getElementById("posts");

    if (!posts.length) {

        postContainer.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">✦</div>

                <h3>No posts yet</h3>

                <p>
                    Be the first person to share something.
                </p>

            </div>
        `;

        return;
    }


    postContainer.innerHTML = posts.map(post => {

        const author =
            post.author?.name || "Unknown User";

        const avatar =
            author.charAt(0).toUpperCase();

        const title =
            escapeHTML(post.title || "Untitled Post");

        const content =
            escapeHTML(post.content || "");

        const time =
            formatDate(post.createdAt);


        // Support different possible image field names
        const imagePath =
            post.image ||
            post.imageUrl ||
            post.imagePath ||
            null;


        let imageHTML = "";

        if (imagePath) {

            let imageURL = imagePath;

            // If backend stores something like:
            // uploads/example.jpg
            if (
                !imagePath.startsWith("http://") &&
                !imagePath.startsWith("https://")
            ) {

                imageURL =
                `${API_URL}/uploads/${imagePath
                .replace(/^\/+/, "")
                .replace(/^uploads\//, "")}`;
            }

            imageHTML = `
                <img
                    class="post-image"
                    src="${escapeAttribute(imageURL)}"
                    alt="Post image"
                    onerror="this.style.display='none'"
                >
            `;
        }


        return `

            <article class="post">

                <!-- POST HEADER -->

                <div class="post-header">

                    <div class="author-info">

                        <div class="post-avatar">
                            ${avatar}
                        </div>

                        <div>

                            <div class="author-name">
                                ${escapeHTML(author)}
                            </div>

                            <div class="post-time">
                                ${time}
                            </div>

                        </div>

                    </div>

                    <button
                        class="post-menu"
                        title="More options"
                    >
                        •••
                    </button>

                </div>


                <!-- POST BODY -->

                <h3>
                    ${title}
                </h3>

                <p>
                    ${content}
                </p>

                ${imageHTML}


                <!-- SOCIAL ACTIONS -->

                <div class="post-footer">

                    <div class="social-actions">

                        <button
                            class="social-action"
                            onclick="showLikeMessage(this)"
                        >
                            ♡ Like
                        </button>

                        <button
                            class="social-action"
                            onclick="commentPost()"
                        >
                            💬 Comment
                        </button>

                        <button
                            class="social-action"
                            onclick="sharePost(
                                '${escapeAttribute(title)}'
                            )"
                        >
                            ↗ Share
                        </button>

                    </div>


                    <!-- EXISTING CRUD ACTIONS -->

                    <div class="post-actions">

                        <button
                            class="edit-btn"
                            onclick="
                                window.location.href =
                                'edit-post.html?id=${post._id}'
                            "
                        >
                            ✏ Edit
                        </button>

                        <button
                            class="delete-btn"
                            onclick="
                                deletePost('${post._id}')
                            "
                        >
                            🗑 Delete
                        </button>

                    </div>

                </div>

            </article>

        `;

    }).join("");
}


// =========================================
// SEARCH
// =========================================

const searchInput =
    document.getElementById("searchInput");

if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {

            const searchTerm =
                this.value
                    .toLowerCase()
                    .trim();

            if (!searchTerm) {

                renderPosts(allPosts);
                updatePostCount(allPosts.length);

                return;
            }


            const filteredPosts =
                allPosts.filter(post => {

                    const title =
                        (post.title || "")
                            .toLowerCase();

                    const content =
                        (post.content || "")
                            .toLowerCase();

                    const author =
                        (post.author?.name || "")
                            .toLowerCase();


                    return (
                        title.includes(searchTerm) ||
                        content.includes(searchTerm) ||
                        author.includes(searchTerm)
                    );
                });


            renderPosts(filteredPosts);

            updatePostCount(filteredPosts.length);
        }
    );
}


// =========================================
// POST COUNT
// =========================================

function updatePostCount(count) {

    const countElement =
        document.getElementById("postCount");

    if (!countElement) return;

    if (count === 1) {

        countElement.textContent =
            "1 post in your community";

    } else {

        countElement.textContent =
            `${count} posts in your community`;
    }
}


// =========================================
// DELETE POST
// =========================================

async function deletePost(id) {

    if (!confirm("Delete this post?")) {
        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/api/posts/${id}`,
            {
                method: "DELETE",

                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Unable to delete post."
            );

            return;
        }


        alert(
            data.message ||
            "Post deleted successfully."
        );


        loadPosts();

    } catch (error) {

        console.error(
            "Delete Post Error:",
            error
        );

        alert(
            "Cannot connect to the backend."
        );
    }
}


// =========================================
// LIKE UI
// =========================================

async function showLikeMessage(button) {

    const postId = button.dataset.postId;

    if (!postId) {
        alert("Post ID not found.");
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/api/posts/${postId}/like`,
            {
                method: "PUT",

                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Unable to like post.");
            return;
        }

        // Update button
        if (data.liked) {
            button.dataset.liked = "true";
            button.innerHTML = `♥ Liked (${data.likes})`;
        } else {
            button.dataset.liked = "false";
            button.innerHTML = `♡ Like (${data.likes})`;
        }

    } catch (error) {

        console.error("Like Post Error:", error);

        alert("Cannot connect to the backend.");
    }
}


// =========================================
// COMMENT
// =========================================

function commentPost() {

    alert(
        "Comment functionality can be connected to the backend next."
    );
}


// =========================================
// SHARE
// =========================================

async function sharePost(title) {

    const shareText =
        `Check out this post: ${title}`;

    try {

        if (navigator.share) {

            await navigator.share({
                title: "Postly",
                text: shareText
            });

        } else {

            await navigator.clipboard.writeText(
                shareText
            );

            alert(
                "Post text copied to clipboard!"
            );
        }

    } catch (error) {

        console.log("Share cancelled.");
    }
}


// =========================================
// DATE FORMAT
// =========================================

function formatDate(dateString) {

    if (!dateString) {
        return "Recently";
    }


    const date =
        new Date(dateString);


    if (isNaN(date.getTime())) {
        return "Recently";
    }


    const now =
        new Date();


    const difference =
        Math.floor(
            (now - date) / 1000
        );


    if (difference < 60) {
        return "Just now";
    }


    if (difference < 3600) {

        const minutes =
            Math.floor(
                difference / 60
            );

        return `${minutes}m ago`;
    }


    if (difference < 86400) {

        const hours =
            Math.floor(
                difference / 3600
            );

        return `${hours}h ago`;
    }


    if (difference < 604800) {

        const days =
            Math.floor(
                difference / 86400
            );

        return `${days}d ago`;
    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}


// =========================================
// SECURITY HELPERS
// =========================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeAttribute(value) {

    return escapeHTML(value);
}


// =========================================
// LOGOUT
// =========================================

function logout() {

    localStorage.removeItem("token");

    window.location.href =
        "login.html";
}


// =========================================
// START
// =========================================

loadPosts();
// ===============================
// DASHBOARD BUTTON FUNCTIONALITY
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    // ---------- SIDEBAR NAVIGATION ----------

    const sidebarButtons = document.querySelectorAll(".sidebar button, .sidebar-item");

    sidebarButtons.forEach(button => {
        const text = button.textContent.trim().toLowerCase();

        // Home
        if (text.includes("home")) {
            button.addEventListener("click", () => {
                window.location.href = "index.html";
            });
        }

        // Explore
        else if (text.includes("explore")) {
            button.addEventListener("click", () => {
                const searchInput = document.getElementById("searchInput");

                if (searchInput) {
                    searchInput.focus();
                    searchInput.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                } else {
                    alert("Explore is ready. Use the search bar at the top.");
                }
            });
        }

        // Create Post
        else if (text.includes("create post")) {
            button.addEventListener("click", () => {
                window.location.href = "create-post.html";
            });
        }

        // Activity
        else if (text.includes("activity")) {
            button.addEventListener("click", () => {
                alert("Activity section is coming next.");
            });
        }

        // Schedule
        else if (text.includes("schedule")) {
            button.addEventListener("click", () => {
                alert("Post Scheduling section is coming next.");
            });
        }

        // Profile
        else if (text.includes("profile")) {
            button.addEventListener("click", () => {
                alert("Your Profile section is coming next.");
            });
        }

        // Settings
        else if (text.includes("settings")) {
            button.addEventListener("click", () => {
                alert("Settings section is coming next.");
            });
        }
    });


    // ---------- NOTIFICATION BUTTON ----------

    const notificationButtons = document.querySelectorAll(
        ".notification-btn, .notification-button"
    );

    notificationButtons.forEach(button => {
        button.addEventListener("click", () => {
            alert("🔔 You have no new notifications.");
        });
    });


    // ---------- CREATE POST BUTTONS ----------

    const createButtons = document.querySelectorAll(
        ".create-btn, .create-post-btn, .main-create-btn"
    );

    createButtons.forEach(button => {
        button.addEventListener("click", () => {
            window.location.href = "create-post.html";
        });
    });


    // ---------- QUICK POST BUTTON ----------

    const quickPostButton = Array.from(
        document.querySelectorAll("button")
    ).find(button => {
        return button.textContent.trim().toLowerCase() === "post";
    });

    if (quickPostButton) {
        quickPostButton.addEventListener("click", () => {
            window.location.href = "create-post.html";
        });
    }


    // ---------- LIKE BUTTONS ----------

    document.addEventListener("click", (event) => {

        const button = event.target.closest(".like-btn");

        if (!button) return;

        if (button.classList.contains("liked")) {
            button.classList.remove("liked");
            button.innerHTML = "♡ Like";
        } else {
            button.classList.add("liked");
            button.innerHTML = "♥ Liked";
        }
    });


    // ---------- COMMENT BUTTONS ----------

    document.addEventListener("click", (event) => {

        const button = event.target.closest(".comment-btn");

        if (!button) return;

        const comment = prompt("Write your comment:");

        if (comment && comment.trim() !== "") {
            alert("💬 Comment added!");

            // Frontend demonstration only.
            console.log("Comment:", comment);
        }
    });


    // ---------- SHARE BUTTONS ----------
// ---------- SHARE BUTTONS ----------

document.addEventListener("click", async (event) => {

    const button = event.target.closest(".share-btn");

    if (!button) return;

    const postId = button.dataset.postId;

    if (!postId) {
        alert("Unable to create post link.");
        return;
    }

    // Create a unique link for this post
    const shareLink =
        `${window.location.origin}${window.location.pathname}?post=${postId}`;

    console.log("Generated Share Link:", shareLink);

    // Try to copy the link
    try {

        if (navigator.clipboard && window.isSecureContext) {

            await navigator.clipboard.writeText(shareLink);

            alert(
                "🔗 Post link created and copied!\n\n" +
                shareLink
            );

        } else {

            // Fallback for local development
            const textArea = document.createElement("textarea");

            textArea.value = shareLink;
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";

            document.body.appendChild(textArea);

            textArea.focus();
            textArea.select();

            document.execCommand("copy");

            document.body.removeChild(textArea);

            alert(
                "🔗 Post link created and copied!\n\n" +
                shareLink
            );
        }

    } catch (error) {

        console.error("Share Error:", error);

        // Even if copying fails, show the generated link
        prompt(
            "Copy this post link:",
            shareLink
        );
    }

});
    
    // ---------- TRENDING MENU ----------

    const trendingMenu = document.querySelector(".trending-card button");

    if (trendingMenu) {
        trendingMenu.addEventListener("click", () => {
            alert("Trending options coming soon.");
        });
    }


    // ---------- ABOUT LINKS ----------

    const aboutLinks = document.querySelectorAll(".about-card a");

    aboutLinks.forEach(link => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            alert(link.textContent + " page coming soon.");
        });
    });

});