// Script for loading blog posts dynamically
// Blog posts should be stored in the "blog" dir

document.addEventListener("DOMContentLoaded", function() {
  const postsContainer = document.querySelector(".posts");

  async function loadBlogPosts() {
    try {
      if (!postsContainer) {
        console.warn("Skipping blog load. Reason: .posts container not found in the DOM.");
        return;
      }

      const response = await fetch("posts.json");
      if (!response.ok) throw new Error(`Failed to fetch posts.json: ${response.status}`);
      const posts = await response.json();
      if (!Array.isArray(posts)) throw new Error("posts.json must be an array of post metadata");

      posts.sort((a, b) => {
        const da = a.date ? new Date(a.date) : new Date(0);
        const db = b.date ? new Date(b.date) : new Date(0);
        return db - da;
      });

      posts.forEach(post => {
        const isEmbed = !!post.embed;

        const postElement = isEmbed ? document.createElement("div") : document.createElement("a");
        postElement.classList.add("blog-post");
        if (!isEmbed) {
          postElement.href = `blog/${post.filename}`;
          postElement.target = "_blank";
          postElement.rel = "noopener noreferrer";
        }

        // If the post provides an embed URL (e.g., Spotify), render an iframe.
        if (isEmbed) {
          const embedWrapper = document.createElement("div");
          embedWrapper.classList.add("blog-post-embed");
          const iframe = document.createElement("iframe");
          iframe.src = post.embed;
          iframe.width = "100%";
          iframe.height = post.embedHeight || 152;
          iframe.frameBorder = "0";
          iframe.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
          iframe.loading = "lazy";
          iframe.setAttribute("referrerpolicy", "no-referrer");
          iframe.style.borderRadius = "16px";
          embedWrapper.appendChild(iframe);
          postElement.appendChild(embedWrapper);
        }

        const headerElement = document.createElement("div");
        // display title and date on the same line
        headerElement.style.display = "flex";
        headerElement.style.justifyContent = "space-between";
        headerElement.style.alignItems = "center";
        
        const titleElement = document.createElement("h3");
        titleElement.classList.add("blog-post-title", "stack-sans-text-bold");
        titleElement.textContent = post.title || "Untitled";

        const dateElement = document.createElement("span");
        dateElement.classList.add("blog-post-date");
        if (post.date) {
          const dateObj = new Date(post.date);
          if (!isNaN(dateObj)) {
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            dateElement.textContent = "Posted: " + dateObj.toLocaleDateString(undefined, options);
          }
        }

        headerElement.appendChild(titleElement);
        headerElement.appendChild(dateElement);
        postElement.appendChild(headerElement);

        const descriptionElement = document.createElement("p");
        descriptionElement.classList.add("blog-post-content");
        descriptionElement.textContent = post.description || "";

        postElement.appendChild(headerElement);
        postElement.appendChild(descriptionElement);

        if (isEmbed) {
          const readMore = document.createElement("a");
          readMore.classList.add("blog-post-link");
          readMore.href = `blog/${post.filename}`;
          readMore.target = "_blank";
          readMore.rel = "noopener noreferrer";
          readMore.textContent = "Read more";
          postElement.appendChild(readMore);
        }

        postsContainer.appendChild(postElement);
      });
    } catch (error) {
      console.error("Error loading blog posts:", error);
    }
  }

  loadBlogPosts();
});