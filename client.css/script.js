const BACKEND = "http://localhost:5000";
const PRODUCTS = [
  { id: 1, name: "Product A", desc: "Description A" },
  { id: 2, name: "Product B", desc: "Description B" },
  { id: 3, name: "Product C", desc: "Description C" }
];

function buildUI() {
  const container = document.querySelector(".product-list");
  PRODUCTS.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.dataset.id = p.id;
    card.innerHTML = `
      <h2>${p.name}</h2>
      <p>${p.desc}</p>
      <p class="avg-rating-line" style="display:none;"><strong>Avg Rating:</strong> <span class="avg-rating"></span></p>
      <div class="review-section">
        <input type="text" placeholder="Your username" class="username" />
        <textarea placeholder="Write your review..."></textarea>
        <input type="number" placeholder="Rating (1‑5)" min="1" max="5" />
        <button>Submit Review</button>
      </div>
      <div class="reviews"></div>
    `;
    card.querySelector("button").addEventListener("click", () => submitReview(p.id));
    container.appendChild(card);
    fetchReviews(p.id);
  });
}

async function fetchReviews(id) {
  const resp = await fetch(`${BACKEND}/reviews/${id}`);
  const { reviews, averageRating } = await resp.json();
  const card = document.querySelector(`.product-card[data-id="${id}"]`);
  const avgText = card.querySelector(".avg-rating");
  const avgLine = card.querySelector(".avg-rating-line");

  if (averageRating) {
    avgText.textContent = averageRating;
    avgLine.style.display = "block";
  } else {
    avgLine.style.display = "none";
  }

  const revDiv = card.querySelector(".reviews");
  revDiv.innerHTML = "";
  reviews.forEach(r => {
    const div = document.createElement("div");
    div.className = "single-review";
    div.innerHTML = `
      <p><strong>${r.username}</strong> rated ${r.rating || 'N/A'}</p>
      <p>${r.review || ''}</p>
      <small>${new Date(r.created_at).toLocaleString()}</small>
    `;
    revDiv.appendChild(div);
  });
}

async function submitReview(id) {
  const card = document.querySelector(`.product-card[data-id="${id}"]`);
  const username = card.querySelector(".username").value.trim();
  const reviewTxt = card.querySelector("textarea").value.trim();
  const ratingNum = parseInt(card.querySelector("input[type=number]").value);

  if (!username) {
    return alert("Username is required");
  }
  if (!reviewTxt && isNaN(ratingNum)) {
    return alert("Enter rating or review or both");
  }
  if (!isNaN(ratingNum) && (ratingNum < 1 || ratingNum > 5)) {
    return alert("Enter rating between 1 and 5");
  }

  const res = await fetch(`${BACKEND}/submit-review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId: id, username, rating: ratingNum || null, review: reviewTxt || null })
  });
  const data = await res.json();
  if (!res.ok) return alert(data.message);

  alert(data.message);
  card.querySelector(".username").value = "";
  card.querySelector("textarea").value = "";
  card.querySelector("input[type=number]").value = "";
  fetchReviews(id);
}

document.addEventListener("DOMContentLoaded", buildUI);
