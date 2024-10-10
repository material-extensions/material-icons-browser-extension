import { Domain } from '@/models';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton } from '@mui/material';
import { useState } from 'react';
import { ConfirmDialog } from './confirm-dialog';

export function DomainActions({
  domain,
  deleteDomain,
}: { domain: Domain; deleteDomain: () => void }) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  return (
    <div>
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
    </div>
  );
}
