# 📋 npm Publishing Checklist for @vimazing/vim-sudoku

## 🔴 Critical (Must Fix Before Publishing)

- [ ] **Fix TypeScript build errors** - Package won't compile
  - [ ] `Sudoku.ts`: operator type issues (lines 77, 93, 95)
  - [ ] `useBoardState.ts`: remove unused `useCallback`, `useMemo` imports
  - [ ] `types.ts`: remove non-existent `BoardString` export
  - [ ] Remove unused variables: `idx`, `max_square`

- [ ] **Add LICENSE file** - Required for MIT license in package.json

- [ ] **Update package.json author** - Currently `you@example.com`

## 🟡 Important (Should Fix)

- [ ] **Update README.md**
  - [ ] Remove "coming soon" for win detection (✅ implemented!)
  - [ ] Document new `validateMoves` option in `useGame`
  - [ ] Update scoring formula to include move penalty

- [ ] **Fix tsconfig.json** - Conflicting `declaration` and `emitDeclarationOnly` flags

- [ ] **Verify exports** - Check `src/index.ts` exports everything needed

- [ ] **Add CHANGELOG.md** - Document version history and changes

- [ ] **Add package.json keywords** - Improve npm discoverability (sudoku, vim, react, game, puzzle)

- [ ] **Update .npmignore** - Verify `example/` is excluded

## 🟢 Nice to Have

- [ ] **Test locally** - Run `npm pack` and inspect tarball contents

- [ ] **Add npm badges** - Version and downloads badges in README

- [ ] **Add engines field** - Specify Node.js version requirements

- [ ] **GitHub topics** - Add repository tags for discoverability

---

**Total: 18 tasks** (6 critical, 6 important, 6 nice-to-have)

**Status:** Ready to start working on critical issues 🚀
