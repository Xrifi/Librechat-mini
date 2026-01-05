import React, { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { SystemRoles } from 'librechat-data-provider';
import { useAuthContext, useLocalize } from '~/hooks';
import PromptAdminSettings from '~/components/Prompts/AdminSettings';
import AgentAdminSettings from '~/components/SidePanel/Agents/AdminSettings';
import MemoryAdminSettings from '~/components/SidePanel/Memories/AdminSettings';
import MCPAdminSettings from '~/components/SidePanel/MCPBuilder/MCPAdminSettings';
import MarketplaceAdminSettings from '~/components/Agents/MarketplaceAdminSettings';
import PeoplePickerAdminSettings from '~/components/Sharing/PeoplePickerAdminSettings';
import UsageOverview from './UsageOverview';
import TopSpenders from './TopSpenders';
import QuotaManagement from './Quotas/QuotaManagement';
import QuotaAssignments from './Quotas/QuotaAssignments';
import UserManagement from './UserManagement';
import AuditLogs from './AuditLogs';

type AdminCardProps = {
  title: string | ReactNode;
  children: ReactNode;
  description?: string;
};

const AdminCard = ({ title, description, children }: AdminCardProps) => (
  <section className="flex h-full flex-col rounded-xl border border-border-light bg-surface-primary p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
    <div className="mb-4">
      <h2 className="text-base font-bold text-text-primary flex items-center gap-2">{title}</h2>
      {description && <p className="mt-1 text-xs text-text-secondary leading-relaxed">{description}</p>}
    </div>
    <div className="flex-1 flex flex-col justify-center">{children}</div>
  </section>
);

const Placeholder = ({ label }: { label: string }) => (
  <div className="rounded-lg border border-dashed border-border-light bg-surface-tertiary p-3 text-[11px] text-text-secondary italic text-center">
    {label}
  </div>
);

const AdminDashboard = () => {
  const localize = useLocalize();
  const { user } = useAuthContext();

  if (user?.role !== SystemRoles.ADMIN) {
    return <Navigate to="/" replace={true} />;
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-surface-primary text-text-primary">
      <header className="border-b border-border-light px-8 py-6 bg-surface-secondary/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">{localize('com_ui_admin_settings')}</h1>
            <p className="mt-1 text-sm text-text-secondary font-medium">
              Système de gestion centralisé : quotas, crédits et usage global.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                import('axios').then(({ default: axios }) => {
                  axios.get('/api/admin/status/export', { responseType: 'blob' })
                    .then(response => {
                      import('downloadjs').then(({ default: download }) => {
                        download(response.data, 'usage_export.csv', 'text/csv');
                      });
                    })
                    .catch(err => {
                      console.error('Export failed', err);
                      alert('Export failed');
                    });
                });
              }}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-surface-tertiary border border-border-light hover:bg-surface-secondary transition-colors"
            >
              Exporter usage
            </button>
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-auto px-8 py-8 custom-scrollbar">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <AdminCard
            title="Overview du Système"
            description="Métriques clés de l'instance LibreChat."
          >
            <UsageOverview />
          </AdminCard>

          <AdminCard
            title="Profils de Quotas"
            description="Configuration des limites de crédits par période."
          >
            <QuotaManagement />
          </AdminCard>

          <AdminCard
            title="Top Consommateurs"
            description="Utilisateurs les plus actifs sur la période en cours."
          >
            <TopSpenders />
          </AdminCard>

          <AdminCard
            title="Attributions de Quotas"
            description="Associer des profils aux utilisateurs, rôles ou groupes."
          >
            <QuotaAssignments />
          </AdminCard>

          <AdminCard
            title="Gestion des Utilisateurs"
            description="Consulter la liste des utilisateurs et ajuster leurs crédits manuellement."
          >
            <UserManagement />
          </AdminCard>

          <AdminCard
            title="Journal d'Audit"
            description="Journal des modifications effectuées par les administrateurs."
          >
            <AuditLogs />
          </AdminCard>

          {/* Existing Admin Sections */}
          <AdminCard
            title={localize('com_ui_admin_settings_section', {
              section: localize('com_ui_prompts'),
            })}
          >
            <PromptAdminSettings />
          </AdminCard>
          <AdminCard
            title={localize('com_ui_admin_settings_section', { section: localize('com_ui_agents') })}
          >
            <AgentAdminSettings />
          </AdminCard>
          <AdminCard
            title={localize('com_ui_admin_settings_section', {
              section: localize('com_ui_memories'),
            })}
          >
            <MemoryAdminSettings />
          </AdminCard>
          <AdminCard
            title={localize('com_ui_admin_settings_section', {
              section: localize('com_ui_marketplace'),
            })}
          >
            <MarketplaceAdminSettings />
          </AdminCard>
          <AdminCard
            title={localize('com_ui_admin_settings_section', {
              section: localize('com_ui_mcp_servers'),
            })}
          >
            <MCPAdminSettings />
          </AdminCard>
          <AdminCard
            title={localize('com_ui_admin_settings_section', {
              section: localize('com_ui_people_picker'),
            })}
          >
            <PeoplePickerAdminSettings />
          </AdminCard>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
