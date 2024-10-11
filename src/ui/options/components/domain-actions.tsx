import { Domain } from '@/models';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import { IconButton } from '@mui/material';
import { useState } from 'react';
import { ConfirmDialog } from './confirm-dialog';
import { IconSettingsDialog } from './icon-settings-dialog';

export function DomainActions({
  domain,
  deleteDomain,
}: { domain: Domain; deleteDomain: () => void }) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  return (
    <div>
      <IconButton
        onClick={() => {
          setShowSettingsDialog(true);
        }}
      >
        <SettingsIcon />
      </IconButton>
      {domain.isCustom ? (
        <IconButton
          onClick={() => {
            setShowConfirmDialog(true);
          }}
        >
          <DeleteIcon />
        </IconButton>
      ) : null}

      <ConfirmDialog
        title='Delete domain'
        message={`Are you sure to delete the domain ${domain.name}?`}
        onConfirm={() => {
          deleteDomain();
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
