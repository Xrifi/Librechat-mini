import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { SystemRoles } from 'librechat-data-provider';
import { useAuthContext, useLocalize } from '~/hooks';
import PromptAdminSettings from '~/components/Prompts/AdminSettings';
import AgentAdminSettings from '~/components/SidePanel/Agents/AdminSettings';
import MemoryAdminSettings from '~/components/SidePanel/Memories/AdminSettings';
import MCPAdminSettings from '~/components/SidePanel/MCPBuilder/MCPAdminSettings';
import MarketplaceAdminSettings from '~/components/Agents/MarketplaceAdminSettings';
import PeoplePickerAdminSettings from '~/components/Sharing/PeoplePickerAdminSettings';

type AdminCardProps = {
  title: string;
  children: ReactNode;
  description?: string;
};

const AdminCard = ({ title, description, children }: AdminCardProps) => (
  <section className="flex h-full flex-col rounded-xl border border-border-light bg-surface-primary p-4 shadow-sm">
    <div className="mb-4">
      <h2 className="text-base font-semibold text-text-primary">{title}</h2>
      {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
    </div>
    <div className="mt-auto">{children}</div>
  </section>
);

const Placeholder = ({ label }: { label: string }) => (
  <div className="rounded-lg border border-dashed border-border-light bg-surface-tertiary p-3 text-sm text-text-secondary">
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
      <header className="border-b border-border-light px-6 py-4">
        <h1 className="text-lg font-semibold">{localize('com_ui_admin_settings')}</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Regrouper la gouvernance d’usage, la gestion des quotas et les contrôles d’accès.
        </p>
      </header>
      <div className="flex-1 overflow-auto px-6 py-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AdminCard
            title="Tableau de bord d’usage global"
            description="Suivre l’activité, les tokens et les modèles les plus utilisés."
          >
            <Placeholder label="Bientôt disponible : métriques agrégées par période, modèles et endpoints." />
          </AdminCard>
          <AdminCard
            title="Gestion des quotas par utilisateur ou groupe"
            description="Définir des limites par période, par modèle ou par endpoint."
          >
            <Placeholder label="Bientôt disponible : édition des quotas par utilisateur/groupe." />
          </AdminCard>
          <AdminCard
            title="Suivi détaillé de la consommation individuelle"
            description="Consulter l’historique des sessions et tokens consommés."
          >
            <Placeholder label="Bientôt disponible : journal des usages par utilisateur." />
          </AdminCard>
          <AdminCard
            title="Alertes et notifications"
            description="Configurer des alertes de dépassement ou d’approche de quota."
          >
            <Placeholder label="Bientôt disponible : notifications et blocage automatique." />
          </AdminCard>
          <AdminCard
            title="Contrôle des modèles et endpoints"
            description="Activer ou restreindre l’accès par rôle, utilisateur ou groupe."
          >
            <Placeholder label="Bientôt disponible : règles d’accès par fournisseur/modèle." />
          </AdminCard>
          <AdminCard
            title="Paramétrage dynamique des quotas par rôles"
            description="Associer des règles de quotas selon les rôles."
          >
            <Placeholder label="Bientôt disponible : profils de quotas par rôle." />
          </AdminCard>
          <AdminCard
            title="Gestion des crédits / balances token"
            description="Configurer les crédits initiaux et le rechargement automatique."
          >
            <Placeholder label="Bientôt disponible : crédits, auto-refill et intervalles." />
          </AdminCard>
          <AdminCard
            title="Rapports exportables et archivage"
            description="Exporter les usages et quotas (CSV/JSON)."
          >
            <Placeholder label="Bientôt disponible : exports et archivage." />
          </AdminCard>
          <AdminCard
            title="Gestion des utilisateurs et des permissions"
            description="Activer/suspendre, réinitialiser des compteurs ou permissions."
          >
            <Placeholder label="Bientôt disponible : liste des utilisateurs et actions admin." />
          </AdminCard>
          <AdminCard
            title="Logs et historique d’actions administratives"
            description="Tracer les modifications effectuées par les administrateurs."
          >
            <Placeholder label="Bientôt disponible : audit trail des actions." />
          </AdminCard>
          <AdminCard
            title="Réglages avancés"
            description="Ajuster les paramètres d’usage et politiques d’accès."
          >
            <Placeholder label="Bientôt disponible : réglages avancés et politiques." />
          </AdminCard>
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
