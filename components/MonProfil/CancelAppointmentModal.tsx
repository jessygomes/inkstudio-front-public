/* eslint-disable react/no-unescaped-entities */
interface CancelAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reason: string;
  onReasonChange: (reason: string) => void;
  isLoading: boolean;
}

export default function CancelAppointmentModal({
  isOpen,
  onClose,
  onConfirm,
  reason,
  onReasonChange,
  isLoading,
}: CancelAppointmentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-noir-700/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-white/[0.12] to-white/[0.06] backdrop-blur-xl border border-white/20 rounded-xl p-6 max-w-md w-full shadow-2xl">
        <h3 className="text-white font-one font-semibold text-xl mb-4">
          Annuler le rendez-vous
        </h3>

        <p className="text-white/80 font-one text-sm mb-4">
          Êtes-vous sûr de vouloir annuler ce rendez-vous ? Cette action est
          irréversible.
        </p>

        <div className="mb-6">
          <label className="text-white/90 font-one text-sm mb-2 block">
            Raison de l'annulation (optionnel)
          </label>
          <textarea
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Ex: Empêchement personnel, changement de planning..."
            className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-tertiary-400 focus:ring-2 focus:ring-tertiary-400/20 transition-all duration-300 resize-none"
            rows={3}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="cursor-pointer flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 rounded-lg font-one text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Retour
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="cursor-pointer flex-1 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 border border-red-500/30 hover:border-red-400/50 rounded-lg font-one text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-300 border-t-transparent"></div>
                Annulation...
              </span>
            ) : (
              "Confirmer l'annulation"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
