import { UserTable, ConfigTable, LicenseAgreementTable } from "./schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

export async function seed(db: PostgresJsDatabase<Record<string, never>>) {
  console.log("🌱 Seeding base data...");

  await db.insert(ConfigTable).values([
    {
      id: 1,
      key: "Similie",
      siteName: "Hyphen",
      siteDescription: "Hyphen Command Center",
      publicSite: false,
      defaultRole: 1,
      defaultTheme: "light",
      defaultLocaleName: "en",
      apiBaseUrl: "/api/v1",
      twoFactorAuth: false,
      applicationURL: "http://localhost:5173",
      applicationApi: "http://localhost:1612/api/v2/",
      logos: {
        nav: "/similie-sm.png",
        header: "/favicon.png",
        darkNav: "/similie-sm-dark.png",
        darkHeader: "/favicon.png",
      },
      location:
        "Avenida de Portugal, Markone, Pantai Kelapa\nDili, Timor-Leste",
      coordinates: { lat: "-8.5486572", lng: "125.5582196" },
      googleMapsKey: "",
    },
  ]);

  await db.insert(UserTable).values([
    {
      uid: "301e149b-a10d-41b8-a6f6-a47a7317ab95",
      name: "Hyphen Admin",
      email: "not-an-email@similie.org", // Change to your desired admin email
      phone: null,
      username: "hyphenadmin",
      password: "$2a$12$FXPgiq1Zw.TtKX3iud.16ehiVhe9qK6fjT4gr9bemQvZt9RXnkfUy", // Admin1234
      resetPassword: false,
      active: true,
      role: 5,
      avatar: null,
      bio: null,
      optOut: false,
      registered: false,
      application: null,
      applicationComplete: false,
    },
  ]);

  await db.insert(LicenseAgreementTable).values([
    {
      name: "Hyphen Command Center License Agreement",
      config: 1,
      description: "Default license agreement for Hyphen Command Center",
      active: true,
      content: `# Hyphen Command Center License
      
Copyright (c) 2025 **Similie**

---

## License Summary

Hyphen Command Center is an open-source software project developed and maintained by **Similie**.  
This software is distributed under the terms of the **GNU General Public License v3 (GPLv3)**,  
with additional terms specific to commercial use as described below.

---

## 1. Open Source Use

You are free to:
- **Use**, **copy**, **modify**, and **redistribute** this software and its source code
- **Contribute** improvements or derivatives back to the open-source community

These freedoms are protected under the GPLv3 license.  
Your use of the software implies acceptance of the GPLv3 terms.

The full text of the GPLv3 license can be found here:  
https://www.gnu.org/licenses/gpl-3.0.en.html

---

## 2. Commercial Use and Compensation

Use of Hyphen Command Center or any of its derivatives in a **commercial**, **for-profit**, or **proprietary** context  
requires a separate **commercial license** from **Similie**.

Commercial use includes, but is not limited to:
- Integrating this software into a product or service offered for sale
- Hosting or distributing the software as part of a paid service
- Using this software to provide paid consulting, integration, or platform services

If you wish to use this software commercially, please contact:  
📧 **info@similie.org**

---

## 3. Contributions

All contributions to the Hyphen Command Center project are subject to the same license.  
By submitting contributions, you agree that they will be released under the GPLv3 with  
the same commercial compensation terms described herein.

---

## 4. No Warranty

This software is provided **"as is"**, without any warranty of any kind, express or implied.  
Similie and its contributors shall not be liable for any damages arising from the use of this software.

---

## 5. Attribution

When redistributing or referencing this software, please include the following attribution:

> **Hyphen Command Center**  
> Developed by [Similie](https://similie.com) — Building climate-resilient communities through open technology.  
> © 2025 Similie. Licensed under GPL v3 with additional commercial use terms.

---

## Summary

| Use Case | Allowed | Notes |
|-----------|----------|-------|
| Personal / educational use | ✅ | Fully permitted under GPL v3 |
| Research or nonprofit collaboration | ✅ | Encouraged |
| Open-source forks and contributions | ✅ | Must remain GPL v3 |
| Commercial or for-profit use | ⚠️ | Requires commercial license from Similie |
| Warranty / liability | ❌ | Provided “as is” |

---

© 2025 Similie — All Rights Reserved`,
    },
  ]);

  console.log("✅ Seed complete.");
}
