import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import { IconButton, Tooltip } from '@mui/material';
import { useState } from 'react';
import { Domain } from '@/models';
import { ConfirmDialog } from './confirm-dialog';
import { IconSettingsDialog } from './icon-settings/icon-settings-dialog';

export function DomainActions({
  domain,
  deleteDomain,
}: {
  domain: Domain;
  deleteDomain?: () => void;
}) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  return (
    <div>
      <Tooltip title='Configure icon bindings'>
        <IconButton
          onClick={() => {
            setShowSettingsDialog(true);
          }}
        >
          <SettingsIcon />
        </IconButton>
      </Tooltip>
      {domain.isCustom ? (
        <Tooltip title='Delete custom domain'>
          <IconButton
            onClick={() => {
              setShowConfirmDialog(true);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : null}

      <ConfirmDialog
        title='Delete domain'
        message={`Are you sure to delete the domain ${domain.name}?`}
        onConfirm={() => {
          deleteDomain?.();
          setShowConfirmDialog(false);
        }}
        onCancel={() => {
          setShowConfirmDialog(false);
        }}
        show={showConfirmDialog}
      />

      <IconSettingsDialog
        domain={domain}
        onClose={() => {
          setShowSettingsDialog(false);
        }}
        show={showSettingsDialog}
      />
    </div>
  );
}
