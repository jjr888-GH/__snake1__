/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import SnakeGame from './components/SnakeGame';

export default function App() {
  return (
    <main className="bg-zinc-950 min-h-screen text-zinc-100 selection:bg-emerald-500/30 font-sans">
      <SnakeGame />
    </main>
  );
}

