const form = document.getElementById("password-form");
const message = document.getElementById("message");
const tableBody = document.getElementById("password-table-body");
const entryIdInput = document.getElementById("entry-id");
const submitButton = document.getElementById("submit-btn");
const cancelEditButton = document.getElementById("cancel-edit-btn");
let editingId = null;

function showMessage(text, type = "success") {
  message.textContent = text;
  message.className = `message ${type}`;
}

function resetForm() {
  form.reset();
  editingId = null;
  entryIdInput.value = "";
  submitButton.textContent = "Save Password";
  cancelEditButton.classList.add("hidden");
}

async function loadPasswords() {
  try {
    const response = await fetch("/api/passwords");
    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Invalid response from server");
    }

    if (data.length === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="5">No passwords saved yet.</td></tr>';
      return;
    }

    tableBody.innerHTML = data
      .map(
        (item) => `
          <tr>
            <td>${item.site}</td>
            <td>${item.username}</td>
            <td>${"•".repeat(Math.max(item.password.length, 8))}</td>
            <td>${item.created_at}</td>
            <td>
              <button class="secondary-btn" onclick="editPassword('${item.id}')">Edit</button>
              <button class="delete-btn" onclick="deletePassword('${item.id}')">Delete</button>
            </td>
          </tr>
        `,
      )
      .join("");
  } catch (error) {
    showMessage(error.message, "error");
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    site: document.getElementById("site").value.trim(),
    username: document.getElementById("username").value.trim(),
    password: document.getElementById("password").value.trim(),
  };

  try {
    const url = editingId ? `/api/passwords/${editingId}` : "/api/passwords";
    const method = editingId ? "PUT" : "POST";
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Unable to save password");
    }

    resetForm();
    showMessage(
      editingId
        ? "Password updated successfully!"
        : "Password saved successfully!",
    );
    loadPasswords();
  } catch (error) {
    showMessage(error.message, "error");
  }
});

window.editPassword = async function (id) {
  try {
    const response = await fetch("/api/passwords");
    const data = await response.json();
    const item = data.find((entry) => entry.id === id);

    if (!item) {
      throw new Error("Password not found");
    }

    document.getElementById("site").value = item.site;
    document.getElementById("username").value = item.username;
    document.getElementById("password").value = item.password;
    entryIdInput.value = item.id;
    editingId = item.id;
    submitButton.textContent = "Update Password";
    cancelEditButton.classList.remove("hidden");
    showMessage("Editing password...");
  } catch (error) {
    showMessage(error.message, "error");
  }
};

window.deletePassword = async function (id) {
  try {
    const response = await fetch(`/api/passwords/${id}`, { method: "DELETE" });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to delete password");
    }

    showMessage("Password deleted successfully!");
    loadPasswords();
  } catch (error) {
    showMessage(error.message, "error");
  }
};

cancelEditButton.addEventListener("click", () => {
  resetForm();
  showMessage("Edit cancelled");
});

loadPasswords();
