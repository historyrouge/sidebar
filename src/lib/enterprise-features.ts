import { StorageManager, localStorage } from './storage';
import { createError, ERROR_CODES } from './error-handler';

export interface Organization {
  id: string;
  name: string;
  domain: string;
  plan: 'free' | 'pro' | 'enterprise';
  settings: OrganizationSettings;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  memberCount: number;
  isActive: boolean;
}

export interface OrganizationSettings {
  branding: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    customDomain?: string;
  };
  security: {
    enforceSSO: boolean;
    allowedDomains: string[];
    sessionTimeout: number;
    requireMFA: boolean;
    ipWhitelist: string[];
  };
  features: {
    maxUsers: number;
    maxStorage: number; // in GB
    aiModelAccess: string[];
    customModels: boolean;
    advancedAnalytics: boolean;
    prioritySupport: boolean;
  };
  compliance: {
    dataRetention: number; // in days
    auditLogging: boolean;
    gdprCompliant: boolean;
    hipaaCompliant: boolean;
    soc2Compliant: boolean;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId?: string;
  permissions: Permission[];
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, any>;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystemRole: boolean;
  organizationId?: string;
}

export interface Permission {
  id: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'execute';
  conditions?: Record<string, any>;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  organizationId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  result: 'success' | 'failure' | 'error';
  errorMessage?: string;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: any) => string;
}

export class EnterpriseManager {
  private storage: StorageManager;
  private auditLogs: AuditLog[] = [];
  private rateLimits: Map<string, { count: number; resetTime: number }> = new Map();

  constructor() {
    this.storage = localStorage;
    this.loadAuditLogs();
  }

  // Multi-tenancy Management
  async createOrganization(data: Omit<Organization, 'id' | 'createdAt' | 'updatedAt' | 'memberCount' | 'isActive'>): Promise<Organization> {
    const organization: Organization = {
      id: `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      memberCount: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.storage.set(`organization_${organization.id}`, organization);
    
    // Log organization creation
    await this.logAuditEvent({
      userId: data.ownerId,
      action: 'create_organization',
      resource: 'organization',
      resourceId: organization.id,
      details: { name: organization.name, domain: organization.domain },
      result: 'success',
    });

    return organization;
  }

  async getOrganization(organizationId: string): Promise<Organization | null> {
    return await this.storage.get<Organization>(`organization_${organizationId}`);
  }

  async updateOrganization(organizationId: string, updates: Partial<Organization>): Promise<void> {
    const organization = await this.getOrganization(organizationId);
    if (!organization) {
      throw createError(ERROR_CODES.VALIDATION_ERROR, { message: 'Organization not found' });
    }

    const updatedOrganization = {
      ...organization,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await this.storage.set(`organization_${organizationId}`, updatedOrganization);
  }

  // Role-Based Access Control (RBAC)
  async createRole(organizationId: string, roleData: Omit<UserRole, 'id' | 'organizationId'>): Promise<UserRole> {
    const role: UserRole = {
      id: `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      organizationId,
      ...roleData,
    };

    await this.storage.set(`role_${role.id}`, role);
    
    await this.logAuditEvent({
      userId: 'system',
      organizationId,
      action: 'create_role',
      resource: 'role',
      resourceId: role.id,
      details: { name: role.name, permissions: role.permissions },
      result: 'success',
    });

    return role;
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    const user = await this.storage.get<User>(`user_${userId}`);
    const role = await this.storage.get<UserRole>(`role_${roleId}`);

    if (!user || !role) {
      throw createError(ERROR_CODES.VALIDATION_ERROR, { message: 'User or role not found' });
    }

    const updatedUser = {
      ...user,
      role,
      permissions: [...user.permissions, ...role.permissions],
      updatedAt: new Date().toISOString(),
    };

    await this.storage.set(`user_${userId}`, updatedUser);

    await this.logAuditEvent({
      userId: 'system',
      organizationId: user.organizationId,
      action: 'assign_role',
      resource: 'user',
      resourceId: userId,
      details: { roleId, roleName: role.name },
      result: 'success',
    });
  }

  // Permission Checking
  async checkPermission(userId: string, resource: string, action: string): Promise<boolean> {
    const user = await this.storage.get<User>(`user_${userId}`);
    if (!user) return false;

    // Check if user has the specific permission
    const hasPermission = user.permissions.some(permission => 
      permission.resource === resource && permission.action === action
    );

    // Check role permissions
    const hasRolePermission = user.role?.permissions.some(permission =>
      permission.resource === resource && permission.action === action
    );

    const allowed = hasPermission || hasRolePermission || false;

    // Log permission check
    await this.logAuditEvent({
      userId,
      organizationId: user.organizationId,
      action: 'check_permission',
      resource: 'permission',
      details: { 
        requestedResource: resource, 
        requestedAction: action, 
        allowed 
      },
      result: allowed ? 'success' : 'failure',
    });

    return allowed;
  }

  // Audit Logging
  async logAuditEvent(eventData: Omit<AuditLog, 'id' | 'timestamp' | 'ipAddress' | 'userAgent'>): Promise<void> {
    const auditLog: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ipAddress: await this.getClientIP(),
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
      ...eventData,
    };

    this.auditLogs.push(auditLog);
    await this.storage.set(`audit_${auditLog.id}`, auditLog);

    // Keep only recent audit logs in memory
    if (this.auditLogs.length > 1000) {
      this.auditLogs = this.auditLogs.slice(-1000);
    }

    // Send to audit service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendAuditLogToService(auditLog);
    }
  }

  async getAuditLogs(filters: {
    userId?: string;
    organizationId?: string;
    action?: string;
    resource?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  } = {}): Promise<AuditLog[]> {
    const keys = await this.storage.keys();
    const auditKeys = keys.filter(key => key.startsWith('audit_'));
    
    const logs = await Promise.all(
      auditKeys.map(key => this.storage.get<AuditLog>(key))
    );

    let filteredLogs = logs.filter(Boolean) as AuditLog[];

    // Apply filters
    if (filters.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
    }
    if (filters.organizationId) {
      filteredLogs = filteredLogs.filter(log => log.organizationId === filters.organizationId);
    }
    if (filters.action) {
      filteredLogs = filteredLogs.filter(log => log.action === filters.action);
    }
    if (filters.resource) {
      filteredLogs = filteredLogs.filter(log => log.resource === filters.resource);
    }
    if (filters.startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startDate!);
    }
    if (filters.endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endDate!);
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply limit
    if (filters.limit) {
      filteredLogs = filteredLogs.slice(0, filters.limit);
    }

    return filteredLogs;
  }

  // Rate Limiting
  checkRateLimit(identifier: string, config: RateLimitConfig): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const limit = this.rateLimits.get(identifier);

    if (!limit || now > limit.resetTime) {
      // Create new limit or reset expired limit
      const newLimit = {
        count: 1,
        resetTime: now + config.windowMs,
      };
      this.rateLimits.set(identifier, newLimit);
      
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: newLimit.resetTime,
      };
    }

    if (limit.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: limit.resetTime,
      };
    }

    limit.count++;
    this.rateLimits.set(identifier, limit);

    return {
      allowed: true,
      remaining: config.maxRequests - limit.count,
      resetTime: limit.resetTime,
    };
  }

  // Data Retention and Compliance
  async enforceDataRetention(organizationId: string): Promise<number> {
    const organization = await this.getOrganization(organizationId);
    if (!organization) return 0;

    const retentionDays = organization.settings.compliance.dataRetention;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    let deletedCount = 0;

    // Clean up old audit logs
    const auditLogs = await this.getAuditLogs({ organizationId });
    for (const log of auditLogs) {
      if (new Date(log.timestamp) < cutoffDate) {
        await this.storage.remove(`audit_${log.id}`);
        deletedCount++;
      }
    }

    // Clean up old chat history
    const keys = await this.storage.keys();
    const chatKeys = keys.filter(key => key.startsWith('chat_') && key.includes(organizationId));
    
    for (const key of chatKeys) {
      const chatData = await this.storage.get<any>(key);
      if (chatData && new Date(chatData.timestamp) < cutoffDate) {
        await this.storage.remove(key);
        deletedCount++;
      }
    }

    await this.logAuditEvent({
      userId: 'system',
      organizationId,
      action: 'data_retention_cleanup',
      resource: 'data',
      details: { deletedCount, retentionDays },
      result: 'success',
    });

    return deletedCount;
  }

  // SSO Integration
  async configureSSOProvider(organizationId: string, provider: {
    type: 'saml' | 'oidc' | 'oauth2';
    name: string;
    config: Record<string, any>;
  }): Promise<void> {
    const organization = await this.getOrganization(organizationId);
    if (!organization) {
      throw createError(ERROR_CODES.VALIDATION_ERROR, { message: 'Organization not found' });
    }

    const ssoConfig = {
      id: `sso_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      organizationId,
      ...provider,
      createdAt: new Date().toISOString(),
    };

    await this.storage.set(`sso_${ssoConfig.id}`, ssoConfig);

    await this.logAuditEvent({
      userId: 'system',
      organizationId,
      action: 'configure_sso',
      resource: 'sso_provider',
      resourceId: ssoConfig.id,
      details: { type: provider.type, name: provider.name },
      result: 'success',
    });
  }

  // Advanced Analytics for Enterprise
  async generateComplianceReport(organizationId: string): Promise<{
    dataProcessing: {
      totalRecords: number;
      personalDataRecords: number;
      dataRetentionCompliance: boolean;
    };
    security: {
      failedLoginAttempts: number;
      suspiciousActivities: number;
      securityIncidents: number;
    };
    access: {
      totalUsers: number;
      activeUsers: number;
      privilegedUsers: number;
      lastAccessReview: string;
    };
    audit: {
      totalEvents: number;
      criticalEvents: number;
      auditCoverage: number;
    };
  }> {
    const auditLogs = await this.getAuditLogs({ organizationId });
    const organization = await this.getOrganization(organizationId);

    if (!organization) {
      throw createError(ERROR_CODES.VALIDATION_ERROR, { message: 'Organization not found' });
    }

    // Data processing metrics
    const totalRecords = auditLogs.length;
    const personalDataRecords = auditLogs.filter(log => 
      log.details.containsPersonalData === true
    ).length;
    
    const oldestLog = auditLogs.reduce((oldest, log) => 
      new Date(log.timestamp) < new Date(oldest.timestamp) ? log : oldest
    );
    
    const dataAge = Date.now() - new Date(oldestLog.timestamp).getTime();
    const retentionMs = organization.settings.compliance.dataRetention * 24 * 60 * 60 * 1000;
    const dataRetentionCompliance = dataAge <= retentionMs;

    // Security metrics
    const failedLoginAttempts = auditLogs.filter(log => 
      log.action === 'login' && log.result === 'failure'
    ).length;
    
    const suspiciousActivities = auditLogs.filter(log =>
      log.details.suspicious === true
    ).length;
    
    const securityIncidents = auditLogs.filter(log =>
      log.action.includes('security_') && log.result === 'failure'
    ).length;

    // Access metrics
    const users = await this.getOrganizationUsers(organizationId);
    const totalUsers = users.length;
    const activeUsers = users.filter(user => 
      user.lastLogin && 
      Date.now() - new Date(user.lastLogin).getTime() < 30 * 24 * 60 * 60 * 1000 // 30 days
    ).length;
    
    const privilegedUsers = users.filter(user =>
      user.role.permissions.some(p => p.action === 'delete' || p.resource === 'admin')
    ).length;

    // Audit metrics
    const criticalEvents = auditLogs.filter(log =>
      ['delete', 'security_incident', 'data_breach'].includes(log.action)
    ).length;
    
    const auditCoverage = (auditLogs.length / (totalUsers * 100)) * 100; // Simplified calculation

    return {
      dataProcessing: {
        totalRecords,
        personalDataRecords,
        dataRetentionCompliance,
      },
      security: {
        failedLoginAttempts,
        suspiciousActivities,
        securityIncidents,
      },
      access: {
        totalUsers,
        activeUsers,
        privilegedUsers,
        lastAccessReview: organization.updatedAt,
      },
      audit: {
        totalEvents: auditLogs.length,
        criticalEvents,
        auditCoverage,
      },
    };
  }

  // User Management
  async inviteUser(organizationId: string, email: string, roleId: string, invitedBy: string): Promise<void> {
    const organization = await this.getOrganization(organizationId);
    if (!organization) {
      throw createError(ERROR_CODES.VALIDATION_ERROR, { message: 'Organization not found' });
    }

    // Check if organization has reached user limit
    if (organization.memberCount >= organization.settings.features.maxUsers) {
      throw createError(ERROR_CODES.API_LIMIT_EXCEEDED, { 
        message: 'Organization has reached maximum user limit' 
      });
    }

    const invitation = {
      id: `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      organizationId,
      email,
      roleId,
      invitedBy,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    };

    await this.storage.set(`invitation_${invitation.id}`, invitation);

    await this.logAuditEvent({
      userId: invitedBy,
      organizationId,
      action: 'invite_user',
      resource: 'user',
      details: { email, roleId },
      result: 'success',
    });

    // In production, send email invitation
    await this.sendInvitationEmail(invitation);
  }

  async removeUser(organizationId: string, userId: string, removedBy: string): Promise<void> {
    const user = await this.storage.get<User>(`user_${userId}`);
    if (!user || user.organizationId !== organizationId) {
      throw createError(ERROR_CODES.VALIDATION_ERROR, { message: 'User not found in organization' });
    }

    // Update user status instead of deleting (for audit trail)
    const updatedUser = {
      ...user,
      status: 'inactive' as const,
      organizationId: undefined,
      updatedAt: new Date().toISOString(),
    };

    await this.storage.set(`user_${userId}`, updatedUser);

    // Update organization member count
    const organization = await this.getOrganization(organizationId);
    if (organization) {
      await this.updateOrganization(organizationId, {
        memberCount: organization.memberCount - 1,
      });
    }

    await this.logAuditEvent({
      userId: removedBy,
      organizationId,
      action: 'remove_user',
      resource: 'user',
      resourceId: userId,
      details: { removedUser: user.email },
      result: 'success',
    });
  }

  // Security Monitoring
  async detectAnomalousActivity(userId: string): Promise<{
    riskScore: number;
    anomalies: Array<{
      type: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
      timestamp: string;
    }>;
  }> {
    const userLogs = await this.getAuditLogs({ userId, limit: 100 });
    const anomalies: Array<{
      type: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
      timestamp: string;
    }> = [];
    
    let riskScore = 0;

    // Check for unusual login times
    const loginLogs = userLogs.filter(log => log.action === 'login' && log.result === 'success');
    const loginHours = loginLogs.map(log => new Date(log.timestamp).getHours());
    const averageLoginHour = loginHours.reduce((sum, hour) => sum + hour, 0) / loginHours.length;
    
    const recentLogins = loginLogs.slice(0, 5);
    const unusualTimeLogins = recentLogins.filter(log => {
      const hour = new Date(log.timestamp).getHours();
      return Math.abs(hour - averageLoginHour) > 6;
    });

    if (unusualTimeLogins.length > 0) {
      anomalies.push({
        type: 'unusual_login_time',
        description: 'Login at unusual time detected',
        severity: 'medium',
        timestamp: unusualTimeLogins[0].timestamp,
      });
      riskScore += 20;
    }

    // Check for multiple failed login attempts
    const failedLogins = userLogs.filter(log => 
      log.action === 'login' && log.result === 'failure'
    ).slice(0, 10);

    if (failedLogins.length > 3) {
      anomalies.push({
        type: 'multiple_failed_logins',
        description: `${failedLogins.length} failed login attempts detected`,
        severity: 'high',
        timestamp: failedLogins[0].timestamp,
      });
      riskScore += 40;
    }

    // Check for unusual IP addresses
    const ipAddresses = [...new Set(userLogs.map(log => log.ipAddress))];
    if (ipAddresses.length > 5) {
      anomalies.push({
        type: 'multiple_ip_addresses',
        description: 'Access from multiple IP addresses',
        severity: 'medium',
        timestamp: userLogs[0].timestamp,
      });
      riskScore += 15;
    }

    // Check for privilege escalation attempts
    const privilegeChanges = userLogs.filter(log => 
      log.action === 'assign_role' && log.resourceId === userId
    );

    if (privilegeChanges.length > 2) {
      anomalies.push({
        type: 'privilege_escalation',
        description: 'Multiple role changes detected',
        severity: 'high',
        timestamp: privilegeChanges[0].timestamp,
      });
      riskScore += 50;
    }

    return {
      riskScore: Math.min(100, riskScore),
      anomalies,
    };
  }

  // Backup and Recovery
  async createDataBackup(organizationId: string): Promise<{
    backupId: string;
    size: number;
    timestamp: string;
  }> {
    const keys = await this.storage.keys();
    const orgKeys = keys.filter(key => key.includes(organizationId));
    
    const backupData: Record<string, any> = {};
    
    for (const key of orgKeys) {
      const data = await this.storage.get(key);
      if (data) {
        backupData[key] = data;
      }
    }

    const backupId = `backup_${organizationId}_${Date.now()}`;
    const backup = {
      id: backupId,
      organizationId,
      data: backupData,
      timestamp: new Date().toISOString(),
      size: JSON.stringify(backupData).length,
    };

    await this.storage.set(backupId, backup);

    await this.logAuditEvent({
      userId: 'system',
      organizationId,
      action: 'create_backup',
      resource: 'backup',
      resourceId: backupId,
      details: { size: backup.size, recordCount: orgKeys.length },
      result: 'success',
    });

    return {
      backupId,
      size: backup.size,
      timestamp: backup.timestamp,
    };
  }

  // Private helper methods
  private async loadAuditLogs(): Promise<void> {
    const keys = await this.storage.keys();
    const auditKeys = keys.filter(key => key.startsWith('audit_')).slice(-1000); // Load recent logs
    
    const logs = await Promise.all(
      auditKeys.map(key => this.storage.get<AuditLog>(key))
    );

    this.auditLogs = logs.filter(Boolean) as AuditLog[];
  }

  private async getClientIP(): Promise<string> {
    try {
      // In production, this would get the real client IP
      // For now, return a placeholder
      return '127.0.0.1';
    } catch {
      return 'unknown';
    }
  }

  private async sendAuditLogToService(auditLog: AuditLog): Promise<void> {
    try {
      await fetch('/api/audit/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auditLog),
      });
    } catch (error) {
      console.error('Failed to send audit log to service:', error);
    }
  }

  private async sendInvitationEmail(invitation: any): Promise<void> {
    try {
      await fetch('/api/invitations/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invitation),
      });
    } catch (error) {
      console.error('Failed to send invitation email:', error);
    }
  }

  private async getOrganizationUsers(organizationId: string): Promise<User[]> {
    const keys = await this.storage.keys();
    const userKeys = keys.filter(key => key.startsWith('user_'));
    
    const users = await Promise.all(
      userKeys.map(key => this.storage.get<User>(key))
    );

    return users
      .filter(Boolean)
      .filter(user => user!.organizationId === organizationId) as User[];
  }
}

// React Hook for Enterprise Features
export function useEnterpriseFeatures(organizationId?: string) {
  const [manager] = React.useState(() => new EnterpriseManager());
  const [organization, setOrganization] = React.useState<Organization | null>(null);
  const [complianceReport, setComplianceReport] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadOrganizationData = async () => {
      if (!organizationId) {
        setLoading(false);
        return;
      }

      try {
        const org = await manager.getOrganization(organizationId);
        setOrganization(org);

        if (org?.settings.compliance.auditLogging) {
          const report = await manager.generateComplianceReport(organizationId);
          setComplianceReport(report);
        }
      } catch (error) {
        console.error('Failed to load organization data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrganizationData();
  }, [organizationId, manager]);

  const checkPermission = React.useCallback(async (userId: string, resource: string, action: string) => {
    return await manager.checkPermission(userId, resource, action);
  }, [manager]);

  const logAuditEvent = React.useCallback(async (eventData: Omit<AuditLog, 'id' | 'timestamp' | 'ipAddress' | 'userAgent'>) => {
    await manager.logAuditEvent(eventData);
  }, [manager]);

  return {
    manager,
    organization,
    complianceReport,
    loading,
    checkPermission,
    logAuditEvent,
  };
}

// Global enterprise manager instance
let globalEnterpriseManager: EnterpriseManager | null = null;

export function getEnterpriseManager(): EnterpriseManager {
  if (!globalEnterpriseManager) {
    globalEnterpriseManager = new EnterpriseManager();
  }
  return globalEnterpriseManager;
}

// React import for hooks
import React from 'react';