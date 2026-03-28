import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  private isChunkError(error: Error | null): boolean {
    if (!error) return false;
    const msg = error.message || '';
    return (
      msg.includes('Failed to fetch dynamically imported module') ||
      msg.includes('Loading chunk') ||
      msg.includes('Loading CSS chunk') ||
      msg.includes('Importing a module script failed')
    );
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const isChunk = this.isChunkError(this.state.error);

      return (
        <div
          className="flex flex-col items-center justify-center gap-4 p-8 text-center"
          style={{ minHeight: '40vh' }}
        >
          <div className="text-4xl">{isChunk ? '🔄' : '⚠️'}</div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {isChunk ? 'Yeni güncelleme mevcut' : 'Bir hata oluştu'}
          </h2>
          <p className="max-w-md text-sm" style={{ color: 'var(--text-secondary)' }}>
            {isChunk
              ? 'Site güncellenmiş. Sayfayı yenileyerek son sürümü yükleyebilirsiniz.'
              : (this.state.error?.message || 'Beklenmeyen bir hata meydana geldi.')}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            style={{
              background: 'var(--text-accent)',
              color: '#1a1a2e',
            }}
          >
            {isChunk ? 'Sayfayı Yenile' : 'Tekrar Dene'}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
