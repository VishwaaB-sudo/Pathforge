import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useUi } from '@/context/UiContext';
import { useSelectors } from './useSelectors';
import { trimRun } from '@/lib/quiz';

/**
 * Starts a quiz run and opens the Run page.
 * kinds: 'pre' diagnostic, 'post' reassessment, 'mist' my mistakes, 'prac' practice a concept.
 */
export function useRunLauncher() {
  const { S } = useApp();
  const { setRun, toast, askScope } = useUi();
  const { Q, me, qset, reassessReady } = useSelectors();
  const navigate = useNavigate();

  const begin = (run) => {
    setRun({ i: 0, ans: {}, ...run });
    navigate('/run');
  };

  /** `c` narrows a diagnostic or practice run to a single concept. */
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

    if (c) qs = qs.filter((q) => q.c === c);
    // diagnostics and reassessments are capped so they stay short
    if (k === 'pre' || k === 'post') qs = trimRun(qs);

    if (!qs.length) {
      toast('No questions available yet.');
      return;
    }
    begin({ k, ids: qs.map((q) => q.id), c });
  };

  /**
   * Asks which subject and concept to cover, then starts the run. Used for the
   * diagnostic and the reassessment, where the student picks the scope first.
   */
  const diagnose = (k = 'pre') =>
    askScope(k).then((scope) => {
      if (scope) startRun(k, scope.concept);
    });

  const retry = (id) => begin({ k: 'mist', ids: [id] });

  return { startRun, diagnose, retry };
}
