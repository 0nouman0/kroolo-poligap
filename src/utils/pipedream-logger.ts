/**
 * Comprehensive logging utility for Pipedream integration flow
 * Provides structured logging with timestamps, context, and proper formatting
 */

interface LogContext {
  userId?: string;
  companyId?: string;
  platformId?: string;
  appName?: string;
  accountId?: string;
  userEmail?: string;
}

interface PipedreamResponse {
  id?: string;
  app?: string;
  external_user_id?: string;
  created_at?: string;
  updated_at?: string;
  account?: {
    id?: string;
    name?: string;
    credentials?: any;
    [key: string]: any;
  };
  [key: string]: any;
}

class PipedreamLogger {
  private context: LogContext = {};

  constructor(context?: LogContext) {
    if (context) {
      this.context = context;
    }
  }

  private formatLog(level: string, message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const contextStr = Object.keys(this.context).length > 0 
      ? `[${Object.entries(this.context).map(([k, v]) => `${k}:${v}`).join(', ')}]` 
      : '';
    
    const logMessage = `🔌 PIPEDREAM ${level.toUpperCase()} ${timestamp} ${contextStr} - ${message}`;
    
    if (level === 'error') {
      console.error(logMessage, data || '');
    } else if (level === 'warn') {
      console.warn(logMessage, data || '');
    } else {
      console.log(logMessage, data || '');
    }
  }

  // Update context for the logger instance
  setContext(context: Partial<LogContext>): void {
    this.context = { ...this.context, ...context };
  }

  // Connection flow logging methods
  logConnectionStart(appName: string, platformId: string): void {
    this.setContext({ appName, platformId });
    this.formatLog('info', `🚀 Starting connection process for ${appName}`);
  }

  logTokenGeneration(token: string): void {
    this.formatLog('info', `🎫 Token generated successfully`, { 
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 20) + '...'
    });
  }

  logTokenError(error: any): void {
    this.formatLog('error', `❌ Token generation failed`, error);
  }

  logPipedreamResponse(data: PipedreamResponse): void {
    this.formatLog('info', `🪝 Pipedream connection response received`, {
      accountId: data.id,
      app: data.app,
      external_user_id: data.external_user_id,
      created_at: data.created_at,
      hasCredentials: !!data.account?.credentials
    });
  }

  logFullAccountDetails(accountData: any): void {
    this.formatLog('info', `🔍 Full account details fetched`, {
      accountId: accountData?.account?.id,
      accountName: accountData?.account?.name,
      hasCredentials: !!accountData?.account?.credentials,
      credentialKeys: accountData?.account?.credentials ? Object.keys(accountData.account.credentials) : []
    });
  }

  logEmailMismatch(connectedEmail: string, userEmail: string, serviceName: string): void {
    this.formatLog('warn', `⚠️ EMAIL MISMATCH DETECTED for ${serviceName}`, {
      connectedEmail,
      userEmail,
      serviceName,
      securityRisk: 'HIGH'
    });
  }

  logEmailValidation(connectedEmail: string, userEmail: string, isValid: boolean): void {
    this.formatLog('info', `📧 Email validation ${isValid ? 'PASSED' : 'FAILED'}`, {
      connectedEmail,
      userEmail,
      isValid
    });
  }

  logDatabaseOperation(operation: string, result: any): void {
    this.formatLog('info', `💾 Database operation: ${operation}`, {
      success: result.code === 200,
      message: result.message,
      code: result.code
    });
  }

  logFastApiNotification(payload: any, success: boolean): void {
    this.formatLog('info', `🚀 FastAPI notification ${success ? 'SUCCESS' : 'FAILED'}`, {
      success,
      payloadKeys: Object.keys(payload),
      userId: payload.user_id,
      companyId: payload.company_id
    });
  }

  logIngestionStart(ingestionBody: any): void {
    this.formatLog('info', `📥 Starting data ingestion`, {
      services: ingestionBody.services,
      external_user_id: ingestionBody.external_user_id,
      websocket_session_id: ingestionBody.websocket_session_id,
      accountFields: Object.keys(ingestionBody).filter(key => key.startsWith('account_'))
    });
  }

  logConnectionComplete(appName: string, accountId: string): void {
    this.formatLog('info', `✅ Connection completed successfully for ${appName}`, {
      accountId,
      timestamp: new Date().toISOString()
    });
  }

  logConnectionError(appName: string, error: any): void {
    this.formatLog('error', `❌ Connection failed for ${appName}`, {
      error: error.message || error,
      stack: error.stack
    });
  }

  logSecurityAction(action: string, reason: string, details?: any): void {
    this.formatLog('warn', `🛡️ SECURITY ACTION: ${action}`, {
      reason,
      timestamp: new Date().toISOString(),
      ...details
    });
  }

  // Utility method to log any step with custom formatting
  logStep(stepName: string, data?: any, level: 'info' | 'warn' | 'error' = 'info'): void {
    this.formatLog(level, `📋 Step: ${stepName}`, data);
  }
}

// Export singleton instance and class for flexibility
export const pipedreamLogger = new PipedreamLogger();
export { PipedreamLogger };

// Export convenience functions for quick logging
export const logPipedreamStep = (stepName: string, data?: any, level: 'info' | 'warn' | 'error' = 'info') => {
  pipedreamLogger.logStep(stepName, data, level);
};

