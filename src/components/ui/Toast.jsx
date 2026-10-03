import { useUi } from '@/context/UiContext';

export default function Toast() {
  const { toastState } = useUi();
  return (
    <div className={`toast${toastState.show ? ' show' : ''}`} role="status" aria-live="polite">
      {toastState.msg}
    </div>
  );
}
