import fs from "fs";
import path from "path";

const projectRoot = process.cwd();

const moves = [
  // Landing
  { old: "src/pages/Landing.tsx", new: "src/pages/landing/Landing.tsx" },
  { old: "src/components/Hero.tsx", new: "src/pages/landing/components/Hero.tsx" },
  { old: "src/components/Features.tsx", new: "src/pages/landing/components/Features.tsx" },
  { old: "src/components/Contact.tsx", new: "src/pages/landing/components/Contact.tsx" },
  
  // Auth
  { old: "src/pages/AuthLayout.tsx", new: "src/pages/auth/AuthLayout.tsx" },
  { old: "src/components/Login.tsx", new: "src/pages/auth/Login.tsx" },
  { old: "src/components/Register.tsx", new: "src/pages/auth/Register.tsx" },
  
  // Dashboard
  { old: "src/pages/Dashboard.tsx", new: "src/pages/dashboard/Dashboard.tsx" },
  { old: "src/pages/AccountsPage.tsx", new: "src/pages/dashboard/AccountsPage.tsx" },
  { old: "src/pages/Transactions.tsx", new: "src/pages/dashboard/Transactions.tsx" },
  { old: "src/pages/TransfersPage.tsx", new: "src/pages/dashboard/TransfersPage.tsx" },
  { old: "src/pages/ExchangePage.tsx", new: "src/pages/dashboard/ExchangePage.tsx" },
  { old: "src/pages/SettingsPage.tsx", new: "src/pages/dashboard/SettingsPage.tsx" },
  
  // Admin Dashboard
  { old: "src/pages/AdminDashboardPage.tsx", new: "src/pages/admin/dashboard/AdminDashboardPage.tsx" },
  { old: "src/pages/AccountsAdminPage.tsx", new: "src/pages/admin/accounts/AccountsAdminPage.tsx" },
  { old: "src/pages/TransactionsAdminPage.tsx", new: "src/pages/admin/transactions/TransactionsAdminPage.tsx" },
  { old: "src/features/fraud/AdminFraudPage.tsx", new: "src/pages/admin/fraud/AdminFraudPage.tsx" },
  { old: "src/pages/FraudPage.tsx", new: "src/pages/admin/fraud/AdminFraudPage.tsx" },
  { old: "src/pages/KYCPage.tsx", new: "src/pages/admin/kyc/KYCPage.tsx" },
  { old: "src/pages/SettingsAdminPage.tsx", new: "src/pages/admin/settings/SettingsAdminPage.tsx" },
  
  // Shared
  { old: "src/components/Navbar.tsx", new: "src/components/shared/Navbar.tsx" },
  { old: "src/components/Footer.tsx", new: "src/components/shared/Footer.tsx" },
];

function safeMove(oldPath, newPath) {
  const fullOld = path.join(projectRoot, oldPath);
  const fullNew = path.join(projectRoot, newPath);

  if (!fs.existsSync(fullOld)) return;

  fs.mkdirSync(path.dirname(fullNew), { recursive: true });

  if (fs.existsSync(fullNew)) {
    console.log(`⚠️ Skipped (already exists): ${newPath}`);
    return;
  }

  fs.renameSync(fullOld, fullNew);
  console.log(`✅ Moved: ${oldPath} → ${newPath}`);
}

function replaceImportsInFile(filePath, replacements) {
  const fullPath = path.join(projectRoot, filePath);
  if (!fs.existsSync(fullPath)) return;

  let content = fs.readFileSync(fullPath, "utf-8");
  for (const [from, to] of replacements) {
    content = content.split(from).join(to);
  }
  fs.writeFileSync(fullPath, content);
}

function run() {
  console.log("🚀 Starting safe refactor...");

  // 1. Move files safely
  for (const m of moves) {
    safeMove(m.old, m.new);
  }

  // 2. Update App.tsx safely using replaces
  console.log("🛠 Updating App.tsx...");
  const appPath = path.join(projectRoot, "src/App.tsx");
  if (fs.existsSync(appPath)) {
    let app = fs.readFileSync(appPath, "utf-8");

    app = app
      .replace(/from '\.\/pages\/Landing'/g, "from './pages/landing/Landing'")
      .replace(/from '\.\/pages\/AuthLayout'/g, "from './pages/auth/AuthLayout'")
      .replace(/from '\.\/pages\/Dashboard'/g, "from './pages/dashboard/Dashboard'")
      .replace(/from '\.\/pages\/Transactions'/g, "from './pages/dashboard/Transactions'")
      .replace(/from '\.\/pages\/TransfersPage'/g, "from './pages/dashboard/TransfersPage'")
      .replace(/from '\.\/pages\/AccountsPage'/g, "from './pages/dashboard/AccountsPage'")
      .replace(/from '\.\/pages\/ExchangePage'/g, "from './pages/dashboard/ExchangePage'")
      .replace(/from '\.\/pages\/SettingsPage'/g, "from './pages/dashboard/SettingsPage'")
      
      .replace(/from '\.\/pages\/AdminDashboardPage'/g, "from './pages/admin/dashboard/AdminDashboardPage'")
      .replace(/from '\.\/pages\/AccountsAdminPage'/g, "from './pages/admin/accounts/AccountsAdminPage'")
      .replace(/from '\.\/pages\/TransactionsAdminPage'/g, "from './pages/admin/transactions/TransactionsAdminPage'")
      .replace(/from '\.\/features\/fraud\/AdminFraudPage'/g, "from './pages/admin/fraud/AdminFraudPage'")
      .replace(/from '\.\/pages\/KYCPage'/g, "from './pages/admin/kyc/KYCPage'")
      .replace(/from '\.\/pages\/SettingsAdminPage'/g, "from './pages/admin/settings/SettingsAdminPage'");

    fs.writeFileSync(appPath, app);
    console.log("✅ App.tsx updated");
  }

  // 3. Fix Layouts
  replaceImportsInFile("src/components/layout/DashboardLayout.tsx", [
    ["from '../Navbar'", "from '../shared/Navbar'"],
    ["from '../Footer'", "from '../shared/Footer'"],
  ]);
  
  replaceImportsInFile("src/components/layout/AdminLayout.tsx", [
    ["from '../../pages/AdminSidebar'", "from '../../pages/admin/components/AdminSidebar'"],
    ["from '../../pages/admin/components/AdminSidebar'", "from '../../pages/admin/components/AdminSidebar'"]
  ]);

  // 4. Fix Landing components
  replaceImportsInFile("src/pages/landing/Landing.tsx", [
    ["from '../components/Navbar'", "from '../../components/shared/Navbar'"],
    ["from '../components/Hero'", "from './components/Hero'"],
    ["from '../components/Features'", "from './components/Features'"],
    ["from '../components/Contact'", "from './components/Contact'"],
    ["from '../components/Footer'", "from '../../components/shared/Footer'"]
  ]);

  // 5. Fix Auth Components
  replaceImportsInFile("src/pages/auth/AuthLayout.tsx", [
    ["from '../components/Login'", "from './Login'"],
    ["from '../components/Register'", "from './Register'"],
    ["from './Login'", "from './Login'"],
    ["from './Register'", "from './Register'"]
  ]);

  replaceImportsInFile("src/pages/auth/Login.tsx", [
    ["from '../components/layout", "from '../../components/layout"]
  ]);
  replaceImportsInFile("src/pages/auth/Register.tsx", [
    ["from '../components/layout", "from '../../components/layout"]
  ]);

  // 6. Fix any Dashboard Pages that might have imported Navbar or Footer locally
  replaceImportsInFile("src/pages/dashboard/Dashboard.tsx", [
    ["from '../../components/Navbar'", "from '../../components/shared/Navbar'"],
    ["from '../../components/Footer'", "from '../../components/shared/Footer'"]
  ]);

  console.log(" Refactor completed safely!");
}

run();
