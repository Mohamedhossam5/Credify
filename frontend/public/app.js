// ─── State ───────────────────────────────────────────────────
const API = "";  // Same origin (served by API Gateway)
let token = localStorage.getItem("credify_token") || "";
let currentUser = null;
let cameraStream = null;

// ─── DOM Elements ────────────────────────────────────────────
const $ = (sel) => document.querySelector(sel);
const authSection = $("#auth-section");
const kycSection = $("#kyc-section");
const adminSection = $("#admin-section");
const loginForm = $("#login-form");
const registerForm = $("#register-form");
const authError = $("#auth-error");
const toastEl = $("#toast");

// ─── Boot ────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  setupAuth();
  setupFileInputs();
  setupCamera();
  setupUploads();
  $("#logout-btn").addEventListener("click", logout);
  $("#logout-admin-btn").addEventListener("click", logout);
  const lbb = $("#logout-bank-btn");
  if(lbb) lbb.addEventListener("click", logout);
  $("#admin-tab").addEventListener("click", showAdmin);
  const bat = $("#bank-admin-tab");
  if(bat) bat.addEventListener("click", showAdmin);
  const bpb = $("#back-profile-btn");
  if(bpb) bpb.addEventListener("click", () => {
    if (currentUser.kyc_status === 'APPROVED' || currentUser.kycStatus === 'APPROVED') showBankingDashboard();
    else showKYC();
  });
  $("#kyc-tab").addEventListener("click", showKYC);
  $("#refresh-admin-btn").addEventListener("click", refreshAdminList);
  const bt = $("#btn-transfer");
  if(bt) {
    bt.addEventListener("click", () => {
      alert("Test: Click registered by Javascript successfully!");
      showTransferModal();
    });
  }
  const br = $("#btn-request-card");
  if(br) br.addEventListener("click", () => toast("Credit Card requests are in beta waitlist.", "info"));
  
  const vat = $("#view-all-tx-btn");
  if(vat) vat.addEventListener("click", showTransactionsView);
  
  const bdb = $("#back-bank-dashboard-btn");
  if(bdb) bdb.addEventListener("click", showBankingDashboard);

  const lotx = $("#logout-tx-btn");
  if(lotx) lotx.addEventListener("click", logout);

  $("#refresh-tx-btn").addEventListener("click", () => fetchTransactions(null));
  
  setupTransferLogic();

  if (token) {
    fetchProfile();
  }

  // Proceed Verification Logic
  const proceedBtn = $("#proceed-btn");
  if (proceedBtn) {
    proceedBtn.addEventListener("click", async () => {
      try {
        $("#proceed-section").classList.add("hidden");
        showResult("⏳", "Verifying...", "Sit tight! Your documents are being verified by our secure AI.", true);
        await apiFetch("/api/kyc/verify", "POST");
        setTimeout(refreshKycStatus, 2000);
      } catch(err) {
        toast(err.message, "error");
        $("#proceed-section").classList.remove("hidden");
      }
    });
  }
});

// ─── Tabs ────────────────────────────────────────────────────
function setupTabs() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const target = tab.dataset.tab;
      loginForm.classList.toggle("active", target === "login");
      registerForm.classList.toggle("active", target === "register");
      authError.classList.add("hidden");
    });
  });
}

// ─── Auth ────────────────────────────────────────────────────
function setupAuth() {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    authError.classList.add("hidden");
    const btn = loginForm.querySelector("button");
    btn.textContent = "Logging in...";
    btn.disabled = true;

    try {
      const res = await apiFetch("/api/auth/login", "POST", {
        email: $("#login-email").value,
        password: $("#login-password").value,
      });
      token = res.token;
      localStorage.setItem("credify_token", token);
      currentUser = res.user;
      if (currentUser.kyc_status === 'APPROVED' || currentUser.kycStatus === 'APPROVED') {
        showBankingDashboard();
      } else {
        showKYC();
      }
      toast("Welcome back, " + currentUser.firstName + "!", "success");
    } catch (err) {
      authError.textContent = err.message;
      authError.classList.remove("hidden");
    } finally {
      btn.textContent = "Login";
      btn.disabled = false;
    }
  });

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    authError.classList.add("hidden");
    const btn = registerForm.querySelector("button");
    btn.textContent = "Creating...";
    btn.disabled = true;

    try {
      const res = await apiFetch("/api/auth/register", "POST", {
        firstName: $("#reg-firstName").value,
        lastName: $("#reg-lastName").value,
        email: $("#reg-email").value,
        password: $("#reg-password").value,
        idNumber: $("#reg-idNumber").value,
        birthdate: $("#reg-birthdate").value,
        address: $("#reg-address").value || undefined,
      });
      token = res.token;
      localStorage.setItem("credify_token", token);
      currentUser = res.user;
      if (currentUser.kyc_status === 'APPROVED' || currentUser.kycStatus === 'APPROVED') {
        showBankingDashboard();
      } else {
        showKYC();
      }
      toast("Account created! Complete your KYC verification below.", "success");
    } catch (err) {
      authError.textContent = err.message;
      authError.classList.remove("hidden");
    } finally {
      btn.textContent = "Create Account";
      btn.disabled = false;
    }
  });
}

// ─── File Inputs ─────────────────────────────────────────────
function setupFileInputs() {
  bindFileInput("#id-front", "#id-front-label", () => checkIdReady());
  bindFileInput("#id-back", "#id-back-label", () => checkIdReady());
  bindFileInput("#proof-file", "#proof-label", () => {
    $("#upload-proof-btn").disabled = false;
  });
  bindFileInput("#admin-selfie-file", "#admin-selfie-label", () => {
    if ($("#admin-selfie-file").files[0]) {
      $("#start-camera-btn").classList.add("hidden");
      $("#upload-selfie-btn").classList.remove("hidden");
    }
  });
}

function bindFileInput(inputSel, labelSel, onChange) {
  $(inputSel).addEventListener("change", (e) => {
    const file = e.target.files[0];
    const label = $(labelSel);
    const parent = label.closest(".file-upload");
    if (file) {
      label.textContent = "✅ " + file.name;
      parent.classList.add("selected");
    } else {
      label.textContent = labelSel.includes("front") ? "📷 Front Side" : labelSel.includes("back") ? "📷 Back Side" : "📎 Choose Document";
      parent.classList.remove("selected");
    }
    onChange();
  });
}

function checkIdReady() {
  const front = $("#id-front").files[0];
  const back = $("#id-back").files[0];
  $("#upload-id-btn").disabled = !(front && back);
}

// ─── Camera ──────────────────────────────────────────────────
function setupCamera() {
  $("#start-camera-btn").addEventListener("click", startCamera);
  $("#capture-btn").addEventListener("click", capturePhoto);
  $("#retake-btn").addEventListener("click", retakePhoto);
}

async function startCamera() {
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: true // using `true` instead of specific constraints allows ANY virtual camera like OBS
    });
    const video = $("#camera-feed");
    video.srcObject = cameraStream;
    $("#camera-container").classList.remove("hidden");
    $("#start-camera-btn").classList.add("hidden");
    $("#capture-btn").classList.remove("hidden");
    $("#selfie-preview").classList.add("hidden");
    $("#retake-btn").classList.add("hidden");
    $("#upload-selfie-btn").classList.add("hidden");
  } catch (err) {
    console.error("Camera error:", err);
    toast("Camera Error: " + (err.name || err.message || err), "error");
  }
}

function capturePhoto() {
  const video = $("#camera-feed");
  const canvas = $("#camera-canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0);

  const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
  $("#selfie-preview").src = dataUrl;
  $("#selfie-preview").classList.remove("hidden");
  $("#camera-container").classList.add("hidden");
  $("#capture-btn").classList.add("hidden");
  $("#retake-btn").classList.remove("hidden");
  $("#upload-selfie-btn").classList.remove("hidden");

  // Stop camera
  if (cameraStream) {
    cameraStream.getTracks().forEach((t) => t.stop());
    cameraStream = null;
  }
}

function retakePhoto() {
  $("#selfie-preview").classList.add("hidden");
  $("#retake-btn").classList.add("hidden");
  $("#upload-selfie-btn").classList.add("hidden");
  startCamera();
}

// ─── Uploads ─────────────────────────────────────────────────
function setupUploads() {
  // National ID
  $("#upload-id-btn").addEventListener("click", async () => {
    const btn = $("#upload-id-btn");
    btn.textContent = "Uploading...";
    btn.disabled = true;
    try {
      const form = new FormData();
      form.append("front", $("#id-front").files[0]);
      form.append("back", $("#id-back").files[0]);
      await apiUpload("/api/kyc/upload/national-id", form);
      toast("National ID uploaded!", "success");
      refreshKycStatus();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      btn.textContent = "Upload National ID";
      btn.disabled = false;
    }
  });

  // Face Selfie
  $("#upload-selfie-btn").addEventListener("click", async () => {
    const btn = $("#upload-selfie-btn");
    btn.textContent = "Uploading...";
    btn.disabled = true;
    try {
      const form = new FormData();
      const adminFile = $("#admin-selfie-file");
      if (adminFile && adminFile.files[0]) {
        form.append("selfie", adminFile.files[0]);
      } else {
        const canvas = $("#camera-canvas");
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
        form.append("selfie", blob, "selfie.jpg");
      }
      await apiUpload("/api/kyc/upload/face-selfie", form);
      toast("Selfie uploaded! Face verification in progress...", "info");
      refreshKycStatus();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      btn.textContent = "Upload Selfie";
      btn.disabled = false;
    }
  });

  // Proof of Address
  $("#upload-proof-btn").addEventListener("click", async () => {
    const btn = $("#upload-proof-btn");
    btn.textContent = "Uploading...";
    btn.disabled = true;
    try {
      const form = new FormData();
      form.append("document", $("#proof-file").files[0]);
      await apiUpload("/api/kyc/upload/proof-of-address", form);
      toast("Proof of address uploaded!", "success");
      refreshKycStatus();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      btn.textContent = "Upload Document";
      btn.disabled = false;
    }
  });
}

// ─── KYC Status ──────────────────────────────────────────────
async function refreshKycStatus() {
  try {
    const res = await apiFetch("/api/kyc/status", "GET");
    updateKycUI(res);
  } catch (err) {
    console.error("Failed to fetch KYC status:", err);
  }
}

function updateKycUI(data) {
  // Badge
  const badge = $("#kyc-status-badge");
  badge.textContent = data.status.replace(/_/g, " ");
  badge.className = "status-badge " + data.status.toLowerCase();

  // Steps
  const docs = data.documents;
  toggleStepDone("step-id", docs.nationalIdFront && docs.nationalIdBack);
  toggleStepDone("step-selfie", docs.faceSelfie);
  toggleStepDone("step-proof", docs.proofOfAddress);
  toggleStepDone("step-review", data.status === "APPROVED" || data.status === "REJECTED");

  // Mark completed cards
  if (docs.nationalIdFront && docs.nationalIdBack) {
    $("#card-national-id").classList.add("completed");
  }
  if (docs.faceSelfie) {
    $("#card-face-selfie").classList.add("completed");
  }
  if (docs.proofOfAddress) {
    $("#card-proof").classList.add("completed");
  }

  const isComplete = docs.nationalIdFront && docs.nationalIdBack && docs.faceSelfie && docs.proofOfAddress;
  if (isComplete && data.status === "DOCUMENTS_UPLOADED") {
    const ps = $("#proceed-section");
    if (ps) ps.classList.remove("hidden");
  } else {
    const ps = $("#proceed-section");
    if (ps) ps.classList.add("hidden");
  }

  // Show result
  if (data.status === "APPROVED") {
    showResult("✅", "Verification Approved!", "Your identity has been verified. Welcome to Credify Bank!");
    if (currentUser.role !== 'ADMIN') {
      setTimeout(() => { fetchProfile(); }, 3000);
    }
  } else if (data.status === "REJECTED") {
    showResult("❌", "Verification Rejected", data.rejectionReason || "Please re-upload your documents and try again.");
  } else if (data.status === "MANUAL_REVIEW") {
    showResult("⏸️", "Under Manual Review", data.rejectionReason || "Your documents require manual verification by our team.");
  } else if (data.status === "AI_VERIFICATION_IN_PROGRESS") {
    showResult("⏳", "Verifying...", "Sit tight! Our AI is comparing your selfie with your ID photo. This may take a moment.", true);
    // Poll again after 3 seconds
    setTimeout(refreshKycStatus, 3000);
  }
}

function toggleStepDone(stepId, done) {
  const el = document.getElementById(stepId);
  el.classList.toggle("done", done);
}

function showResult(icon, title, message, isAnimating = false) {
  const el = $("#verification-result");
  el.classList.remove("hidden");
  const iconEl = $("#result-icon");
  iconEl.textContent = icon;
  
  if (isAnimating) {
    iconEl.classList.add("spinning");
  } else {
    iconEl.classList.remove("spinning");
  }

  $("#result-title").textContent = title;
  $("#result-message").textContent = message;
}

// ─── Navigation ──────────────────────────────────────────────
async function fetchProfile() {
  try {
    const res = await apiFetch("/api/auth/me", "GET");
    currentUser = res.user;
    
    if (currentUser.kyc_status === 'APPROVED' || currentUser.kycStatus === 'APPROVED') {
      showBankingDashboard();
    } else {
      showKYC();
    }
  } catch {
    logout();
  }
}

function showKYC() {
  authSection.classList.remove("active");
  if(adminSection) adminSection.classList.remove("active");
  kycSection.classList.add("active");
  $("#user-name").textContent = currentUser.firstName + " " + currentUser.lastName;
  
  if (currentUser.role === 'ADMIN') {
    $("#admin-tab").classList.remove("hidden");
    const wrapper = $("#admin-selfie-upload-wrapper");
    if(wrapper) wrapper.classList.remove("hidden");
  } else {
    $("#admin-tab").classList.add("hidden");
    const wrapper = $("#admin-selfie-upload-wrapper");
    if(wrapper) wrapper.classList.add("hidden");
  }

  refreshKycStatus();
}

function showBankingDashboard() {
  authSection.classList.remove("active");
  kycSection.classList.remove("active");
  if(adminSection) adminSection.classList.remove("active");
  const bd = $("#banking-dashboard");
  if(bd) bd.classList.add("active");
  
  const bat = $("#bank-admin-tab");
  if(bat) {
    if (currentUser.role === 'ADMIN') bat.classList.remove("hidden");
    else bat.classList.add("hidden");
  }

  $("#bank-user-name").textContent = currentUser.firstName + " " + currentUser.lastName;
  $("#bank-welcome-name").textContent = currentUser.lastName || currentUser.firstName;
  
  if (currentUser.account) {
    $("#bank-balance").textContent = "$" + parseFloat(currentUser.account.balance).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    $("#bank-account-id").textContent = currentUser.account.accountId;
  }
  
  fetchTransactions(10);
}

function showTransactionsView() {
  authSection.classList.remove("active");
  kycSection.classList.remove("active");
  if(adminSection) adminSection.classList.remove("active");
  const bd = $("#banking-dashboard");
  if(bd) bd.classList.remove("active");
  
  $("#transactions-section").classList.add("active");
  fetchTransactions(null);
}

// ─── Financial logic ─────────────────────────────────────────
function setupTransferLogic() {
  const tabs = document.querySelectorAll("#tx-tabs .tab");
  tabs.forEach(t => t.addEventListener("click", (e) => {
     tabs.forEach(btn => btn.classList.remove("active"));
     t.classList.add("active");
     
     const type = t.dataset.txTab;
     $("#tx-domestic-fields").classList.toggle("hidden", type !== "DOMESTIC" && type !== "INTERNATIONAL");
     $("#tx-intl-fields").classList.toggle("hidden", type !== "INTERNATIONAL");
     
     if(type === "DOMESTIC") {
       $("#tx-bank").placeholder = "Recipient Bank Name";
     } else if(type === "INTERNATIONAL") {
       $("#tx-bank").placeholder = "Recipient Bank Name (Intl)";
     }
  }));

  $("#close-transfer").addEventListener("click", hideTransferModal);

  $("#tx-amount").addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    $("#tx-btn-amount").textContent = isNaN(val) ? "" : " $" + val.toFixed(2);
  });

  $("#transfer-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    $("#tx-error").classList.add("hidden");
    const btn = e.target.querySelector('button[type="submit"]');
    const ogText = btn.textContent;
    btn.textContent = "Processing...";
    btn.disabled = true;

    try {
      const activeTab = document.querySelector("#tx-tabs .tab.active").dataset.txTab;
      const amount = $("#tx-amount").value;
      const res = await apiFetch("/api/transfer", "POST", {
        type: activeTab,
        amount: parseFloat(amount),
        recipientName: $("#tx-recipient").value,
        recipientAccount: $("#tx-account").value,
        recipientBank: $("#tx-bank").value,
        swiftCode: $("#tx-swift").value,
        recipientAddress: $("#tx-address").value,
        reference: $("#tx-reference").value
      });

      toast("Transfer successful!", "success");
      hideTransferModal();
      
      // Update local balance
      if (currentUser.account) {
        currentUser.account.balance -= parseFloat(amount);
        $("#bank-balance").textContent = "$" + parseFloat(currentUser.account.balance).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
      }
      
      // Refresh transactions if on dashboard
      fetchTransactions(10);
    } catch(err) {
      $("#tx-error").textContent = err.message;
      $("#tx-error").classList.remove("hidden");
    } finally {
      btn.textContent = ogText;
      btn.disabled = false;
    }
  });
}

function showTransferModal() {
  try {
    $("#transfer-form").reset();
    $("#tx-btn-amount").textContent = "";
    $("#tx-error").classList.add("hidden");
    $("#transfer-modal").classList.remove("hidden");
    console.log("Modal un-hidden successfully.");
  } catch (err) {
    alert("Error inside showTransferModal: " + err.message);
  }
}
function hideTransferModal() {
  $("#transfer-modal").classList.add("hidden");
}

async function fetchTransactions(limit = null) {
  try {
    const url = limit ? `/api/transactions?limit=${limit}` : `/api/transactions`;
    const res = await apiFetch(url, "GET");
    
    if (limit === 10) {
      populateRecentTransactions(res.transactions);
    } else {
      populateAllTransactions(res.transactions);
    }
  } catch(err) {
    console.error("Failed to fetch transactions:", err);
  }
}

function populateRecentTransactions(txs) {
  const tbody = $("#recent-tx-body");
  tbody.innerHTML = "";
  if (!txs || txs.length === 0) {
    $("#no-tx-msg").classList.remove("hidden");
    return;
  }
  $("#no-tx-msg").classList.add("hidden");
  
  txs.forEach(tx => {
    const tr = document.createElement("tr");
    const date = new Date(tx.created_at).toLocaleDateString();
    tr.innerHTML = `
      <td>${date}</td>
      <td><div style="font-weight:600">${tx.recipient_name}</div><div style="font-size:11px;color:var(--text-dim)">${tx.recipient_account}</div></td>
      <td style="color:var(--error);font-weight:600">-$${parseFloat(tx.amount).toFixed(2)}</td>
      <td><span class="status-badge" style="background:#10b98122;color:#10b981;font-size:11px">${(tx.status || 'COMPLETED')}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function populateAllTransactions(txs) {
  const tbody = $("#all-tx-body");
  tbody.innerHTML = "";
  txs.forEach(tx => {
    const tr = document.createElement("tr");
    const date = new Date(tx.created_at).toLocaleString();
    tr.innerHTML = `
      <td>${date}</td>
      <td><div style="font-weight:600">${tx.recipient_name}</div><div style="font-size:11px;color:var(--text-dim)">${tx.recipient_account}</div></td>
      <td>${tx.recipient_bank || 'Same Bank'}</td>
      <td>${tx.type.replace('_',' ')}</td>
      <td>${tx.reference || '—'}</td>
      <td style="color:var(--error);font-weight:600">-$${parseFloat(tx.amount).toFixed(2)}</td>
      <td><span class="status-badge" style="background:#10b98122;color:#10b981;font-size:11px">${(tx.status || 'COMPLETED')}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function showAdmin() {
  authSection.classList.remove("active");
  kycSection.classList.remove("active");
  adminSection.classList.add("active");
  refreshAdminList();
}

async function refreshAdminList() {
  try {
    const btn = $("#refresh-admin-btn");
    btn.textContent = "Loading...";
    const res = await apiFetch("/api/admin/dashboard", "GET");
    const tbody = $("#admin-table-body");
    tbody.innerHTML = "";
    res.users.forEach(u => {
      const tr = document.createElement("tr");
      const matchResult = u.face_match_passed === true ? '✅ Pass' : u.face_match_passed === false ? '❌ Fail' : '—';
      const joined = u.created_at ? new Date(u.created_at).toLocaleDateString() : '—';
      tr.innerHTML = `
        <td>${u.id}</td>
        <td>${u.first_name} ${u.last_name}</td>
        <td>${u.email}</td>
        <td>${u.id_number || '—'}</td>
        <td><span class="status-badge ${u.kyc_app_status && u.kyc_app_status.toLowerCase()}">${(u.kyc_app_status || 'PENDING').replace(/_/g, ' ')}</span></td>
        <td>${u.face_match_score != null ? parseFloat(u.face_match_score).toFixed(4) : 'N/A'}</td>
        <td>${matchResult}</td>
        <td>${u.rejection_reason || '—'}</td>
        <td>${u.account_id || '—'}</td>
        <td>${u.balance != null ? '$' + parseFloat(u.balance).toFixed(2) : '—'}</td>
        <td>${u.role || 'USER'}</td>
        <td>${joined}</td>
      `;
      tbody.appendChild(tr);
    });
    btn.textContent = "Refresh";
  } catch (err) {
    toast(err.message, "error");
    $("#refresh-admin-btn").textContent = "Refresh";
  }
}

function logout() {
  token = "";
  currentUser = null;
  localStorage.removeItem("credify_token");
  kycSection.classList.remove("active");
  if(adminSection) adminSection.classList.remove("active");
  const bd = $("#banking-dashboard");
  if(bd) bd.classList.remove("active");
  const ts = $("#transactions-section");
  if(ts) ts.classList.remove("active");
  authSection.classList.add("active");
  if (cameraStream) {
    cameraStream.getTracks().forEach((t) => t.stop());
    cameraStream = null;
  }
}

// ─── API Helpers ─────────────────────────────────────────────
async function apiFetch(path, method, body) {
  const opts = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (token) opts.headers["Authorization"] = "Bearer " + token;
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(API + path, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.errors?.[0]?.msg || "Request failed");
  return data;
}

async function apiUpload(path, formData) {
  const res = await fetch(API + path, {
    method: "POST",
    headers: { Authorization: "Bearer " + token },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data;
}

// ─── Toast ───────────────────────────────────────────────────
function toast(msg, type = "info") {
  toastEl.textContent = msg;
  toastEl.className = "toast " + type;
  setTimeout(() => toastEl.classList.add("hidden"), 4000);
}
