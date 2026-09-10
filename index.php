<?php require_once __DIR__ . '/config.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Student Affairs Dashboard — CEU Malolos</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/style.css">
</head>
<body>

<div class="app-shell">

  <aside class="sidebar" id="sidebar">
    <div class="brand">
      <div class="brand-mark">SA</div>
      <div class="brand-text">
        <div class="brand-title">Student Affairs</div>
        <div class="brand-sub">CEU Malolos</div>
      </div>
    </div>

    <nav class="side-nav" id="side-nav">
      <button class="nav-item active" data-tab="overview"><i data-icon="grid"></i><span>Overview</span></button>
      <button class="nav-item" data-tab="complaints"><i data-icon="flag"></i><span>Complaints &amp; Requests</span></button>
      <button class="nav-item" data-tab="departments"><i data-icon="building"></i><span>Department Activities</span></button>
      <button class="nav-item" data-tab="documents"><i data-icon="folder"></i><span>Document Tracking</span></button>
      <button class="nav-item" data-tab="records"><i data-icon="folder"></i><span>Student Records</span></button>
      <button class="nav-item" data-tab="visitors"><i data-icon="user"></i><span>Visitor Log</span></button>
      <button class="nav-item" data-tab="confiscated"><i data-icon="lock"></i><span>Confiscated IDs</span></button>
      <button class="nav-item" data-tab="tasks"><i data-icon="check"></i><span>Tasks</span></button>
      <button class="nav-item" data-tab="settings"><i data-icon="settings"></i><span>Settings</span></button>
    </nav>
  </aside>

  <div class="main-col">
    <header class="topbar">
      <button class="menu-toggle" id="menu-toggle" aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </button>
      <h1 id="page-title">Overview</h1>
      <div class="search-wrap">
        <input type="text" id="global-search" placeholder="Search records, complaints, documents…" autocomplete="off">
        <div class="search-results" id="search-results"></div>
      </div>
      <div class="topbar-date" id="topbar-date"></div>
    </header>

    <main id="app-main" class="app-main">
      <div class="loader" id="loader">
        <div class="spinner"></div>
        <p>Loading dashboard&hellip;</p>
      </div>
    </main>
  </div>
</div>

<div id="toast" class="toast"></div>

<script src="assets/app.js"></script>
</body>
</html>