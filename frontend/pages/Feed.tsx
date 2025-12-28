import { MAX_CHAR_FOR_POST } from "backend/schemas/feed.schema.js";
import Layout from "frontend/pages/Layout.js";

export default () => {
  return (
    <Layout title="Feed">
      <form
        id="post-form"
        hx-post="/post"
        hx-target=".posts-list"
        hx-swap="afterbegin"
        /* Reset form and counter only if request was successful */
        style={{
          marginBottom: "2rem",
          maxWidth: "100%",
        }}
        noValidate
      >
        <textarea
          id="post-content"
          name="content"
          placeholder="What's on your mind?"
          maxLength={MAX_CHAR_FOR_POST}
          style={{
            width: "100%",
            minHeight: "120px",
            padding: "12px",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />

        <div
          style={{
            textAlign: "right",
            fontSize: "0.8rem",
            color: "#666",
            marginBottom: "0.5rem",
          }}
        >
          <span id="char-count">0</span>/{MAX_CHAR_FOR_POST}
        </div>

        <button type="submit">Post!</button>

        <div id="form-error"></div>
      </form>

      <div
        className="posts-list"
        hx-get="/post"
        hx-trigger="load, every 5s"
        hx-swap="innerHTML"
      ></div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            const textarea = document.getElementById('post-content');
            const countSpan = document.getElementById('char-count');
            const submitBtn = document.querySelector('button[type="submit"]');
            
            // Re-runnable function for logic
            const updateCount = () => {
                if (!textarea || !countSpan) return;
                const length = textarea.value.length;
                countSpan.textContent = length;
                
                // Disable logic
                const isInvalid = length === 0 || length > ${MAX_CHAR_FOR_POST};
                if(submitBtn) {
                    submitBtn.disabled = isInvalid;
                    submitBtn.style.opacity = isInvalid ? '0.5' : '1';
                }
                
                // Color logic
                if (length >= ${MAX_CHAR_FOR_POST}) {
                  countSpan.style.color = 'red';
                  countSpan.style.fontWeight = 'bold';
                } else if (length >= ${MAX_CHAR_FOR_POST - 20}) {
                  countSpan.style.color = 'orange';
                } else {
                  countSpan.style.color = '#666'; // Reset to gray
                  countSpan.style.fontWeight = 'normal';
                }
            };

            if (textarea) {
              textarea.addEventListener('input', updateCount);
              // Run once on load
              updateCount();
              
              document.body.addEventListener('htmx:afterRequest', (event) => {
                // 1. Only act if the request came from our post form
                if (event.detail.elt.id === 'post-form') {
                  
                  // 2. Only reset if the server returned a success (2xx) code
                  if (event.detail.successful) {
                    const form = event.detail.elt;
                    form.reset();
                    
                    // 3. Re-run your existing update function to reset button & colors
                    if (typeof updateCount === 'function') {
                      updateCount(); 
                    }
                  }
                }
              });
            }
          `,
        }}
      />
    </Layout>
  );
};
