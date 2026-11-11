// @vitest-environment jsdom
import { it, expect } from 'vitest';
it('imports vendored GraphWidget', async () => {
  const m = await import('@/page-layout/widgets/graph/components/GraphWidget');
  expect(m).toBeTruthy();
});
