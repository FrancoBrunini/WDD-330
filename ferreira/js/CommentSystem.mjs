export default class CommentSystem {
  
  constructor(productId, selector) {
    this.productId = productId;
    this.container = document.querySelector(selector);
    this.storageKey = `comments_${this.productId}`;
  }

  init() {
    if (!this.container) return;
    this.render();
    this.listenForSubmissions();
  }

  getComments() {
    return JSON.parse(localStorage.getItem(this.storageKey)) || [];
  }

  saveComment(author, text) {
    const comments = this.getComments();
    const newComment = {
      id: Date.now(),
      author: author.trim() || "Anonymous",
      text: text.trim(),
      date: new Date().toLocaleDateString()
    };
    comments.push(newComment);
    localStorage.setItem(this.storageKey, JSON.stringify(comments));
  }

  render() {
    const comments = this.getComments();

    this.container.innerHTML = `
      <section class="comments-section">
        <h3>Customer Comments (${comments.length})</h3>
        
        <form id="add-comment-form" class="comment-form">
          <input type="text" id="comment-author" placeholder="Your name (optional)" />
          <textarea id="comment-text" placeholder="Write your comment here..." required rows="3"></textarea>
          <button type="submit">Submit Comment</button>
        </form>

        <div class="comments-list">
          ${
            comments.length === 0
              ? `<p class="no-comments">No comments yet. Be the first to leave one!</p>`
              : comments
                  .map(
                    (c) => `
                <div class="comment-card">
                  <div class="comment-header">
                    <strong>${c.author}</strong>
                    <span class="comment-date">${c.date}</span>
                  </div>
                  <p class="comment-body">${c.text}</p>
                </div>
              `
                  )
                  .join("")
          }
        </div>
      </section>
    `;
  }

  listenForSubmissions() {
    const form = this.container.querySelector("#add-comment-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const authorInput = form.querySelector("#comment-author");
      const textInput = form.querySelector("#comment-text");

      if (textInput.value.trim() !== "") {
        this.saveComment(authorInput.value, textInput.value);
        this.render(); 
        this.listenForSubmissions(); 
      }
    });
  }
}