const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

async function loadPost() {

    const response = await fetch(`https://sejal-gram.onrender.com/api/posts/${postId}`);
    const data = await response.json();
    const post = data.post;

    document.getElementById("title").value = post.title;
    document.getElementById("content").value = post.content;

}

loadPost();

document.getElementById("editForm").addEventListener("submit", async (e) => {

    e.preventDefault();

    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;

    const response = await fetch(`https://sejal-gram.onrender.com/api/posts/${postId}`, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },

        body: JSON.stringify({
            title,
            content
        })

    });

    const data = await response.json();

    alert(data.message);

    if(response.ok){
        window.location.href="index.html";
    }

});