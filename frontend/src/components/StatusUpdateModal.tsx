import React from 'react';
import Modal from './Modal';
import FormField from './FormField';

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (newStatus: string) => void;
  currentStatus: string;
  availableStatuses: { value: string; label: string; description?: string }[];
  title: string;
  loading?: boolean;
}

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
  currentStatus,
  availableStatuses,
  title,
  loading = false
}) => {
  const [selectedStatus, setSelectedStatus] = React.useState(currentStatus);

  React.useEffect(() => {
    setSelectedStatus(currentStatus);
  }, [currentStatus, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStatus !== currentStatus) {
      onUpdate(selectedStatus);
    } else {
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedStatus(currentStatus);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-4">
            Current status: <span className="font-medium">{currentStatus}</span>
          </p>
        </div>

        <FormField
          label="New Status"
          name="status"
          type="select"
          value={selectedStatus}
          onChange={(value) => setSelectedStatus(value)}
          required
          options={availableStatuses}
        />

        {selectedStatus !== currentStatus && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              This will change the status from <strong>{currentStatus}</strong> to <strong>{selectedStatus}</strong>.
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={loading || selectedStatus === currentStatus}
          >
            {loading ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default StatusUpdateModal;
