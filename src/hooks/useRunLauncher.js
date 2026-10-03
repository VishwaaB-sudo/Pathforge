import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useUi } from '@/context/UiContext';
import { useSelectors } from './useSelectors';

/**
 * Starts a quiz run and opens the Run page.
 * kinds: 'pre' diagnostic, 'post' reassessment, 'mist' my mistakes, 'prac' practice a concept.
 */
export function useRunLauncher() {
  const { S } = useApp();
  const { setRun, toast } = useUi();
  const { Q, me, qset, reassessReady } = useSelectors();
  const navigate = useNavigate();

  const begin = (run) => {
    setRun({ i: 0, ans: {}, ...run });
    navigate('/run');
  };

  const startRun = (k, c) => {
    let qs;
    if (k === 'pre') qs = qset('pre');
    else if (k === 'post') {
      if (!reassessReady()) {
        toast('Reassessment unlocks after faculty verifies your applied task.');
        return;
      }
      qs = qset('post');
    } else if (k === 'mist') qs = me.mist.map((x) => Q(x.id)).filter(Boolean);
    else qs = S.qs.filter((q) => q.c === c);

    if (!qs.length) {
      toast('No questions available yet.');
      return;
    }
    begin({ k, ids: qs.map((q) => q.id), c });
  };

  const retry = (id) => begin({ k: 'mist', ids: [id] });

  return { startRun, retry };
}
