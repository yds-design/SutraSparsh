import { adminAuthService } from "./admin-auth.service";

export interface AdminApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class AdminApiClient {
  private getHeaders(): HeadersInit {
    const adminKey = adminAuthService.getAdminKey();
    return {
      "Content-Type": "application/json",
      "x-admin-key": adminKey,
      Authorization: `Bearer ${adminKey}`,
    };
  }

  public async getMetrics(): Promise<AdminApiResponse<any>> {
    try {
      const res = await fetch("/api/admin/metrics", {
        headers: this.getHeaders(),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || "Network error fetching metrics." };
    }
  }

  public async getHealth(): Promise<AdminApiResponse<any>> {
    try {
      const res = await fetch("/api/admin/health", {
        headers: this.getHeaders(),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || "Network error fetching health status." };
    }
  }

  public async getAuditLogs(): Promise<AdminApiResponse<any>> {
    try {
      const res = await fetch("/api/admin/audit", {
        headers: this.getHeaders(),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || "Network error fetching audit logs." };
    }
  }

  public async fetchCorpus(params?: { category?: string; status?: string; limit?: number }): Promise<AdminApiResponse<any>> {
    try {
      let query = "/api/content?limit=" + (params?.limit || 100);
      if (params?.category) query += `&category=${encodeURIComponent(params.category)}`;
      const res = await fetch(query);
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || "Network error fetching corpus." };
    }
  }

  public async triggerImportJob(source: string): Promise<AdminApiResponse<any>> {
    try {
      const res = await fetch("/api/importer/jobs", {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ sourceId: source }),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to trigger import pipeline." };
    }
  }

  public async fetchDonations(): Promise<AdminApiResponse<any>> {
    try {
      const res = await fetch("/api/donations/stats", {
        headers: this.getHeaders(),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to fetch donations." };
    }
  }

  public async runReconciliation(): Promise<AdminApiResponse<any>> {
    try {
      const res = await fetch("/api/tests/data-reconciliation/run", {
        method: "POST",
        headers: this.getHeaders(),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to run reconciliation." };
    }
  }

  public async triggerBackupDrill(): Promise<AdminApiResponse<any>> {
    try {
      const res = await fetch("/api/tests/backup-restore/run", {
        method: "POST",
        headers: this.getHeaders(),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to trigger backup drill." };
    }
  }
}

export const adminApiClient = new AdminApiClient();
