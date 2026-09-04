const form = document.getElementById("postForm");
const imageInput = document.getElementById("image");
const imagePreview = document.getElementById("imagePreview");

// ==========================================
// IMAGE PREVIEW
// ==========================================

imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];

    if (!file) {
        imagePreview.innerHTML = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        imagePreview.innerHTML = `
            <img
                src="${e.target.result}"
                alt="Image Preview"
                style="
                    width: 200px;
                    max-height: 200px;
                    object-fit: cover;
                    margin-top: 15px;
                    border-radius: 10px;
                "
            >
        `;
    };

    reader.readAsDataURL(file);
});

// ==========================================
// CREATE POST
// ==========================================

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const content = document.getElementById("content").value.trim();
    const image = imageInput.files[0];

    const token = localStorage.getItem("token");

    // Check login
    if (!token) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    // Create FormData
    const formData = new FormData();

    formData.append("title", title);
    formData.append("content", content);

    if (image) {
        formData.append("image", image);
    }

    try {
        const response = await fetch(
            "http://localhost:5000/api/posts",
            {
                method: "POST",

                headers: {
                    Authorization: `Bearer ${token}`
                },

                body: formData
            }
        );

        // Get response as text first
        const responseText = await response.text();

        console.log("Server Response:", responseText);

        let data;

        try {
            data = JSON.parse(responseText);
        } catch (error) {
            data = {
                message: responseText
            };
        }

        if (!response.ok) {
            alert(data.message || "Failed to create post.");
            return;
        }

        alert("Post created successfully!");

        form.reset();
        imagePreview.innerHTML = "";

        window.location.href = "index.html";

    } catch (error) {
        console.error("Create Post Error:", error);

        alert(
            "Cannot connect to the backend.\n\n" +
            "Make sure your server is running on port 5000."
        );
    }
});