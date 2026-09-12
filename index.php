<?php require_once __DIR__ . '/config.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Student Affairs Dashboard, CEU Malolos</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/style.css">
</head>
<body>

<div class="app-shell">

  <header class="top-header">
    <div class="header-top">
      <div class="brand">
        <div class="brand-mark">SA</div>
        <div class="brand-text">
          <div class="brand-title">Student Affairs Dashboard</div>
          <div class="brand-sub">Centro Escolar University &middot; Malolos</div>
        </div>
      </div>

      <div class="search-wrap">
        <input type="text" id="global-search" placeholder="Search records, complaints, documents…" autocomplete="off">
        <div class="search-results" id="search-results"></div>
      </div>

      <div class="topbar-date" id="topbar-date"></div>

      <button class="icon-btn" id="settings-btn" aria-label="Settings" title="Settings">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </button>
    </div>

    <nav class="tab-nav" id="side-nav">
      <button class="nav-item active" data-tab="overview">Overview</button>
      <button class="nav-item" data-tab="complaints">Complaints &amp; Requests</button>
      <button class="nav-item" data-tab="departments">Department Activities</button>
      <button class="nav-item" data-tab="documents">Document Tracking</button>
      <button class="nav-item" data-tab="records">Student Records</button>
      <button class="nav-item" data-tab="visitors">Visitor Log</button>
      <button class="nav-item" data-tab="confiscated">Confiscated IDs</button>
      <button class="nav-item" data-tab="tasks">Tasks</button>
    </nav>
  </header>

  <main id="app-main" class="app-main">
    <h1 id="page-title" class="page-title">Overview</h1>
    <div id="panel-container">
      <div class="loader" id="loader">
        <div class="spinner"></div>
        <p>Loading dashboard&hellip;</p>
      </div>
    </div>
  </main>
</div>

<div id="toast" class="toast"></div>

<script src="assets/app.js"></script>
</body>
</html>