import type { AdminRole, AdminDomain, AdminAction, AdminUser, AdminAuditEntry } from "../types/admin";

export const ROLE_PERMISSIONS: Record<AdminRole, Record<AdminDomain, AdminAction[]>> = {
  SUPER_ADMIN: {
    dashboard: ["view", "export"],
    content: ["view", "create", "edit", "delete", "publish", "export"],
    imports: ["view", "create", "execute", "export"],
    users: ["view", "create", "edit", "delete", "export"],
    monetization: ["view", "create", "edit", "execute", "export"],
    operations: ["view", "execute", "export"],
    settings: ["view", "create", "edit", "delete"],
  },
  CONTENT_ADMIN: {
    dashboard: ["view"],
    content: ["view", "create", "edit", "delete", "publish", "export"],
    imports: ["view"],
    users: ["view"],
    monetization: [],
    operations: ["view"],
    settings: [],
  },
  IMPORT_ADMIN: {
    dashboard: ["view"],
    content: ["view"],
    imports: ["view", "create", "execute", "export"],
    users: [],
    monetization: [],
    operations: ["view"],
    settings: [],
  },
  OPERATIONS_ADMIN: {
    dashboard: ["view", "export"],
    content: ["view"],
    imports: ["view", "execute"],
    users: ["view"],
    monetization: ["view"],
    operations: ["view", "execute", "export"],
    settings: ["view", "edit"],
  },
  MONETIZATION_ADMIN: {
    dashboard: ["view", "export"],
    content: ["view"],
    imports: [],
    users: ["view", "edit"],
    monetization: ["view", "create", "edit", "execute", "export"],
    operations: ["view"],
    settings: [],
  },
  SUPPORT_ADMIN: {
    dashboard: ["view"],
    content: ["view"],
    imports: [],
    users: ["view", "edit"],
    monetization: ["view"],
    operations: ["view"],
    settings: [],
  },
};

const DEFAULT_ADMIN_USERS: AdminUser[] = [
  {
    id: "adm-001",
    name: "Acharya Vishwanath",
    email: "superadmin@sutrasparsh.com",
    role: "SUPER_ADMIN",
    mfaEnabled: true,
    lastLoginAt: new Date().toISOString(),
  },
  {
    id: "adm-002",
    name: "Dr. Ananya Sharma (Sanskrit Scholar)",
    email: "content@sutrasparsh.com",
    role: "CONTENT_ADMIN",
    assignedTraditions: ["Bhagavad Gita", "Patanjali Yoga", "Upanishads"],
    mfaEnabled: true,
    lastLoginAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "adm-003",
    name: "Rohan Varma (DevOps & SRE)",
    email: "ops@sutrasparsh.com",
    role: "OPERATIONS_ADMIN",
    mfaEnabled: true,
    lastLoginAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "adm-004",
    name: "Meera Sen (Monetization & Seva Lead)",
    email: "monetization@sutrasparsh.com",
    role: "MONETIZATION_ADMIN",
    mfaEnabled: true,
    lastLoginAt: new Date(Date.now() - 14400000).toISOString(),
  },
];

class AdminAuthService {
  private currentUser: AdminUser;
  private adminKey: string = "sutrasparsh-admin-secret";
  private auditTrail: AdminAuditEntry[] = [];

  constructor() {
    this.currentUser = DEFAULT_ADMIN_USERS[0];
    this.seedInitialAudits();
  }

  private seedInitialAudits() {
    this.auditTrail = [
      {
        id: `aud-${Date.now() - 120000}`,
        timestamp: new Date(Date.now() - 120000).toISOString(),
        actorId: "adm-001",
        actorName: "Acharya Vishwanath",
        actorRole: "SUPER_ADMIN",
        domain: "content",
        action: "PUBLISH_VERSE",
        resourceId: "gita-2-47",
        details: { verse: "BG 2.47", language: "sa", status: "PUBLISHED" },
        status: "SUCCESS",
      },
      {
        id: `aud-${Date.now() - 80000}`,
        timestamp: new Date(Date.now() - 80000).toISOString(),
        actorId: "adm-004",
        actorName: "Meera Sen",
        actorRole: "MONETIZATION_ADMIN",
        domain: "monetization",
        action: "GENERATE_80G_RECEIPT",
        resourceId: "don_seva_8819",
        details: { amount: 5100, donor: "Rajesh K.", exemptionCode: "80G-VEDA-2026" },
        status: "SUCCESS",
      },
      {
        id: `aud-${Date.now() - 30000}`,
        timestamp: new Date(Date.now() - 30000).toISOString(),
        actorId: "adm-003",
        actorName: "Rohan Varma",
        actorRole: "OPERATIONS_ADMIN",
        domain: "operations",
        action: "RUN_E2E_SMOKE_TEST",
        resourceId: "test-run-m21",
        details: { passRate: "100%", latencyAvg: "38ms" },
        status: "SUCCESS",
      },
    ];
  }

  public getCurrentUser(): AdminUser {
    return this.currentUser;
  }

  public switchAdminRole(role: AdminRole) {
    const matched = DEFAULT_ADMIN_USERS.find((u) => u.role === role);
    if (matched) {
      this.currentUser = matched;
    } else {
      this.currentUser = {
        id: `adm-custom-${Date.now()}`,
        name: `Operator (${role.replace("_", " ")})`,
        email: `${role.toLowerCase()}@sutrasparsh.com`,
        role,
        mfaEnabled: true,
        lastLoginAt: new Date().toISOString(),
      };
    }
    this.logAudit(
      "settings",
      "SWITCH_ROLE_PERSONA",
      `Switched active simulation persona to ${role}`,
      { role }
    );
  }

  public getAdminKey(): string {
    return this.adminKey;
  }

  public setAdminKey(key: string) {
    this.adminKey = key;
  }

  public hasPermission(domain: AdminDomain, action: AdminAction = "view"): boolean {
    const role = this.currentUser.role;
    const permissions = ROLE_PERMISSIONS[role]?.[domain] || [];
    return permissions.includes(action);
  }

  public canAccessDomain(domain: AdminDomain): boolean {
    return this.hasPermission(domain, "view");
  }

  public logAudit(
    domain: AdminDomain,
    action: string,
    description: string,
    details: Record<string, unknown> = {},
    status: "SUCCESS" | "DENIED" | "FAILED" = "SUCCESS"
  ): AdminAuditEntry {
    const entry: AdminAuditEntry = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      actorId: this.currentUser.id,
      actorName: this.currentUser.name,
      actorRole: this.currentUser.role,
      domain,
      action,
      details: { description, ...details },
      status,
    };
    this.auditTrail = [entry, ...this.auditTrail.slice(0, 99)];
    return entry;
  }

  public getAuditTrail(): AdminAuditEntry[] {
    return this.auditTrail;
  }
}

export const adminAuthService = new AdminAuthService();
