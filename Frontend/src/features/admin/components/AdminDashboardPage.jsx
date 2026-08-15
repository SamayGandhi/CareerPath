/**
 * AdminDashboardPage.jsx
 * -----------------------------------------
 * Orchestrator wiring AdminLayout to all sections. FINAL — completes
 * the Admin Dashboard and the entire approved page list.
 */

import { useState } from 'react';
import AdminLayout from './AdminLayout';
import AdminOverviewTab from './AdminOverviewTab';
import AdminUsersTab from './AdminUsersTab';
import AdminAuditLogsTab from './AdminAuditLogsTab';
import AdminContentTab from './AdminContentTab';
import AdminQuestionBankTab from './AdminQuestionBankTab';
import AdminReviewsTab from './AdminReviewsTab';
import AdminAiReliabilityTab from './AdminAiReliabilityTab';
import AdminFeatureFlagsTab from './AdminFeatureFlagsTab';
import { adminApi } from '../admin.api';

export default function AdminDashboardPage() {
  const [activeSection, setActiveSection] = useState('overview');

  return (
    <AdminLayout activeSection={activeSection} onChange={setActiveSection}>
      {activeSection === 'overview' && <AdminOverviewTab adminApi={adminApi} />}
      {activeSection === 'users' && <AdminUsersTab />}
      {activeSection === 'content' && <AdminContentTab />}
      {activeSection === 'questions' && <AdminQuestionBankTab />}
      {activeSection === 'reviews' && <AdminReviewsTab />}
      {activeSection === 'auditLogs' && <AdminAuditLogsTab />}
      {activeSection === 'aiReliability' && <AdminAiReliabilityTab />}
      {activeSection === 'featureFlags' && <AdminFeatureFlagsTab />}
    </AdminLayout>
  );
}