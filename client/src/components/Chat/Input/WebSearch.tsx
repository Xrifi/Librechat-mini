import React, { memo } from 'react';
import { Globe } from 'lucide-react';
import { CheckboxButton } from '@librechat/client';
import { Permissions, PermissionTypes, EModelEndpoint } from 'librechat-data-provider';
import { useLocalize, useHasAccess } from '~/hooks';
import { useBadgeRowContext } from '~/Providers';

function WebSearch() {
  const localize = useLocalize();
  const { webSearch: webSearchData, searchApiKeyForm, endpoint } = useBadgeRowContext();
  const { toggleState: webSearch, debouncedChange, isPinned, authData } = webSearchData;
  const { badgeTriggerRef } = searchApiKeyForm;

  const isGemini =
    endpoint === EModelEndpoint.google ||
    endpoint === 'google' ||
    endpoint === 'vertexai' ||
    (!!endpoint && typeof endpoint === 'string' && endpoint.toLowerCase().includes('google'));

  console.log('[WebSearch] endpoint:', endpoint, 'isGemini:', isGemini);

  const canUseWebSearch = useHasAccess({
    permissionType: PermissionTypes.WEB_SEARCH,
    permission: Permissions.USE,
  });

  if (!canUseWebSearch) {
    return null;
  }

  const isVisible = isPinned || (webSearch && authData?.authenticated) || isGemini;

  return (
    isVisible && (
      <CheckboxButton
        ref={badgeTriggerRef}
        className="max-w-fit"
        checked={webSearch}
        setValue={debouncedChange}
        label={isGemini ? 'Google Search' : localize('com_ui_search')}
        isCheckedClassName={
          isGemini
            ? 'border-blue-500 bg-blue-500/20 text-blue-700 dark:text-blue-400 hover:bg-blue-600/20'
            : 'border-blue-600/40 bg-blue-500/10 hover:bg-blue-700/10'
        }
        icon={
          <Globe
            className={isGemini ? 'icon-md text-blue-600 dark:text-blue-400' : 'icon-md'}
            aria-hidden="true"
          />
        }
      />
    )
  );
}

export default memo(WebSearch);
