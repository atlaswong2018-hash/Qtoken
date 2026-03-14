// components/states/EmptyState.tsx
interface EmptyStateProps {
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4 opacity-50">📭</div>
      <h3 className="text-xl font-bold text-white mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-discord-muted mb-6">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="bg-discord-accent hover:bg-[#5865f2] text-white px-6 py-2 rounded-md transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
